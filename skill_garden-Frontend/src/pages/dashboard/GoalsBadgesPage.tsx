import React, { useState } from 'react'
import { Award, Flame, Target, CheckCircle2, Lock, Sparkles, Star } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export const GoalsBadgesPage: React.FC = () => {
    const [claimedQuests, setClaimedQuests] = useState<number[]>([])

    const quests = [
        { id: 1, title: 'Hoàn thành 2 bài học Video hôm nay', xp: 50, current: 2, target: 2 },
        { id: 2, title: 'Đạt điểm tuyệt đối 1 bài Quiz đánh giá', xp: 100, current: 1, target: 1 },
        { id: 3, title: 'Duy trì Streak học tập 7 ngày liên tục', xp: 150, current: 5, target: 7 }
    ]

    const badges = [
        { id: 1, name: 'Mầm Xanh Đầu Tiên', desc: 'Trồng cây kỹ năng đầu tiên', unlocked: true, icon: '🌱' },
        { id: 2, name: 'Chiến Sĩ Quiz Core', desc: 'Đạt 100% điểm bài Quiz React', unlocked: true, icon: '⚡' },
        { id: 3, name: 'Bậc Thầy Streak 7', desc: 'Học tập liên tục 7 ngày', unlocked: false, icon: '🔥' },
        { id: 4, name: 'Cây Đại Thụ Python', desc: 'Hoàn thành khóa học Python Advanced', unlocked: false, icon: '🌳' },
        { id: 5, name: 'Chuyên Gia Database', desc: 'Hoàn thành lộ trình SQL', unlocked: false, icon: '🗄️' },
        { id: 6, name: 'Học Viên Xuất Sắc', desc: 'Tích lũy 5,000 XP', unlocked: false, icon: '👑' }
    ]

    const handleClaim = (id: number) => {
        setClaimedQuests([...claimedQuests, id])
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#3C4097] to-[#292C72] rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
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
                        <p className="text-2xl font-extrabold">7 Ngày</p>
                        <p className="text-[11px] text-indigo-200 font-semibold">Streak Hiện Tại</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 min-w-[110px]">
                        <Star className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
                        <p className="text-2xl font-extrabold">1,250</p>
                        <p className="text-[11px] text-indigo-200 font-semibold">Tổng XP</p>
                    </div>
                </div>
            </div>

            {/* Daily Quests Section */}
            <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#3C4097]" /> Nhiệm vụ hàng ngày (Daily Quests)
                    </h2>
                    <span className="text-xs text-[#6B6D7A] font-medium">Làm mới sau 05:42:10</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quests.map((q) => {
                        const isDone = q.current >= q.target
                        const isClaimed = claimedQuests.includes(q.id)
                        return (
                            <div key={q.id} className="p-4 rounded-xl border border-[#E2E4EB] bg-[#FAFAF7] space-y-3">
                                <div className="flex items-start justify-between">
                                    <p className="text-xs font-bold text-[#20223A] leading-snug">{q.title}</p>
                                    <span className="text-xs font-bold text-[#3C4097] bg-[#F4F5FF] px-2 py-0.5 rounded">+{q.xp} XP</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold text-[#6B6D7A]">
                                        <span>Tiến độ</span>
                                        <span>{q.current} / {q.target}</span>
                                    </div>
                                    <div className="w-full bg-[#E2E4EB] h-2 rounded-full overflow-hidden">
                                        <div className="bg-[#6FAF7B] h-full" style={{ width: `${(q.current / q.target) * 100}%` }}></div>
                                    </div>
                                </div>

                                {isClaimed ? (
                                    <Button variant="outline" size="sm" disabled fullWidth className="text-xs font-bold text-emerald-600 bg-emerald-50">
                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Đã nhận thưởng
                                    </Button>
                                ) : isDone ? (
                                    <Button variant="indigo" size="sm" fullWidth onClick={() => handleClaim(q.id)} className="text-xs font-bold">
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
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#3C4097]" /> Bộ Sưu Tập Huy Hiệu (Badges)
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {badges.map((b) => (
                        <div
                            key={b.id}
                            className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${b.unlocked
                                    ? 'bg-white border-[#6FAF7B] shadow-md hover:-translate-y-1'
                                    : 'bg-gray-50 border-[#E2E4EB] opacity-60'
                                }`}
                        >
                            <div className="text-4xl mx-auto my-2 relative inline-block">
                                <span>{b.icon}</span>
                                {!b.unlocked && <Lock className="w-4 h-4 text-gray-500 absolute -bottom-1 -right-1" />}
                            </div>
                            <h3 className="text-xs font-extrabold text-[#20223A]">{b.name}</h3>
                            <p className="text-[11px] text-[#6B6D7A] leading-tight">{b.desc}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${b.unlocked ? 'bg-[#DCEFE1] text-[#2C6A3D]' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {b.unlocked ? 'Đã Mở Khóa' : 'Chưa Khóa'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
