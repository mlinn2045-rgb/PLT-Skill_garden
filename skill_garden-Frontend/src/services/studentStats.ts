import { getChapterProgress, updateChapterProgress } from './learningProgress'
import { useAuthStore } from '../stores/authStore'

export interface StudentStats {
    xp: number
    streakDays: number
    lastActivityDate: string | null
    level?: number
}

const statsKey = (userKey: string) => `skillgarden-stats-${userKey}`

const getToday = () => new Date().toISOString().slice(0, 10)

const getYesterday = () => {
    const date = new Date()
    date.setDate(date.getDate() - 1)
    return date.toISOString().slice(0, 10)
}

/**
 * Công thức tính Level chuẩn:
 * - Level 1 - 5: +1000 XP / Level (Level 1: 0-999, Lvl 2: 1000-1999, Lvl 3: 2000-2999, Lvl 4: 3000-3999, Lvl 5: 4000-4999)
 * - Level 6 - 10: +2000 XP / Level (Level 6: 5000-6999, Lvl 7: 7000-8999, Lvl 8: 9000-10999, Lvl 9: 11000-12999, Lvl 10: 13000+)
 */
export const calculateLevel = (xp: number): number => {
    if (xp < 1000) return 1
    if (xp < 2000) return 2
    if (xp < 3000) return 3
    if (xp < 4000) return 4
    if (xp < 5000) return 5
    if (xp < 7000) return 6
    if (xp < 9000) return 7
    if (xp < 11000) return 8
    if (xp < 13000) return 9
    return 10
}

export const getStudentStats = (userKey = 'guest'): StudentStats => {
    const savedStats = localStorage.getItem(statsKey(userKey))
    const today = getToday()

    let authUserXp: number | null = null
    let authUserStreak: number | null = null
    try {
        const authState = useAuthStore.getState()
        if (authState.user && (authState.user.email === userKey || userKey === 'guest')) {
            authUserXp = typeof authState.user.total_xp === 'number' ? authState.user.total_xp : null
            authUserStreak = typeof authState.user.streak_days === 'number' ? authState.user.streak_days : null
        }
    } catch {
        // ignore if store not initialized
    }

    if (!savedStats) {
        const xp = authUserXp ?? 0
        const streakDays = Math.max(1, authUserStreak ?? 1)
        return { xp, streakDays, lastActivityDate: today, level: calculateLevel(xp) }
    }

    try {
        const parsedStats = JSON.parse(savedStats) as Partial<StudentStats>
        let xp = typeof parsedStats.xp === 'number' && parsedStats.xp >= 0 ? parsedStats.xp : 0
        if (authUserXp !== null && authUserXp > xp) {
            xp = authUserXp
        }
        let streakDays = Number(parsedStats.streakDays) || 1
        if (authUserStreak !== null && authUserStreak > streakDays) {
            streakDays = authUserStreak
        }
        return {
            xp,
            streakDays,
            lastActivityDate: parsedStats.lastActivityDate || today,
            level: calculateLevel(xp),
        }
    } catch {
        localStorage.removeItem(statsKey(userKey))
        const xp = authUserXp ?? 0
        const streakDays = Math.max(1, authUserStreak ?? 1)
        return { xp, streakDays, lastActivityDate: today, level: calculateLevel(xp) }
    }
}

export const checkAndUpdateDailyStreak = (userKey = 'guest'): StudentStats => {
    const stats = getStudentStats(userKey)
    const today = getToday()

    if (stats.lastActivityDate === today) {
        return stats
    }

    const yesterday = getYesterday()
    const newStreak = stats.lastActivityDate === yesterday ? stats.streakDays + 1 : 1

    const updated: StudentStats = {
        ...stats,
        streakDays: newStreak,
        lastActivityDate: today,
        level: calculateLevel(stats.xp),
    }

    localStorage.setItem(statsKey(userKey), JSON.stringify(updated))
    try {
        useAuthStore.getState().updateUser({ streak_days: updated.streakDays })
    } catch {
        // ignore
    }
    return updated
}

export const recordQuizCompletion = (skillId: string, chapterId: string, userKey = 'guest') => {
    const progress = getChapterProgress(skillId, chapterId, userKey)
    const currentStats = getStudentStats(userKey)

    if (progress.quizCompleted) return currentStats

    updateChapterProgress(skillId, { quizCompleted: true }, chapterId, userKey)
    const today = getToday()
    const yesterday = getYesterday()
    const streakDays = currentStats.lastActivityDate === today
        ? currentStats.streakDays
        : currentStats.lastActivityDate === yesterday
            ? currentStats.streakDays + 1
            : 1

    const newXp = currentStats.xp + 100
    const nextStats: StudentStats = {
        xp: newXp,
        streakDays,
        lastActivityDate: today,
        level: calculateLevel(newXp),
    }

    localStorage.setItem(statsKey(userKey), JSON.stringify(nextStats))
    try {
        useAuthStore.getState().updateUser({ total_xp: nextStats.xp, level: nextStats.level })
    } catch {
        // ignore
    }
    return nextStats
}

export const addStudentXp = (userKey = 'guest', xpToAdd: number): StudentStats => {
    const currentStats = getStudentStats(userKey)
    const newXp = currentStats.xp + xpToAdd
    const nextStats: StudentStats = {
        ...currentStats,
        xp: newXp,
        level: calculateLevel(newXp),
    }
    localStorage.setItem(statsKey(userKey), JSON.stringify(nextStats))
    try {
        useAuthStore.getState().updateUser({ total_xp: nextStats.xp, level: nextStats.level })
    } catch {
        // ignore
    }
    window.dispatchEvent(new Event('skillgarden_xp_updated'))
    return nextStats
}

export const syncStudentXp = (userKey = 'guest', totalXp: number): StudentStats => {
    const currentStats = getStudentStats(userKey)
    const nextStats: StudentStats = {
        ...currentStats,
        xp: totalXp,
        level: calculateLevel(totalXp),
    }
    localStorage.setItem(statsKey(userKey), JSON.stringify(nextStats))
    try {
        useAuthStore.getState().updateUser({ total_xp: nextStats.xp, level: nextStats.level })
    } catch {
        // ignore
    }
    return nextStats
}
