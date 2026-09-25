import React, { useState, useEffect } from 'react'
import { Award, Flame, Target, CheckCircle2, Lock, Star } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { getChapterProgress, isSkillCompleted, isSkillGrowing } from '../../services/learningProgress'
import { addStudentXp, getStudentStats } from '../../services/studentStats'
import { useAuthStore } from '../../stores/authStore'

export const GoalsBadgesPage: React.FC = () => {
    const { user } = useAuthStore()
    const userKey = user?.email || 'guest'
    const storageKey = `skillgarden_claimed_quests_${userKey}`
    const studentStats = getStudentStats(userKey)
    const userXp = user?.total_xp ?? studentStats.xp
    const skillIds = ['1', '2', '3', '4', '5', '6']
    const completedQuizCount = skillIds.reduce((count, skillId) => (
        count + (getChapterProgress(skillId, '1', userKey).quizCompleted ? 1 : 0)
    ), 0)
    const growingSkillCount = skillIds.filter(skillId => isSkillGrowing(skillId, userKey)).length

    const [claimedQuests, setClaimedQuests] = useState<number[]>(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
            try { return JSON.parse(saved) } catch { }
        }
        return []
    })

    useEffect(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
            try { setClaimedQuests(JSON.parse(saved)) } catch { }
        }
    }, [storageKey])

    const quests = [
        { id: 1, title: 'Hoàn thành 2 bài học Video hôm nay', xp: 50, current: Math.min(completedQuizCount, 2), target: 2 },
        { id: 2, title: 'Đạt điểm tuyệt đối 1 bài Quiz đánh giá', xp: 100, current: Math.min(completedQuizCount, 1), target: 1 },
        { id: 3, title: 'Duy trì Streak học tập 7 ngày liên tục', xp: 150, current: Math.min(studentStats.streakDays, 7), target: 7 }
    ]

    const badges = [
        { id: 1, name: 'Mầm Xanh Đầu Tiên', desc: 'Trồng cây kỹ năng đầu tiên', unlocked: growingSkillCount >= 1, icon: '🌱' },
        { id: 2, name: 'Chiến Sĩ Quiz Core', desc: 'Hoàn thành bài Quiz đầu tiên', unlocked: completedQuizCount >= 1, icon: '⚡' },
        { id: 3, name: 'Bậc Thầy Streak 7', desc: 'Học tập liên tục 7 ngày', unlocked: studentStats.streakDays >= 7, icon: '🔥' },
        { id: 4, name: 'Cây Đại Thụ Python', desc: 'Hoàn thành khóa học Python Advanced', unlocked: isSkillCompleted('4', userKey), icon: '🌳' },
        { id: 5, name: 'Chuyên Gia Database', desc: 'Hoàn thành lộ trình SQL', unlocked: isSkillCompleted('3', userKey), icon: '🗄️' },
        { id: 6, name: 'Học Viên Xuất Sắc', desc: 'Tích lũy 5,000 XP', unlocked: userXp >= 5000, icon: '👑' }
    ]

    const handleClaim = (id: number, xpAmount: number) => {
        if (claimedQuests.includes(id)) return
        const updated = [...claimedQuests, id]
        setClaimedQuests(updated)
        localStorage.setItem(storageKey, JSON.stringify(updated))
        addStudentXp(userKey, xpAmount)
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#3C4097] to-[#292C72] dark:from-indigo-950 dark:to-gray-900 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-900/50">
                <div className="space-y-2">
                    <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                        HỆ THỐNG HUY HIỆU & MỤC TIÊU
                    </span>
                    <h1 className="text-3xl font-extrabold">Nhiệm Vụ & Thành Tích PLT 🏆</h1>
                    <p className="text-sm text-indigo-100 max-w-xl">
                        Hoàn thành mục tiêu mỗi ngày để duy trì Streak, nhận thưởng XP và mở khóa các Huy hiệu 3D danh giá.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 min-w-[110px]">
                        <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                        <p className="text-2xl font-extrabold">{studentStats.streakDays} Ngày</p>
                        <p className="text-[11px] text-indigo-200 font-semibold">Streak Hiện Tại</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 min-w-[110px]">
                        <Star className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
                        <p className="text-2xl font-extrabold">{userXp.toLocaleString('vi-VN')}</p>
                        <p className="text-[11px] text-indigo-200 font-semibold">Tổng XP</p>
                    </div>
                </div>
            </div>

            {/* Daily Quests Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Target className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" /> Nhiệm vụ hàng ngày (Daily Quests)
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Làm mới sau 05:42:10</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quests.map((q) => {
                        const isDone = q.current >= q.target
                        const isClaimed = claimedQuests.includes(q.id)
                        return (
                            <div key={q.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 space-y-3">
                                <div className="flex items-start justify-between">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{q.title}</p>
                                    <span className="text-xs font-bold text-[#3C4097] dark:text-indigo-400 bg-[#F4F5FF] dark:bg-indigo-950/60 px-2 py-0.5 rounded">+{q.xp} XP</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                        <span>Tiến độ</span>
                                        <span>{q.current} / {q.target}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full" style={{ width: `${(q.current / q.target) * 100}%` }}></div>
                                    </div>
                                </div>

                                {isClaimed ? (
                                    <Button variant="outline" size="sm" disabled fullWidth className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Đã nhận thưởng
                                    </Button>
                                ) : isDone ? (
                                    <Button variant="indigo" size="sm" fullWidth onClick={() => handleClaim(q.id, q.xp)} className="text-xs font-bold cursor-pointer">
                                        Nhận {q.xp} XP
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" disabled fullWidth className="text-xs font-bold">
                                        Chưa hoàn thành
                                    </Button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Badges Collection Grid */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Award className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" /> Bộ Sưu Tập Huy Hiệu (Badges)
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {badges.map((b) => (
                        <div
                            key={b.id}
                            className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${b.unlocked
                                ? 'bg-white dark:bg-gray-800 border-emerald-500 dark:border-emerald-600 shadow-md hover:-translate-y-1'
                                : 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-60'
                                }`}
                        >
                            <div className="text-4xl mx-auto my-2 relative inline-block">
                                <span>{b.icon}</span>
                                {!b.unlocked && <Lock className="w-4 h-4 text-gray-500 absolute -bottom-1 -right-1" />}
                            </div>
                            <h3 className="text-xs font-extrabold text-gray-900 dark:text-white">{b.name}</h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{b.desc}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${b.unlocked ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                {b.unlocked ? 'Đã Mở Khóa' : 'Đang Khóa'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
