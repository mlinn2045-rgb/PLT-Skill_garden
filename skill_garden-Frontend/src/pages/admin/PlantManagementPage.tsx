import React, { useState, useEffect } from 'react'
import { Sprout, Plus, Edit, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { adminService, PlantType } from '../../services/adminService'

export const PlantManagementPage: React.FC = () => {
    const [plants, setPlants] = useState<PlantType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const [toastMsg, setToastMsg] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [plantName, setPlantName] = useState('')
    const [plantCode, setPlantCode] = useState('')
    const [description, setDescription] = useState('')
    const [iconUrl, setIconUrl] = useState('🌸')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchPlants = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const data = await adminService.getPlants()
            setPlants(data)
        } catch (err: any) {
            setErrorMsg(err.message || 'Lỗi kết nối API loại cây.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPlants()
    }, [])

    const showToast = (msg: string) => {
        setToastMsg(msg)
        setTimeout(() => setToastMsg(''), 4000)
    }

    const handleCreatePlant = async () => {
        if (!plantName || !plantCode) {
            alert('Vui lòng nhập Tên cây và Mã cây.')
            return
        }
        setIsSubmitting(true)
        try {
            await adminService.createPlant({
                name: plantName,
                code: plantCode,
                description,
                icon_url: iconUrl,
            })
            showToast('Đã thêm loại cây mới thành công!')
            setShowModal(false)
            setPlantName('')
            setPlantCode('')
            setDescription('')
            fetchPlants()
        } catch (err: any) {
            alert(err.message || 'Tạo loại cây thất bại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeletePlant = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa loại cây này?')) return
        try {
            await adminService.deletePlant(id)
            showToast('Đã xóa loại cây.')
            fetchPlants()
        } catch (err: any) {
            alert(err.message || 'Xóa loại cây thất bại.')
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Quản Lý Loại Cây & Sinh Trưởng Vườn (API Thật)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Cấu hình biểu tượng, 5 giai đoạn phát triển và gán loại cây đại diện từ CSDL MySQL.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchPlants} disabled={isLoading} className="font-bold flex items-center gap-1 dark:border-gray-700 dark:hover:bg-gray-800">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
                    </Button>
                    <Button variant="indigo" onClick={() => setShowModal(true)} className="font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Thêm loại cây mới
                    </Button>
                </div>
            </div>

            {/* Feedback */}
            {toastMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold shadow-xs">
                    {toastMsg}
                </div>
            )}
            {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            {/* Plants Grid */}
            {isLoading ? (
                <div className="p-12 text-center text-xs font-bold text-gray-500 dark:text-gray-400 space-y-2 bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#3C4097] dark:text-indigo-400" />
                    <p>Đang nạp danh sách loại cây từ Backend...</p>
                </div>
            ) : plants.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800">
                    Chưa có loại cây nào trong hệ thống. Hãy nhấn "Thêm loại cây mới" để tạo cây đầu tiên.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plants.map((plant) => (
                        <div key={plant.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-3xl shadow-xs">
                                        {plant.icon_url || '🌿'}
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">{plant.code}</span>
                                        <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">{plant.name}</h3>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold rounded-full">
                                    ACTIVE
                                </span>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {plant.description || 'Chưa có mô tả cho loại cây này.'}
                            </p>

                            {/* Stages list */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-extrabold uppercase text-gray-600 dark:text-gray-400 block">
                                    GIAI ĐOẠN PHÁT TRIỂN:
                                </label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {(plant.stages && plant.stages.length > 0
                                        ? plant.stages
                                        : [
                                            { stage_level: 1, stage_name: 'Hạt mầm' },
                                            { stage_level: 2, stage_name: 'Nảy mầm' },
                                            { stage_level: 3, stage_name: 'Cây con' },
                                            { stage_level: 4, stage_name: 'Trưởng thành' },
                                            { stage_level: 5, stage_name: 'Đơm hoa' },
                                        ]
                                    ).map((stg: any, idx: number) => (
                                        <div key={idx} className="p-2 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/60 rounded-xl text-center space-y-1">
                                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold mx-auto flex items-center justify-center">
                                                {stg.stage_level || idx + 1}
                                            </div>
                                            <div className="text-[10px] font-bold text-emerald-900 dark:text-emerald-300 truncate" title={stg.stage_name}>
                                                {stg.stage_name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E4EB] dark:border-gray-800">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeletePlant(plant.id)}
                                    className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold"
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 max-w-md w-full space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Thêm loại cây mới
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold block mb-1 text-gray-700 dark:text-gray-300">Tên loại cây *</label>
                                <input
                                    type="text"
                                    value={plantName}
                                    onChange={(e) => setPlantName(e.target.value)}
                                    placeholder="Ví dụ: Cây Hoa Anh Đào"
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="font-bold block mb-1 text-gray-700 dark:text-gray-300">Mã loại cây (Code) *</label>
                                <input
                                    type="text"
                                    value={plantCode}
                                    onChange={(e) => setPlantCode(e.target.value)}
                                    placeholder="CHERRY_BLOSSOM"
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500 outline-none uppercase font-mono"
                                />
                            </div>
                            <div>
                                <label className="font-bold block mb-1 text-gray-700 dark:text-gray-300">Biểu tượng (Emoji / URL)</label>
                                <input
                                    type="text"
                                    value={iconUrl}
                                    onChange={(e) => setIconUrl(e.target.value)}
                                    placeholder="🌸"
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="font-bold block mb-1 text-gray-700 dark:text-gray-300">Mô tả ngắn</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    placeholder="Mô tả đặc điểm loại cây..."
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E4EB] dark:border-gray-800">
                            <Button variant="outline" disabled={isSubmitting} onClick={() => setShowModal(false)} className="dark:border-gray-700 dark:hover:bg-gray-800">Hủy</Button>
                            <Button variant="indigo" disabled={isSubmitting} onClick={handleCreatePlant} className="font-bold">
                                {isSubmitting ? 'Đang tạo...' : 'Tạo mới'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
