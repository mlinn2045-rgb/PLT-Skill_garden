import { getChapterProgress, updateChapterProgress } from './learningProgress'

export interface StudentStats {
    xp: number
    streakDays: number
    lastActivityDate: string | null
}

const statsKey = (userKey: string) => `skillgarden-stats-${userKey}`

const getToday = () => new Date().toISOString().slice(0, 10)

const getYesterday = () => {
    const date = new Date()
    date.setDate(date.getDate() - 1)
    return date.toISOString().slice(0, 10)
}

export const getStudentStats = (userKey = 'guest'): StudentStats => {
    const savedStats = localStorage.getItem(statsKey(userKey))
    if (!savedStats) return { xp: 0, streakDays: 0, lastActivityDate: null }

    try {
        const parsedStats = JSON.parse(savedStats) as Partial<StudentStats>
        return {
            xp: Number(parsedStats.xp) || 0,
            streakDays: Number(parsedStats.streakDays) || 0,
            lastActivityDate: parsedStats.lastActivityDate || null,
        }
    } catch {
        localStorage.removeItem(statsKey(userKey))
        return { xp: 0, streakDays: 0, lastActivityDate: null }
    }
}

export const recordQuizCompletion = (skillId: string, chapterId: string, userKey = 'guest') => {
    const progress = getChapterProgress(skillId, chapterId, userKey)
    const currentStats = getStudentStats(userKey)

    if (progress.quizCompleted) return currentStats

    updateChapterProgress(skillId, { quizCompleted: true }, chapterId, userKey)
    const today = getToday()
    const streakDays = currentStats.lastActivityDate === today
        ? currentStats.streakDays
        : currentStats.lastActivityDate === getYesterday()
            ? currentStats.streakDays + 1
            : 1
    const nextStats = {
        xp: currentStats.xp + 100,
        streakDays,
        lastActivityDate: today,
    }
    localStorage.setItem(statsKey(userKey), JSON.stringify(nextStats))
    return nextStats
}
