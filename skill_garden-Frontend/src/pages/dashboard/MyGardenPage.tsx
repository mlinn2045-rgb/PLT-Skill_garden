import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, Droplets, Sun, Sparkles, Plus, ChevronRight, Award, Flame, Filter } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../stores/authStore'

interface PlantCard {
    id: string
    skillId: string
    skillName: string
    category: string
    plantType: string
    stageName: 'Hạt giống' | 'Mầm xanh' | 'Cây xòe lá' | 'Đơm hoa' | 'Đơm quả / Hoàn thành'
    stageLevel: number // 1 to 5
    progress: number // 0-100%
    xpEarned: number
    lastWatered: string
    icon: string
    color: string
}

export const MyGardenPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [filterCategory, setFilterCategory] = useState<string>('ALL')

    const [plants, setPlants] = useState<PlantCard[]>([
        {
            id: '1',
            skillId: '1',
            skillName: 'Frontend React 19 Mastery',
            category: 'Frontend',
            plantType: 'Cây Hoa Anh Đào',
            stageName: 'Đơm hoa',
            stageLevel: 4,
            progress: 75,
            xpEarned: 450,
            lastWatered: 'Hôm nay',
            icon: '🌸',
            color: 'from-pink-500 to-rose-400'
        },
        {
            id: '2',
            skillId: '2',
            skillName: 'Backend NestJS & Node.js System',
            category: 'Backend',
            plantType: 'Cây Cổ Thụ',
            stageName: 'Mầm xanh',
            stageLevel: 2,
            progress: 35,
            xpEarned: 210,
            lastWatered: 'Hôm qua',
            icon: '🌳',
            color: 'from-emerald-600 to-green-500'
        },
        {
            id: '3',
            skillId: '3',
            skillName: 'Database SQL & Architect',
            category: 'Database',
            plantType: 'Cây Tre Trăm Đốt',
            stageName: 'Cây xòe lá',
            stageLevel: 3,
            progress: 55,
            xpEarned: 320,
            lastWatered: '2 ngày trước',
            icon: '🎋',
            color: 'from-teal-600 to-emerald-400'
        },
        {
            id: '4',
            skillId: '4',
            skillName: 'Python & Machine Learning Basis',
            category: 'AI/Python',
            plantType: 'Cây Xương Rồng Sa Mạc',
            stageName: 'Hạt giống',
            stageLevel: 1,
            progress: 10,
            xpEarned: 50,
            lastWatered: '3 ngày trước',
            icon: '🌵',
            color: 'from-amber-500 to-yellow-400'
        }
    ])

    const handleWatering = (plantId: string) => {
        setPlants(prev => prev.map(p => {
            if (p.id === plantId) {
                const newProgress = Math.min(100, p.progress + 5)
                return {
                    ...p,
                    progress: newProgress,
                    xpEarned: p.xpEarned + 10,
                    lastWatered: 'Vừa tưới xong'
                }
            }
            return p
        }))
    }

    const filteredPlants = filterCategory === 'ALL'
        ? plants
        : plants.filter(p => p.category === filterCategory)

    return (
        <div className="min-h-screen bg-[#F7F9F7] text-[#1A2E22] pb-16 pt-6 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#1B3624] via-[#244A32] to-[#1B3624] rounded-3xl p-6 md:p-8 text-white shadow-xl">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
                    <Sprout className="w-96 h-96" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-[#2D5A3D]/80 border border-[#3D7852] px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-xs">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                            <span>KHU VƯỜN KỸ NĂNG CÁ NHÂN</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            Vườn Kỹ Năng Của {user?.full_name || 'Học Viên'} 🌿
                        </h1>
                        <p className="text-xs md:text-sm text-emerald-100/80 leading-relaxed">
                            Mỗi bài học bạn thực hiện chính là nguồn dinh dưỡng tưới cho các mầm cây tri thức. Hãy duy trì chuỗi học tập để thu hoạch các kỹ năng công nghệ thực chiến!
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <div className="text-center px-3 border-r border-white/10">
                            <div className="text-2xl font-black text-yellow-300">{plants.length}</div>
                            <div className="text-[11px] text-emerald-200">Cây Đang Trồng</div>
                        </div>
                        <div className="text-center px-3 border-r border-white/10">
                            <div className="text-2xl font-black text-emerald-300">
                                {plants.reduce((sum, p) => sum + p.xpEarned, 0)}
                            </div>
                            <div className="text-[11px] text-emerald-200">XP Tích Lũy</div>
                        </div>
                        <div className="text-center px-3">
                            <div className="text-2xl font-black text-rose-300 flex items-center justify-center gap-1">
                                <Flame className="w-5 h-5 fill-rose-400" /> {user?.streak_days || 7}
                            </div>
                            <div className="text-[11px] text-emerald-200">Streak Ngày</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E6ECE6] shadow-xs">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                    <span className="text-xs font-bold text-[#718096] flex items-center gap-1 shrink-0 mr-1">
                        <Filter className="w-3.5 h-3.5" /> Lọc theo loại:
                    </span>
                    {['ALL', 'Frontend', 'Backend', 'Database', 'AI/Python'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterCategory === cat
                                ? 'bg-[#1B3624] text-white shadow-xs'
                                : 'bg-gray-100 text-[#4A5568] hover:bg-gray-200'
                                }`}
                        >
                            {cat === 'ALL' ? 'Tất cả cây' : cat}
                        </button>
                    ))}
                </div>

                <Button
                    variant="indigo"
                    className="font-bold flex items-center gap-2 shadow-xs shrink-0"
                    onClick={() => navigate('/dashboard/skill-catalog')}
                >
                    <Plus className="w-4 h-4" /> Trồng Thêm Cây Mới
                </Button>
            </div>

            {/* Garden Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredPlants.map((plant) => (
                    <div
                        key={plant.id}
                        className="bg-white rounded-3xl p-6 border border-[#E6ECE6] shadow-xs hover:shadow-md transition-all duration-300 space-y-5 relative overflow-hidden group"
                    >
                        {/* Background subtle gradient icon */}
                        <div className="absolute right-4 bottom-4 text-8xl opacity-10 transition-transform group-hover:scale-110 pointer-events-none">
                            {plant.icon}
                        </div>

                        {/* Plant Top Info */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plant.color} flex items-center justify-center text-3xl shadow-md shrink-0`}>
                                    {plant.icon}
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-[#3F49C8] uppercase tracking-wider">
                                        {plant.category} • {plant.plantType}
                                    </span>
                                    <h3 className="text-base font-extrabold text-[#1A2E22] group-hover:text-[#3F49C8] transition-colors">
                                        {plant.skillName}
                                    </h3>
                                </div>
                            </div>

                            <Badge variant="success" className="font-bold text-[11px] shrink-0">
                                Stage {plant.stageLevel}/5
                            </Badge>
                        </div>

                        {/* Stage Progress Visual */}
                        <div className="bg-[#F8FAF8] p-4 rounded-2xl border border-[#E6ECE6] space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#2D3748] flex items-center gap-1.5">
                                    <Sprout className="w-4 h-4 text-emerald-600" />
                                    Giai đoạn: <span className="text-emerald-700 font-extrabold">{plant.stageName}</span>
                                </span>
                                <span className="font-extrabold text-[#3F49C8]">{plant.progress}% Sinh Trưởng</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                                    style={{ width: `${plant.progress}%` }}
                                />
                            </div>

                            {/* Stages Step Indicators */}
                            <div className="flex items-center justify-between pt-1">
                                {['Hạt', 'Mầm', 'Cây', 'Hoa', 'Quả'].map((stg, idx) => {
                                    const stepNum = idx + 1
                                    const isReached = plant.stageLevel >= stepNum
                                    return (
                                        <div key={stg} className="flex flex-col items-center gap-1">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${isReached ? 'bg-emerald-600 text-white ring-2 ring-emerald-200' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                {stepNum}
                                            </div>
                                            <span className="text-[10px] text-[#718096] font-medium">{stg}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Bottom Actions & Stats */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#E6ECE6]">
                            <div className="text-xs text-[#718096]">
                                <div>XP Đã Tích Lũy: <strong className="text-[#1A2E22]">+{plant.xpEarned} XP</strong></div>
                                <div className="text-[11px] text-gray-400">Tưới gần nhất: {plant.lastWatered}</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleWatering(plant.id)}
                                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold flex items-center gap-1 text-xs"
                                >
                                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> Tưới Nước (+10 XP)
                                </Button>

                                <Button
                                    variant="indigo"
                                    size="sm"
                                    onClick={() => navigate(`/dashboard/learning-path/${plant.skillId}`)}
                                    className="font-bold flex items-center gap-1 text-xs"
                                >
                                    <span>Học Tiếp</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
