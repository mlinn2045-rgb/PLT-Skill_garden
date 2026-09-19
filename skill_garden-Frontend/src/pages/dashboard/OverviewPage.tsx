import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Flame,
    Zap,
    Award,
    ArrowRight,
    Plus,
    RefreshCw
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useAuthStore } from '../../stores/authStore'
<<<<<<< HEAD
import { gardenService, UserGardenResponse, GardenTree } from '../../services/gardenService'
=======
import { getSkillGrowth } from '../../services/learningProgress'
import { getStudentStats } from '../../services/studentStats'
>>>>>>> b774379 (fix FE)

export const OverviewPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
<<<<<<< HEAD
=======
    const displayName = user?.full_name || user?.email?.split('@')[0] || 'bạn'
    const userKey = user?.email || 'guest'
    const studentStats = getStudentStats(userKey)
>>>>>>> b774379 (fix FE)

    const [gardenData, setGardenData] = useState<UserGardenResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchGardenData = async () => {
            setIsLoading(true)
            try {
                const data = await gardenService.getUserGarden()
                setGardenData(data)
            } catch {
                // Fallback graceful handling
            } finally {
                setIsLoading(false)
            }
        }
<<<<<<< HEAD
        fetchGardenData()
    }, [])
        }
        fetchGardenData()
    }, [])

    const trees: GardenTree[] = gardenData?.trees || []
    const totalTrees = gardenData?.stats.total_trees || trees.length || 0
    const totalXp = gardenData?.stats.total_xp || 0
    const streakDays = gardenData?.stats.streak_days || 1
=======
    ].map(plant => {
        const growth = getSkillGrowth(String(plant.id), userKey)
        return {
            ...plant,
            stage: growth.stageName,
            level: growth.stageLevel,
            progress: growth.progress,
            xp: growth.xpEarned,
            status: growth.progress > 0 ? 'Đang phát triển' : 'Chưa bắt đầu',
        }
    })
    const totalXp = plants.reduce((sum, plant) => sum + plant.xp, 0)
    const completedSkills = plants.filter(plant => plant.progress > 0).length
>>>>>>> b774379 (fix FE)

    return (
        <div className="space-y-8 pb-12 text-[#1A2E22] dark:text-gray-100">

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#EEFAF2] via-[#EAF4EF] to-[#EBF0FE] dark:from-gray-800 dark:via-gray-800/90 dark:to-gray-900 border border-[#68D391]/30 dark:border-emerald-800/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Badge variant="skill">VƯỜN TRÍ THỨC SỐ • PLT SKILLGARDEN</Badge>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#1A2E22] dark:text-white tracking-tight">
                            Chào mừng trở lại khu vườn, {user?.full_name || user?.email?.split('@')[0] || 'Học Viên'}! 🌱
                        </h1>
<<<<<<< HEAD
                        <p className="text-xs sm:text-sm text-[#4A5568] dark:text-gray-300 max-w-xl">
                            Hôm nay khí hậu khu vườn rất lý tưởng. Hãy duy trì chuỗi <strong>{streakDays} ngày streak</strong> của bạn bằng cách tưới nước và học bài hôm nay!
=======
                        <p className="text-xs sm:text-sm text-[#4A5568] max-w-xl">
                            Hãy bắt đầu bài học và hoàn thành quiz để tưới dinh dưỡng cho các cây kỹ năng. Chuỗi hiện tại: <strong>{studentStats.streakDays} ngày streak</strong>.
>>>>>>> b774379 (fix FE)
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            variant="primary"
                            size="lg"
                            iconRight={<ArrowRight className="w-4 h-4" />}
                            onClick={() => {
                                const activeSkillId = trees[0]?.skill_id || 1
                                navigate(`/dashboard/video-learning?skill_id=${activeSkillId}`)
                            }}
                        >
                            Tiếp tục bài học
                        </Button>
                    </div>
                </div>
            </div>

            {/* 4 Stat Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-xl">
                        🪴
                    </div>
                    <div>
                        <div className="text-xl font-black text-[#1A2E22] dark:text-white">{totalTrees} Cây</div>
                        <div className="text-xs text-[#718096] dark:text-gray-400">Đang sinh trưởng</div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-xl">
                        <Zap className="w-6 h-6 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
<<<<<<< HEAD
                        <div className="text-xl font-black text-[#1A2E22] dark:text-white">{totalXp} XP</div>
                        <div className="text-xs text-[#718096] dark:text-gray-400">Tổng tích lũy</div>
=======
                        <div className="text-xl font-black text-[#1A2E22]">{studentStats.xp} XP</div>
                        <div className="text-xs text-[#718096]">Tổng tích lũy</div>
>>>>>>> b774379 (fix FE)
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold text-xl">
                        <Flame className="w-6 h-6 fill-red-500 text-red-500" />
                    </div>
                    <div>
<<<<<<< HEAD
                        <div className="text-xl font-black text-[#1A2E22] dark:text-white">{streakDays} Ngày</div>
                        <div className="text-xs text-[#718096] dark:text-gray-400">Chuỗi Streak liên tục</div>
=======
                        <div className="text-xl font-black text-[#1A2E22]">{studentStats.streakDays} Ngày</div>
                        <div className="text-xs text-[#718096]">Chuỗi Streak liên tục</div>
>>>>>>> b774379 (fix FE)
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-[#3F49C8] dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
<<<<<<< HEAD
                        <div className="text-xl font-black text-[#1A2E22] dark:text-white">3 Huy hiệu</div>
                        <div className="text-xs text-[#718096] dark:text-gray-400">Đã thu hoạch</div>
=======
                        <div className="text-xl font-black text-[#1A2E22]">{completedSkills} Huy hiệu</div>
                        <div className="text-xs text-[#718096]">Đã thu hoạch</div>
>>>>>>> b774379 (fix FE)
                    </div>
                </Card>
            </div>

            {/* Garden Canvas Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#1A2E22] dark:text-white">Khu vườn kỹ năng của bạn</h2>
                        <p className="text-xs text-[#718096] dark:text-gray-400">Chăm sóc các chồi cây bằng cách hoàn thành bài học và quiz mỗi ngày</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => navigate('/dashboard/skill-catalog')}
                    >
                        Trồng thêm cây mới
                    </Button>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-xs font-bold text-[#6B6D7A] dark:text-gray-400 space-y-2 bg-white dark:bg-gray-800 rounded-2xl border border-[#E6ECE6] dark:border-gray-700">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                        <p>Đang nạp tiến trình sinh trưởng khu vườn từ máy chủ...</p>
                    </div>
                ) : trees.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        Chưa có cây trồng nào. Hãy nhấn "Trồng thêm cây mới" để bắt đầu!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {trees.map((tree) => {
                            const progressPercent = Math.min(100, Math.round((tree.xp_accumulated / 200) * 100))
                            return (
                                <Card key={tree.id} hoverEffect className="p-6 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#E6FFFA] dark:bg-emerald-950 text-2xl flex items-center justify-center border border-[#68D391]/30">
                                                🌸
                                            </div>
                                            <div>
                                                <h3 className="text-base font-extrabold text-[#1A2E22] dark:text-white">{tree.plant_name || tree.skill_name || 'Cây kỹ năng'}</h3>
                                                <div className="flex items-center gap-2 text-xs text-[#718096] dark:text-gray-400 mt-0.5">
                                                    <span>{tree.stage_name || 'Đang sinh trưởng'}</span>
                                                    <span>•</span>
                                                    <span className="font-bold text-[#2D7A4F] dark:text-emerald-400">Cấp {tree.level}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Badge variant={progressPercent === 100 ? 'success' : 'skill'}>
                                            {tree.status || 'Active'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1.5 pt-2">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-[#4A5568] dark:text-gray-300">Tiến độ sinh trưởng</span>
                                            <span className="font-mono text-[#2D7A4F] dark:text-emerald-400">{progressPercent}%</span>
                                        </div>
                                        <ProgressBar progress={progressPercent} size="md" />
                                    </div>

                                    <div className="pt-3 border-t border-[#E6ECE6] dark:border-gray-700 flex items-center justify-between text-xs">
                                        <span className="text-[#718096] dark:text-gray-400">TÍCH LŨY: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{tree.xp_accumulated} XP</strong></span>
                                        <button
                                            onClick={() => navigate(`/dashboard/video-learning?skill_id=${tree.skill_id}`)}
                                            className="font-bold text-[#3F49C8] dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            Học tiếp bài học &rsaquo;
                                        </button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
