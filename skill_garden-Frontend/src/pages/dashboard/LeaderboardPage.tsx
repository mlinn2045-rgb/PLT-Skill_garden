import React, { useState, useEffect } from 'react'
import { Trophy, Flame, Sparkles, Medal, Crown, RefreshCw } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../stores/authStore'
import { courseService, LeaderboardUser } from '../../services/courseService'
import { calculateLevel, getStudentStats } from '../../services/studentStats'

export const LeaderboardPage: React.FC = () => {
    const { user } = useAuthStore()
    const [filterPeriod, setFilterPeriod] = useState<'WEEKLY' | 'ALL_TIME'>('ALL_TIME')
    const [rankings, setRankings] = useState<LeaderboardUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    const fetchLeaderboard = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const data = await courseService.getLeaderboard()
            const userKey = user?.email || 'guest'
            const localStats = getStudentStats(userKey)

            let list = Array.isArray(data) ? data : []

            // If user is logged in, ensure their entry is present or synchronized
            const userEmail = user?.email?.toLowerCase().trim()
            const userId = user?.id ? String(user.id) : null

            let userFound = false
            let updatedList = list.map(u => {
                const uEmail = (u.username || u.email || '').toLowerCase().trim()
                const uId = u.id ? String(u.id) : null
                const isCurrentUser = Boolean(userEmail && (uEmail === userEmail || (userId && uId === userId)))
                if (isCurrentUser) userFound = true
                const xp = isCurrentUser ? Math.max(u.total_xp || 0, user?.total_xp || 0, localStats.xp) : (u.total_xp || 0)
                const level = calculateLevel(xp)
                const streak_days = isCurrentUser ? Math.max(u.streak_days || 0, user?.streak_days || 0, localStats.streakDays) : (u.streak_days || 0)
                return {
                    ...u,
                    total_xp: xp,
                    level,
                    streak_days,
                }
            })

            if (!userFound && user && userEmail) {
                const userXp = Math.max(user.total_xp || 0, localStats.xp)
                updatedList.push({
                    id: typeof user.id === 'number' ? user.id : 9999,
                    username: user.email,
                    full_name: user.full_name || user.email.split('@')[0],
                    total_xp: userXp,
                    level: calculateLevel(userXp),
                    streak_days: Math.max(user.streak_days || 1, localStats.streakDays),
                    rank: 1,
                })
            }

            // Sort primarily by total_xp DESC, then streak_days DESC
            updatedList.sort((a, b) => {
                if (b.total_xp !== a.total_xp) return b.total_xp - a.total_xp
                return b.streak_days - a.streak_days
            })

            // Assign ranks
            updatedList = updatedList.map((u, idx) => ({ ...u, rank: idx + 1 }))

            setRankings(updatedList)
        } catch (err: any) {
            setErrorMsg(err.message || 'Không thể tải bảng xếp hạng.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaderboard()
        const handleUpdate = () => fetchLeaderboard()
        window.addEventListener('skillgarden_xp_updated', handleUpdate)
        window.addEventListener('storage', handleUpdate)
        window.addEventListener('focus', handleUpdate)
        return () => {
            window.removeEventListener('skillgarden_xp_updated', handleUpdate)
            window.removeEventListener('storage', handleUpdate)
            window.removeEventListener('focus', handleUpdate)
        }
    }, [user])

    const top1 = rankings[0] || { rank: 1, full_name: 'Đang cập nhật...', total_xp: 0, level: 1, streak_days: 0 }
    const top2 = rankings[1] || { rank: 2, full_name: 'Đang cập nhật...', total_xp: 0, level: 1, streak_days: 0 }
    const top3 = rankings[2] || { rank: 3, full_name: 'Đang cập nhật...', total_xp: 0, level: 1, streak_days: 0 }

    return (
        <div className="min-h-screen bg-[#F7F9F7] dark:bg-gray-950 text-[#1A2E22] dark:text-gray-100 pb-16 pt-6 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1B3624] to-[#2D5A3D] dark:from-emerald-950 dark:to-gray-900 p-6 md:p-8 rounded-3xl text-white shadow-xl space-y-4 relative overflow-hidden border border-emerald-800/50">
                <div className="absolute right-4 top-4 text-9xl opacity-10 pointer-events-none">
                    🏆
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-full text-xs font-semibold text-yellow-300 backdrop-blur-xs mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>BẢNG VINH DANH HỌC VIÊN XUẤT SẮC (API THẬT)</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            Bảng Xếp Hạng Trí Thức PLT 🏆
                        </h1>
                        <p className="text-xs md:text-sm text-emerald-100/80 leading-relaxed max-w-xl">
                            Cạnh tranh lành mạnh, tích lũy XP từ các bài học và quiz mỗi ngày để vươn lên vị trí dẫn đầu toàn hệ thống!
                        </p>
                    </div>

                    <button
                        onClick={fetchLeaderboard}
                        disabled={isLoading}
                        className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-white/30 backdrop-blur-xs shadow-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại bảng xếp hạng
                    </button>
                </div>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
                {/* Top 2 - Silver */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-[#E6ECE6] dark:border-gray-800 shadow-md text-center space-y-3 relative order-2 md:order-1 flex flex-col items-center">
                    <div className="absolute -top-4 bg-slate-500 text-white text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Medal className="w-3.5 h-3.5" /> Hạng 2
                    </div>
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-700 flex items-center justify-center text-3xl font-extrabold text-slate-700 dark:text-slate-300 shadow-inner mt-2">
                        🥈
                    </div>
                    <div>
                        <h3 className="font-extrabold text-[#1A2E22] dark:text-white text-base">{top2.full_name || top2.username}</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl w-full flex items-center justify-around text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span>Level {top2.level}</span>
                        <span className="text-emerald-700 dark:text-emerald-400">+{top2.total_xp} XP</span>
                    </div>
                </div>

                {/* Top 1 - Gold */}
                <div className="bg-gradient-to-b from-amber-500/10 via-amber-50/50 to-white dark:from-amber-950/40 dark:via-amber-900/20 dark:to-gray-900 rounded-3xl p-6 border-2 border-amber-400 dark:border-amber-500 shadow-xl text-center space-y-4 relative order-1 md:order-2 flex flex-col items-center -translate-y-2">
                    <div className="absolute -top-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md uppercase tracking-wider">
                        <Crown className="w-4 h-4 fill-white text-white" /> QUÁN QUÂN #1
                    </div>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 border-4 border-amber-400 flex items-center justify-center text-4xl shadow-lg mt-2">
                        👑
                    </div>
                    <div>
                        <h3 className="font-black text-[#1A2E22] dark:text-white text-lg">{top1.full_name || top1.username}</h3>
                    </div>
                    <div className="bg-amber-100/60 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 p-3.5 rounded-2xl w-full flex items-center justify-around text-xs font-extrabold text-amber-950 dark:text-amber-200">
                        <span>Level {top1.level}</span>
                        <span className="text-emerald-800 dark:text-emerald-400 font-mono text-sm">+{top1.total_xp} XP</span>
                    </div>
                </div>

                {/* Top 3 - Bronze */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-[#E6ECE6] dark:border-gray-800 shadow-md text-center space-y-3 relative order-3 flex flex-col items-center">
                    <div className="absolute -top-4 bg-amber-600 text-white text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Medal className="w-3.5 h-3.5" /> Hạng 3
                    </div>
                    <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/40 border-4 border-amber-500 dark:border-amber-700 flex items-center justify-center text-3xl font-extrabold text-amber-800 dark:text-amber-400 shadow-inner mt-2">
                        🥉
                    </div>
                    <div>
                        <h3 className="font-extrabold text-[#1A2E22] dark:text-white text-base">{top3.full_name || top3.username}</h3>
                    </div>
                    <div className="bg-amber-50/50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-3 rounded-2xl w-full flex items-center justify-around text-xs font-bold text-amber-900 dark:text-amber-300">
                        <span>Level {top3.level}</span>
                        <span className="text-emerald-700 dark:text-emerald-400">+{top3.total_xp} XP</span>
                    </div>
                </div>
            </div>

            {/* Rankings Table */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-[#E6ECE6] dark:border-gray-800 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-xs font-bold text-[#6B6D7A] dark:text-gray-400 space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 dark:text-emerald-400" />
                        <p>Đang nạp bảng xếp hạng học viên từ Backend...</p>
                    </div>
                ) : rankings.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#6B6D7A] dark:text-gray-400">
                        Chưa có dữ liệu học viên trên bảng xếp hạng.
                    </div>
                ) : (
                    <div className="divide-y divide-[#E6ECE6] dark:divide-gray-800">
                        {rankings.map(u => {
                            const isCurrentUser = user?.email && u.username === user.email
                            return (
                                <div
                                    key={u.id}
                                    className={`p-4 md:p-5 flex items-center justify-between gap-4 transition-colors ${isCurrentUser ? 'bg-[#EEF0FD] dark:bg-indigo-950/60 border-l-4 border-l-[#3F49C8] dark:border-l-indigo-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`w-8 text-center text-sm font-black ${u.rank === 1 ? 'text-amber-500 text-lg' : u.rank === 2 ? 'text-slate-400 text-lg' : u.rank === 3 ? 'text-amber-700 dark:text-amber-400 text-lg' : 'text-[#718096] dark:text-gray-400'
                                            }`}>
                                            #{u.rank}
                                        </span>

                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center justify-center text-sm border border-emerald-300 dark:border-emerald-800">
                                            {(u.full_name || u.username || 'U').charAt(0)}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs md:text-sm font-extrabold text-[#1A2E22] dark:text-white">
                                                    {u.full_name || u.username}
                                                </h4>
                                                {isCurrentUser && (
                                                    <Badge variant="indigo" className="text-[10px]">Bạn</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-xs font-bold">
                                        <div className="hidden sm:block text-right">
                                            <span className="text-[#718096] dark:text-gray-400 block text-[10px]">Cấp độ</span>
                                            <span className="text-[#1A2E22] dark:text-gray-200">Level {u.level}</span>
                                        </div>

                                        <div className="hidden sm:block text-right">
                                            <span className="text-[#718096] dark:text-gray-400 block text-[10px]">Streak</span>
                                            <span className="text-rose-600 dark:text-rose-400 flex items-center justify-end gap-1">
                                                <Flame className="w-3.5 h-3.5 fill-rose-500" /> {u.streak_days} Ngày
                                            </span>
                                        </div>

                                        <div className="text-right pl-2 border-l border-gray-200 dark:border-gray-700">
                                            <span className="text-[#718096] dark:text-gray-400 block text-[10px]">Tổng XP</span>
                                            <span className="text-[#3F49C8] dark:text-indigo-400 font-black text-sm">+{u.total_xp} XP</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
