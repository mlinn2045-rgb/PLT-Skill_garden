import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react'
import { Sprout, Droplets, Sparkles, Plus, ChevronRight, Flame, Filter, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../stores/authStore'
import { gardenService, GardenTree, UserGardenResponse } from '../../services/gardenService'

export const MyGardenPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [filterCategory, setFilterCategory] = useState<string>('ALL')
    const [gardenData, setGardenData] = useState<UserGardenResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const [toastMsg, setToastMsg] = useState('')

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
                            <span>KHU VƯỜN KỸ NĂNG CÁ NHÂN (API THẬT)</span>
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

            {toastMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shadow-xs">
                    {toastMsg}
                </div>
            )}
            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            {/* Actions & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E6ECE6] shadow-xs">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchGarden} disabled={isLoading} className="font-bold flex items-center gap-1">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại vườn
                    </Button>
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
            {isLoading ? (
                <div className="p-12 text-center text-xs font-bold text-[#6B6D7A] space-y-2 bg-white rounded-2xl border border-[#E6ECE6]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                    <p>Đang tải trạng thái khu vườn sinh thái từ Backend...</p>
                </div>
            ) : trees.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#6B6D7A] bg-white rounded-2xl border border-[#E6ECE6]">
                    Bạn chưa bắt đầu trồng cây kỹ năng nào. Hãy đến Danh mục kỹ năng để nhận hạt mầm đầu tiên!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trees.map((tree) => (
                        <div
                            key={tree.id}
                            className="bg-white rounded-3xl p-6 border border-[#E6ECE6] shadow-xs hover:shadow-md transition-all duration-300 space-y-5 relative overflow-hidden group"
                        >
                            {/* Plant Top Info */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl shadow-md shrink-0">
                                        🌸
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-[#3F49C8] uppercase tracking-wider">
                                            {tree.plant_name || 'Cây kỹ năng'}
                                        </span>
                                        <h3 className="text-base font-extrabold text-[#1A2E22] group-hover:text-[#3F49C8] transition-colors">
                                            {tree.skill_name || `Kỹ năng #${tree.skill_id}`}
                                        </h3>
                                    </div>
                                </div>

                                <Badge variant="success" className="font-bold text-[11px] shrink-0">
                                    Stage {tree.level}/5
                                </Badge>
                            </div>

                            {/* Stage Progress Visual */}
                            <div className="bg-[#F8FAF8] p-4 rounded-2xl border border-[#E6ECE6] space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-[#2D3748] flex items-center gap-1.5">
                                        <Sprout className="w-4 h-4 text-emerald-600" />
                                        Giai đoạn: <span className="text-emerald-700 font-extrabold">{tree.stage_name || 'Đang sinh trưởng'}</span>
                                    </span>
                                    <span className="font-extrabold text-[#3F49C8]">+{tree.xp_accumulated} XP</span>
                                </div>
                            </div>

                            {/* Bottom Actions & Stats */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#E6ECE6]">
                                <div className="text-xs text-[#718096]">
                                    <div className="text-[11px] text-gray-400">Trạng thái: {tree.status}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleWatering(tree.skill_id)}
                                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold flex items-center gap-1 text-xs"
                                    >
                                        <Droplets className="w-3.5 h-3.5 text-blue-500" /> Tưới Nước (+10 XP)
                                    </Button>

                                    <Button
                                        variant="indigo"
                                        size="sm"
                                        onClick={() => navigate(`/dashboard/learning-path/${tree.skill_id}`)}
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
            )}
        </div>
    )
}
