export interface ChapterProgress {
    videoCompleted: boolean
    pdfCompleted: boolean
    quizCompleted: boolean
}

const progressKey = (skillId: string, chapterId: string, userKey: string) =>
    `skillgarden-progress-${userKey}-${skillId}-${chapterId}`

export const getChapterProgress = (skillId: string, chapterId = '1', userKey = 'guest'): ChapterProgress => {
    const savedProgress = localStorage.getItem(progressKey(skillId, chapterId, userKey))
    if (!savedProgress) return { videoCompleted: false, pdfCompleted: false, quizCompleted: false }

    try {
        const parsedProgress = JSON.parse(savedProgress) as Partial<ChapterProgress>
        return {
            videoCompleted: parsedProgress.videoCompleted === true,
            pdfCompleted: parsedProgress.pdfCompleted === true,
            quizCompleted: parsedProgress.quizCompleted === true,
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
    const chapters = ['1', '2', '3'].map(chapterId => getChapterProgress(skillId, chapterId, userKey))

    let totalScore = 0
    chapters.forEach(ch => {
        if (ch.quizCompleted) {
            totalScore += 100
        } else if (ch.videoCompleted && ch.pdfCompleted) {
            totalScore += 75
        } else if (ch.videoCompleted || ch.pdfCompleted) {
            totalScore += 50
        }
    })

    const progress = Math.min(100, Math.round((totalScore / 300) * 100))

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
