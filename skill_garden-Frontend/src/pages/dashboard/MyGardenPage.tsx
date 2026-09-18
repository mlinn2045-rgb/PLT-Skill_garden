import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, Droplets, Sparkles, Plus, ChevronRight, Flame, RefreshCw, Box } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../stores/authStore'
import { gardenService, UserGardenResponse } from '../../services/gardenService'
import { Tree3DViewer } from '../../components/ui/Tree3DViewer'

export const MyGardenPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [gardenData, setGardenData] = useState<UserGardenResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const [toastMsg, setToastMsg] = useState('')
    const [viewMode3D, setViewMode3D] = useState(true)

    const fetchGarden = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const data = await gardenService.getUserGarden()
            setGardenData(data)
        } catch (err: any) {
            setErrorMsg(err.message || 'Không thể lấy dữ liệu khu vườn từ máy chủ.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchGarden()
    }, [])

    const handleWatering = async (skillId: number) => {
        try {
            await gardenService.waterTree(skillId)
            setToastMsg('Tưới nước thành công! (+10 XP)')
            setTimeout(() => setToastMsg(''), 4000)
            fetchGarden()
        } catch (err: any) {
            alert(err.message || 'Thao tác tưới nước thất bại.')
        }
    }

    const trees = gardenData?.trees || []

    return (
        <div className="min-h-screen bg-[#F7F9F7] dark:bg-gray-900 text-[#1A2E22] dark:text-gray-100 pb-16 pt-6 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#1B3624] via-[#244A32] to-[#1B3624] dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-emerald-900/40">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
                    <Sprout className="w-96 h-96" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-[#2D5A3D]/80 border border-[#3D7852] px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-xs">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                            <span>KHU VƯỜN 3D GAME GRAPHICS MASTER (THREE.JS)</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            Vườn Kỹ Năng 3D Của {user?.full_name || 'Học Viên'} 🌿
                        </h1>
                        <p className="text-xs md:text-sm text-emerald-100/80 leading-relaxed">
                            Mỗi bài học bạn hoàn thành giúp cây tri thức 3D vươn cao! Dùng chuột xoay 360°, ngắm nhìn tán lá đung đưa và bấm tưới nước hiệu ứng hạt 3D.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <div className="text-center px-3 border-r border-white/10">
                            <div className="text-2xl font-black text-yellow-300">{gardenData?.stats.total_trees || trees.length}</div>
                            <div className="text-[11px] text-emerald-200">Cây Đang Trồng</div>
                        </div>
                        <div className="text-center px-3 border-r border-white/10">
                            <div className="text-2xl font-black text-emerald-300">
                                {gardenData?.stats.total_xp || 0}
                            </div>
                            <div className="text-[11px] text-emerald-200">XP Tích Lũy</div>
                        </div>
                        <div className="text-center px-3">
                            <div className="text-2xl font-black text-rose-300 flex items-center justify-center gap-1">
                                <Flame className="w-5 h-5 fill-rose-400" /> {gardenData?.stats.streak_days || 1}
                            </div>
                            <div className="text-[11px] text-emerald-200">Streak Ngày</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Featured 3D Tree Spotlight */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-[#1A2E22] dark:text-white flex items-center gap-2">
                        <Box className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Mô Phỏng Cây Kỹ Năng 3D Tương Tác
                    </h2>
                    <button
                        onClick={() => setViewMode3D(!viewMode3D)}
                        className="px-3 py-1 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-gray-700 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors shadow-2xs cursor-pointer"
                    >
                        {viewMode3D ? 'Chuyển Chế Độ 2D' : 'Bật Đồ Họa 3D (Three.js)'}
                    </button>
                </div>

                {viewMode3D && (
                    <Tree3DViewer
                        stageLevel={3}
                        treeType="CHERRY_BLOSSOM"
                        treeName="Frontend React 19 Mastery (Cây 3D Thật)"
                        growthProgress={65}
                        onWaterSuccess={() => setToastMsg('Hiệu ứng hạt nước 3D tương tác thành công! (+10 XP)')}
                    />
                )}
            </div>

            {toastMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold shadow-xs">
                    {toastMsg}
                </div>
            )}
            {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            {/* Actions & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-[#E6ECE6] dark:border-gray-700 shadow-xs">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchGarden} disabled={isLoading} className="font-bold flex items-center gap-1 cursor-pointer">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại vườn
                    </Button>
                </div>

                <Button
                    variant="indigo"
                    className="font-bold flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
                    onClick={() => navigate('/dashboard/skill-catalog')}
                >
                    <Plus className="w-4 h-4" /> Trồng Thêm Cây Mới
                </Button>
            </div>

            {/* Garden Grid */}
            {isLoading ? (
                <div className="p-12 text-center text-xs font-bold text-[#6B6D7A] dark:text-gray-400 space-y-2 bg-white dark:bg-gray-800 rounded-2xl border border-[#E6ECE6] dark:border-gray-700">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                    <p>Đang tải trạng thái khu vườn sinh thái từ Backend...</p>
                </div>
            ) : trees.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#6B6D7A] dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-[#E6ECE6] dark:border-gray-700">
                    Bạn chưa bắt đầu trồng cây kỹ năng nào. Hãy đến Danh mục kỹ năng để nhận hạt mầm đầu tiên!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trees.map((tree) => (
                        <div
                            key={tree.id}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-[#E6ECE6] dark:border-gray-700 shadow-xs hover:shadow-md transition-all duration-300 space-y-5 relative overflow-hidden group"
                        >
                            {/* Plant Top Info */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-3xl shadow-md shrink-0">
                                        🌸
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-[#3F49C8] dark:text-indigo-400 uppercase tracking-wider">
                                            {tree.plant_name || 'Cây kỹ năng'}
                                        </span>
                                        <h3 className="text-base font-extrabold text-[#1A2E22] dark:text-white group-hover:text-[#3F49C8] dark:group-hover:text-indigo-400 transition-colors">
                                            {tree.skill_name || `Kỹ năng #${tree.skill_id}`}
                                        </h3>
                                    </div>
                                </div>

                                <Badge variant="success" className="font-bold text-[11px] shrink-0">
                                    Stage {tree.level}/5
                                </Badge>
                            </div>

                            {/* Stage Progress Visual & Bold Milestone Requirement */}
                            <div className="bg-[#F8FAF8] dark:bg-gray-900 p-4 rounded-2xl border border-[#E6ECE6] dark:border-gray-700 space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-[#2D3748] dark:text-gray-300 flex items-center gap-1.5">
                                        <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        Giai đoạn: <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{tree.stage_name || 'Đang sinh trưởng'}</span>
                                    </span>
                                    <span className="font-extrabold text-[#3F49C8] dark:text-indigo-400">+{tree.xp_accumulated} XP</span>
                                </div>

                                {/* Bolded Milestone Text */}
                                <div className="p-2.5 bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-xl text-[11px]">
                                    <p className="font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wide flex items-center gap-1">
                                        <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" /> HẠN MỨC TƯỚI NƯỚC HÔM NAY: <strong>ĐÃ ĐẠT CHUẨN (+10 XP)</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Actions & Stats */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#E6ECE6] dark:border-gray-700">
                                <div className="text-xs text-[#718096] dark:text-gray-400">
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400">Trạng thái: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{tree.status}</strong></div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleWatering(tree.skill_id)}
                                        className="border-emerald-300 text-emerald-700 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold flex items-center gap-1 text-xs cursor-pointer"
                                    >
                                        <Droplets className="w-3.5 h-3.5 text-blue-500" /> Tưới Nước (+10 XP)
                                    </Button>

                                    <Button
                                        variant="indigo"
                                        size="sm"
                                        onClick={() => navigate(`/dashboard/video-learning?skill_id=${tree.skill_id}`)}
                                        className="font-bold flex items-center gap-1 text-xs cursor-pointer"
                                    >
                                        <span>Học Tiếp</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
