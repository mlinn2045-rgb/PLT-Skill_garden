export interface ChapterProgress {
    videoCompleted: boolean
    pdfCompleted: boolean
    quizCompleted: boolean
    quizScore?: number
    quizXpEarned?: number
    quizGrowthEarned?: number
}

export interface LessonProgress {
    lessonId: number | string
    videoCompleted: boolean
    watchPercent: number
    watchedSeconds: number
    duration: number
    updatedAt?: number
}

const progressKey = (skillId: string, chapterId: string, userKey: string) =>
    `skillgarden-progress-${userKey}-${skillId}-${chapterId}`

const lessonProgressKey = (skillId: string, lessonId: number | string, userKey: string) =>
    `skillgarden-lesson-progress-${userKey}-${skillId}-${lessonId}`

export const getLessonProgress = (
    skillId: string,
    lessonId: number | string,
    userKey = 'guest'
): LessonProgress => {
    const saved = localStorage.getItem(lessonProgressKey(skillId, lessonId, userKey))
    if (!saved) {
        return {
            lessonId,
            videoCompleted: false,
            watchPercent: 0,
            watchedSeconds: 0,
            duration: 0,
        }
    }

    try {
        const parsed = JSON.parse(saved) as Partial<LessonProgress>
        return {
            lessonId,
            videoCompleted: parsed.videoCompleted === true,
            watchPercent: typeof parsed.watchPercent === 'number' ? parsed.watchPercent : 0,
            watchedSeconds: typeof parsed.watchedSeconds === 'number' ? parsed.watchedSeconds : 0,
            duration: typeof parsed.duration === 'number' ? parsed.duration : 0,
            updatedAt: parsed.updatedAt,
        }
    } catch {
        return {
            lessonId,
            videoCompleted: false,
            watchPercent: 0,
            watchedSeconds: 0,
            duration: 0,
        }
    }
}

export const updateLessonProgress = (
    skillId: string,
    lessonId: number | string,
    updates: Partial<LessonProgress>,
    userKey = 'guest',
    chapterId?: string
): LessonProgress => {
    const current = getLessonProgress(skillId, lessonId, userKey)
    const next: LessonProgress = {
        ...current,
        ...updates,
        lessonId,
        updatedAt: Date.now(),
    }

    if (next.videoCompleted) {
        next.watchPercent = 100
    }

    localStorage.setItem(lessonProgressKey(skillId, lessonId, userKey), JSON.stringify(next))

    // Sync with chapter progress if chapterId is known or can be mapped
    if (chapterId) {
        if (next.videoCompleted) {
            updateChapterProgress(skillId, { videoCompleted: true }, chapterId, userKey)
        }
    }

    return next
}

export const getChapterProgress = (skillId: string, chapterId = '1', userKey = 'guest'): ChapterProgress => {
    const savedProgress = localStorage.getItem(progressKey(skillId, chapterId, userKey))
    if (!savedProgress) return { videoCompleted: false, pdfCompleted: false, quizCompleted: false }

    try {
        const parsedProgress = JSON.parse(savedProgress) as Partial<ChapterProgress>
        return {
            videoCompleted: parsedProgress.videoCompleted === true,
            pdfCompleted: parsedProgress.pdfCompleted === true,
            quizCompleted: parsedProgress.quizCompleted === true,
            quizScore: typeof parsedProgress.quizScore === 'number' ? parsedProgress.quizScore : undefined,
            quizXpEarned: typeof parsedProgress.quizXpEarned === 'number' ? parsedProgress.quizXpEarned : undefined,
            quizGrowthEarned: typeof parsedProgress.quizGrowthEarned === 'number' ? parsedProgress.quizGrowthEarned : undefined,
        }
    } catch {
        localStorage.removeItem(progressKey(skillId, chapterId, userKey))
        return { videoCompleted: false, pdfCompleted: false, quizCompleted: false }
    }
}

export const updateChapterProgress = (
    skillId: string,
    updates: Partial<ChapterProgress>,
    chapterId = '1',
    userKey = 'guest'
): ChapterProgress => {
    const nextProgress = { ...getChapterProgress(skillId, chapterId, userKey), ...updates }
    localStorage.setItem(progressKey(skillId, chapterId, userKey), JSON.stringify(nextProgress))
    return nextProgress
}

export const isChapterQuizUnlocked = (skillId: string, chapterId = '1', userKey = 'guest') => {
    const progress = getChapterProgress(skillId, chapterId, userKey)
    return progress.videoCompleted && progress.pdfCompleted
}

export const isSkillGrowing = (skillId: string, userKey = 'guest') => {
    return getSkillGrowth(skillId, userKey).progress > 0
}

export const getSkillGrowth = (skillId: string, userKey = 'guest') => {
    const chapters = ['1', '2', '3', '4'].map(chapterId => getChapterProgress(skillId, chapterId, userKey))

    let totalGrowth = 0
    chapters.forEach(ch => {
        if (ch.videoCompleted) {
            totalGrowth += 10
        }
        if (ch.pdfCompleted) {
            totalGrowth += 5
        }
        if (ch.quizCompleted) {
            // Mỗi câu đúng +5% tăng trưởng cho cây (tối đa 15% cho 3 câu)
            const quizGrowth = typeof ch.quizGrowthEarned === 'number' ? ch.quizGrowthEarned : 15
            totalGrowth += quizGrowth
        }
    })

    const progress = Math.min(100, totalGrowth)

    if (progress >= 100) {
        return { stageName: 'Đơm hoa 🌸' as const, stageLevel: 4, progress: 100, xpEarned: 300 }
    }
    if (progress >= 50) {
        return { stageName: 'Cây xòe lá 🌿' as const, stageLevel: 3, progress, xpEarned: 200 }
    }
    if (progress > 0) {
        return { stageName: 'Mầm xanh 🌱' as const, stageLevel: 2, progress, xpEarned: 100 }
    }
    return { stageName: 'Hạt giống 🌰' as const, stageLevel: 1, progress: 0, xpEarned: 0 }
}

export const isSkillCompleted = (skillId: string, userKey = 'guest') =>
    getSkillGrowth(skillId, userKey).progress >= 100

export const isChapterUnlocked = (skillId: string, chapterId: string, userKey = 'guest') => {
    const chapterNumber = Number(chapterId)
    if (chapterNumber <= 1) return true
    return getChapterProgress(skillId, String(chapterNumber - 1), userKey).quizCompleted
}

/**
 * Sequential unlock verification for lessons in a course.
 * Rule: Lesson 0 (first) is unlocked.
 * Lesson N is unlocked ONLY IF Lesson N-1 has completed 100% of its video.
 */
export const isLessonItemUnlocked = (
    index: number,
    lessons: Array<{ id: number | string; chapterId?: string; is_completed?: boolean }>,
    skillId: string,
    userKey = 'guest'
): boolean => {
    if (index <= 0) return true

    const prevLesson = lessons[index - 1]
    if (!prevLesson) return false

    // Check backend is_completed flag
    if (prevLesson.is_completed === true) return true

    // Check local lesson progress
    const localLessonProg = getLessonProgress(skillId, prevLesson.id, userKey)
    if (localLessonProg.videoCompleted) return true

    // Check chapter progress if chapterId is present
    if (prevLesson.chapterId) {
        const chapProg = getChapterProgress(skillId, prevLesson.chapterId, userKey)
        if (chapProg.videoCompleted) return true
    }

    return false
}

export interface LessonWithSequentialStatus {
    id: number
    title: string
    videoUrl?: string
    description?: string
    moduleTitle?: string
    moduleOrder: number
    chapterId: string
    orderIndex: number
    duration: string
    status: 'completed' | 'active' | 'locked'
    isUnlocked: boolean
    isCompleted: boolean
    watchPercent: number
    watchedSeconds: number
    progress: ChapterProgress
}

/**
 * Compute sequential unlock and watch progress for a list of lessons.
 */
export const calculateSequentialLessons = (
    rawLessons: any[],
    skillId: string,
    userKey = 'guest'
): LessonWithSequentialStatus[] => {
    if (!rawLessons || rawLessons.length === 0) return []

    // Sort by module_order ASC, order_index ASC, id ASC
    const sorted = [...rawLessons].sort((a, b) => {
        const modA = Number(a.moduleOrder ?? a.module_order ?? a.chapterId ?? 1)
        const modB = Number(b.moduleOrder ?? b.module_order ?? b.chapterId ?? 1)
        if (modA !== modB) return modA - modB

        const ordA = Number(a.orderIndex ?? a.order_index ?? 1)
        const ordB = Number(b.orderIndex ?? b.order_index ?? 1)
        if (ordA !== ordB) return ordA - ordB

        return Number(a.id) - Number(b.id)
    })

    let previousCompleted = true // First lesson is always unlocked

    return sorted.map((item, index) => {
        const lid = Number(item.id)
        const chapId = String(item.chapterId ?? item.moduleOrder ?? item.module_order ?? 1)
        const chapProg = getChapterProgress(skillId, chapId, userKey)
        const localLessonProg = getLessonProgress(skillId, lid, userKey)

        const isCompleted = Boolean(
            item.is_completed === true ||
            localLessonProg.videoCompleted ||
            (chapProg.videoCompleted && String(chapId) === String(item.chapterId))
        )

        const isUnlocked = index === 0 || previousCompleted

        const status: 'completed' | 'active' | 'locked' = isCompleted
            ? 'completed'
            : isUnlocked
            ? 'active'
            : 'locked'

        const watchPercent = isCompleted ? 100 : localLessonProg.watchPercent || 0
        const watchedSeconds = localLessonProg.watchedSeconds || item.video_watch_seconds || 0

        // Update previousCompleted for next iteration
        previousCompleted = isCompleted

        return {
            id: lid,
            title: item.title || `Bài học #${lid}`,
            videoUrl: item.videoUrl || item.video_url || '',
            description: item.description || '',
            moduleTitle: item.moduleTitle || item.module_title || `Chương ${chapId}`,
            moduleOrder: Number(item.moduleOrder ?? item.module_order ?? chapId),
            chapterId: chapId,
            orderIndex: Number(item.orderIndex ?? item.order_index ?? (index + 1)),
            duration: item.duration || '15:00',
            status,
            isUnlocked,
            isCompleted,
            watchPercent,
            watchedSeconds,
            progress: chapProg,
        }
    })
}
