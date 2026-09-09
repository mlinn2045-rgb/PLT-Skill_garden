import React from 'react'
import { Link } from 'react-router-dom'
import {
    Flame,
    Zap,
    Award,
    ArrowRight,
    Plus
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'

export const OverviewPage: React.FC = () => {
    const plants = [
        {
            id: 1,
            name: 'JavaScript Core & Async',
            stage: 'Cây non đơm chồi',
            level: 3,
            progress: 72,
            xp: 420,
            maxXp: 600,
            icon: '🌱',
            color: 'from-emerald-400 to-emerald-600',
            status: 'Cần tưới hôm nay'
        },
        {
            id: 2,
            name: 'React 19 Ecosystem',
            stage: 'Mầm mới nhú',
            level: 1,
            progress: 15,
            xp: 90,
            maxXp: 600,
            icon: '🪴',
            color: 'from-purple-400 to-indigo-600',
            status: 'Đang phát triển'
        },
        {
            id: 3,
            name: 'Tailwind CSS & UI Design',
            stage: 'Cây cổ thụ xanh tươi',
            level: 5,
            progress: 100,
            xp: 600,
            maxXp: 600,
            icon: '🌳',
            color: 'from-[#68D391] to-[#2D7A4F]',
            status: 'Đã thu hoạch'
        },
        {
            id: 4,
            name: 'Python Data Foundation',
            stage: 'Hạt giống mới gieo',
            level: 2,
            progress: 30,
            xp: 180,
            maxXp: 600,
            icon: '🌱',
            color: 'from-amber-400 to-orange-500',
            status: 'Đang đâm chồi'
        }
    ]

    return (
        <div className="space-y-8 pb-12">

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#EEFAF2] via-[#EAF4EF] to-[#EBF0FE] border border-[#68D391]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Badge variant="skill">VƯỜN TRÍ THỨC SỐ • PLT SKILLGARDEN</Badge>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#1A2E22] tracking-tight">
                            Chào mừng trở lại khu vườn, Anh Khoa! 🌱
                        </h1>
                        <p className="text-xs sm:text-sm text-[#4A5568] max-w-xl">
                            Hôm nay khí hậu khu vườn rất lý tưởng. Hãy tưới nước cho <strong>JavaScript Core</strong> để duy trì chuỗi <strong>7 ngày streak</strong> của bạn!
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link to="/dashboard/skill/1">
                            <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
                                Tiếp tục bài học
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 4 Stat Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                        🪴
                    </div>
                    <div>
                        <div className="text-xl font-black text-[#1A2E22]">4 Cây</div>
                        <div className="text-xs text-[#718096]">Đang sinh trưởng</div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
                        <Zap className="w-6 h-6 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-[#1A2E22]">1.250 XP</div>
                        <div className="text-xs text-[#718096]">Tổng tích lũy</div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl">
                        <Flame className="w-6 h-6 fill-red-500 text-red-500" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-[#1A2E22]">7 Ngày</div>
                        <div className="text-xs text-[#718096]">Chuỗi Streak liên tục</div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#3F49C8] flex items-center justify-center font-bold text-xl">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-[#1A2E22]">3 Huy hiệu</div>
                        <div className="text-xs text-[#718096]">Đã thu hoạch</div>
                    </div>
                </Card>
            </div>

            {/* Garden Canvas Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#1A2E22]">Khu vườn kỹ năng của bạn</h2>
                        <p className="text-xs text-[#718096]">Chăm sóc các chồi cây bằng cách hoàn thành bài học và quiz mỗi ngày</p>
                    </div>
                    <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                        Trồng thêm cây mới
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plants.map((plant) => (
                        <Card key={plant.id} hoverEffect className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-[#E6FFFA] text-2xl flex items-center justify-center border border-[#68D391]/30">
                                        {plant.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-[#1A2E22]">{plant.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-[#718096] mt-0.5">
                                            <span>{plant.stage}</span>
                                            <span>•</span>
                                            <span className="font-bold text-[#2D7A4F]">Cấp {plant.level}</span>
                                        </div>
                                    </div>
                                </div>

                                <Badge variant={plant.progress === 100 ? 'success' : 'skill'}>
                                    {plant.status}
                                </Badge>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-[#4A5568]">Tiến độ sinh trưởng</span>
                                    <span className="font-mono text-[#2D7A4F]">{plant.progress}%</span>
                                </div>
                                <ProgressBar progress={plant.progress} size="md" />
                            </div>

                            <div className="pt-3 border-t border-[#E6ECE6] flex items-center justify-between text-xs">
                                <span className="text-[#718096]">Kinh nghiệm: <strong>{plant.xp} / {plant.maxXp} XP</strong></span>
                                <Link to="/dashboard/skill/1">
                                    <span className="font-bold text-[#3F49C8] hover:underline flex items-center gap-1">
                                        Chăm sóc cây &rsaquo;
                                    </span>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

        </div>
    )
}
