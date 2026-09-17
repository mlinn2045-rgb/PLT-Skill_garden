import React, { useState } from 'react'
import { Trophy, Flame, Zap, Award, Crown, Sparkles, Medal, ShieldCheck, ChevronUp } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../stores/authStore'

interface LeaderboardUser {
    rank: number
    name: string
    avatar?: string
    xp: number
    level: number
    streak: number
    skillsCompleted: number
    badge: string
}

export const LeaderboardPage: React.FC = () => {
    const { user } = useAuthStore()
    const [filterPeriod, setFilterPeriod] = useState<'WEEKLY' | 'ALL_TIME'>('ALL_TIME')

    const rankings: LeaderboardUser[] = [
        { rank: 1, name: 'Nguyễn Văn Minh', xp: 3450, level: 12, streak: 24, skillsCompleted: 5, badge: '🌸 Vua Vườn Lập Trình' },
        { rank: 2, name: 'Trần Thị Thu Thảo', xp: 2980, level: 10, streak: 18, skillsCompleted: 4, badge: '🌳 Thần Đồng Backend' },
        { rank: 3, name: 'Lê Hoàng Anh', xp: 2650, level: 9, streak: 15, skillsCompleted: 3, badge: '🎋 Kiến Trúc Sư SQL' },
        { rank: 4, name: user?.full_name || 'Anh Khoa (Bạn)', xp: 1250, level: 5, streak: user?.streak_days || 7, skillsCompleted: 2, badge: '🌱 Mầm Xăng Tri Thức' },
        { rank: 5, name: 'Phạm Bảo Quốc', xp: 1180, level: 5, streak: 6, skillsCompleted: 2, badge: '🌵 Chuyên Gia Python' },
        { rank: 6, name: 'Đặng Mai Phương', xp: 950, level: 4, streak: 5, skillsCompleted: 1, badge: '🌻 Tester Kiên Trì' },
        { rank: 7, name: 'Vũ Đức Cường', xp: 820, level: 4, streak: 4, skillsCompleted: 1, badge: '🌴 Mobile Coder' }
    ]

    const top1 = rankings[0]
    const top2 = rankings[1]
    const top3 = rankings[2]

    return (
        <div className="min-h-screen bg-[#F7F9F7] text-[#1A2E22] pb-16 pt-6 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1B3624] to-[#2D5A3D] p-6 md:p-8 rounded-3xl text-white shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute right-4 top-4 text-9xl opacity-10 pointer-events-none">
                    🏆
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-full text-xs font-semibold text-yellow-300 backdrop-blur-xs mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>BẢNG VINH DANH HỌC VIÊN XUẤT SẮC</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
                            <Trophy className="w-8 h-8 text-yellow-400" /> Bảng Xếp Hạng Vườn Kỹ Năng
                        </h1>
                        <p className="text-xs md:text-sm text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
                            Cạnh tranh lành mạnh cùng các học viên trên toàn hệ thống PLT Solutions. Hoàn thành bài học, giữ streak và tích lũy XP để vươn lên đỉnh bảng!
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md">
                        <button
                            onClick={() => setFilterPeriod('ALL_TIME')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterPeriod === 'ALL_TIME' ? 'bg-yellow-400 text-[#1B3624] shadow-md' : 'text-white hover:bg-white/10'
                                }`}
                        >
                            Toàn Thời Gian
                        </button>
                        <button
                            onClick={() => setFilterPeriod('WEEKLY')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterPeriod === 'WEEKLY' ? 'bg-yellow-400 text-[#1B3624] shadow-md' : 'text-white hover:bg-white/10'
                                }`}
                        >
                            Tuần Này
                        </button>
                    </div>
                </div>
            </div>

            {/* Podium Top 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Rank 2 */}
                <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3 relative order-2 md:order-1 transform hover:-translate-y-1 transition-transform">
                    <div className="absolute -top-4 bg-slate-300 text-slate-800 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Medal className="w-3.5 h-3.5" /> Hạng 2
                    </div>
                    <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-slate-300 flex items-center justify-center text-3xl font-extrabold text-slate-700 shadow-inner mt-2">
                        🥈
                    </div>
                    <div>
                        <h3 className="font-extrabold text-[#1A2E22] text-base">{top2.name}</h3>
                        <p className="text-[11px] text-[#718096] font-semibold">{top2.badge}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl w-full flex items-center justify-around text-xs font-bold text-slate-700">
                        <span>Level {top2.level}</span>
                        <span className="text-emerald-700">+{top2.xp} XP</span>
                    </div>
                </div>

                {/* Rank 1 */}
                <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 border-2 border-amber-300 shadow-md flex flex-col items-center text-center space-y-3 relative order-1 md:order-2 transform md:-translate-y-4 hover:-translate-y-5 transition-transform">
                    <div className="absolute -top-5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1 shadow-md animate-bounce">
                        <Crown className="w-4 h-4 fill-amber-900 text-amber-900" /> Quán Quân Hạng 1
                    </div>
                    <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-4xl font-extrabold text-amber-800 shadow-inner mt-2">
                        🥇
                    </div>
                    <div>
                        <h3 className="font-black text-[#1A2E22] text-lg text-amber-950">{top1.name}</h3>
                        <p className="text-xs text-amber-700 font-bold">{top1.badge}</p>
                    </div>
                    <div className="bg-amber-100/70 border border-amber-300 p-3 rounded-2xl w-full flex items-center justify-around text-xs font-black text-amber-900">
                        <span>Level {top1.level}</span>
                        <span className="text-emerald-800 text-sm">+{top1.xp} XP</span>
                    </div>
                </div>

                {/* Rank 3 */}
                <div className="bg-white rounded-3xl p-6 border-2 border-amber-100 shadow-sm flex flex-col items-center text-center space-y-3 relative order-3 transform hover:-translate-y-1 transition-transform">
                    <div className="absolute -top-4 bg-amber-600 text-white text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Medal className="w-3.5 h-3.5" /> Hạng 3
                    </div>
                    <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-500 flex items-center justify-center text-3xl font-extrabold text-amber-800 shadow-inner mt-2">
                        🥉
                    </div>
                    <div>
                        <h3 className="font-extrabold text-[#1A2E22] text-base">{top3.name}</h3>
                        <p className="text-[11px] text-[#718096] font-semibold">{top3.badge}</p>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-2xl w-full flex items-center justify-around text-xs font-bold text-amber-900">
                        <span>Level {top3.level}</span>
                        <span className="text-emerald-700">+{top3.xp} XP</span>
                    </div>
                </div>
            </div>

            {/* Rankings Table */}
            <div className="bg-white rounded-3xl border border-[#E6ECE6] shadow-xs overflow-hidden">
                <div className="p-5 border-b border-[#E6ECE6] bg-gray-50 flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-[#1A2E22] uppercase tracking-wider">
                        Danh Sách Thứ Hạng Chi Tiết
                    </h2>
                    <span className="text-xs font-semibold text-[#718096]">
                        Cập nhật theo thời gian thực
                    </span>
                </div>

                <div className="divide-y divide-[#E6ECE6]">
                    {rankings.map(u => {
                        const isCurrentUser = u.rank === 4
                        return (
                            <div
                                key={u.rank}
                                className={`p-4 md:p-5 flex items-center justify-between gap-4 transition-colors ${isCurrentUser ? 'bg-[#EEF0FD] border-l-4 border-l-[#3F49C8]' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 text-center text-sm font-black ${u.rank === 1 ? 'text-amber-500 text-lg' : u.rank === 2 ? 'text-slate-400 text-lg' : u.rank === 3 ? 'text-amber-700 text-lg' : 'text-[#718096]'
                                        }`}>
                                        #{u.rank}
                                    </span>

                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm border border-emerald-300">
                                        {u.name.charAt(0)}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs md:text-sm font-extrabold text-[#1A2E22]">
                                                {u.name}
                                            </h4>
                                            {isCurrentUser && (
                                                <Badge variant="indigo" className="text-[10px]">Bạn</Badge>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[#718096] font-medium">{u.badge}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-xs font-bold">
                                    <div className="hidden sm:block text-right">
                                        <span className="text-[#718096] block text-[10px]">Cấp độ</span>
                                        <span className="text-[#1A2E22]">Level {u.level}</span>
                                    </div>

                                    <div className="hidden sm:block text-right">
                                        <span className="text-[#718096] block text-[10px]">Streak</span>
                                        <span className="text-rose-600 flex items-center justify-end gap-1">
                                            <Flame className="w-3.5 h-3.5 fill-rose-500" /> {u.streak} Ngày
                                        </span>
                                    </div>

                                    <div className="text-right pl-2 border-l border-gray-200">
                                        <span className="text-[#718096] block text-[10px]">Tổng XP</span>
                                        <span className="text-[#3F49C8] font-black text-sm">+{u.xp} XP</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
