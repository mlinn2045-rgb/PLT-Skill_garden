import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Search, Edit3, Trash2, Sprout, ToggleLeft, ToggleRight, RefreshCw, CheckCircle2, AlertTriangle, Sparkles, X, Layers } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { adminService, SkillItem, PlantType } from '../../services/adminService'

export const CourseManagementPage: React.FC = () => {
    const [courses, setCourses] = useState<SkillItem[]>([])
    const [plants, setPlants] = useState<PlantType[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [syncStatus, setSyncStatus] = useState<string>('SYNCED')
    const [lastSyncedTime, setLastSyncedTime] = useState<string>('Vừa xong')
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('ALL')
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<SkillItem | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Development',
        description: '',
        icon_url: '',
        plant_id: '',
        status: 'ACTIVE'
    })

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ type, msg })
        setTimeout(() => setToastMessage(null), 4000)
    }

    const loadData = async () => {
        setLoading(true)
        try {
            const [skillData, plantData] = await Promise.all([
                adminService.getSkills(),
                adminService.getPlants().catch(() => [])
            ])
            setCourses(skillData)
            setPlants(plantData)
            setSyncStatus('SYNCED')
            setLastSyncedTime(new Date().toLocaleTimeString('vi-VN'))
        } catch (error: any) {
            setSyncStatus('FAILED')
            showToast('Không thể tải danh sách khóa học từ máy chủ.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const checkRealtimeSync = async () => {
        setSyncing(true)
        try {
            const syncInfo = await adminService.getCourseSyncStatus()
            if (syncInfo && syncInfo.sync_status) {
                setSyncStatus(syncInfo.sync_status.sync_status || 'SYNCED')
            } else {
                setSyncStatus('SYNCED')
            }
            setLastSyncedTime(new Date().toLocaleTimeString('vi-VN'))
        } catch {
            setSyncStatus('FAILED')
        } finally {
            setSyncing(false)
        }
    }

    useEffect(() => {
        loadData()
        const interval = setInterval(checkRealtimeSync, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleOpenCreateModal = () => {
        setEditingCourse(null)
        setFormData({
            title: '',
            slug: '',
            category: 'Frontend',
            description: '',
            icon_url: '',
            plant_id: plants[0]?.id ? String(plants[0].id) : '',
            status: 'ACTIVE'
        })
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (course: SkillItem) => {
        setEditingCourse(course)
        setFormData({
            title: course.title || '',
            slug: course.slug || '',
            category: course.category || 'Development',
            description: course.description || '',
            icon_url: course.icon_url || '',
            plant_id: (course as any).plant_id ? String((course as any).plant_id) : '',
            status: course.status || 'ACTIVE'
        })
        setIsModalOpen(true)
    }

    const handleSaveCourse = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) {
            showToast('Vui lòng nhập tên khóa học!', 'error')
            return
        }

        setSyncStatus('PENDING')
        try {
            if (editingCourse) {
                await adminService.updateSkill(editingCourse.id, {
                    title: formData.title,
                    category: formData.category,
                    description: formData.description,
                    icon_url: formData.icon_url,
                    plant_id: formData.plant_id ? Number(formData.plant_id) : undefined,
                    status: formData.status
                } as any)
                showToast('✅ Cập nhật khóa học và tự động đồng bộ tức thời thành công!')
            } else {
                await adminService.createSkill({
                    title: formData.title,
                    slug: formData.slug || undefined,
                    category: formData.category,
                    description: formData.description,
                    icon_url: formData.icon_url,
                    plant_id: formData.plant_id ? Number(formData.plant_id) : undefined,
                    status: formData.status
                })
                showToast('🎉 Tạo khóa học mới và đồng bộ dữ liệu người dùng thành công!')
            }
            setIsModalOpen(false)
            await loadData()
        } catch (error: any) {
            setSyncStatus('FAILED')
            showToast(`⚠️ Lỗi thao tác (Đã tự động Rollback): ${error?.message || 'Có lỗi xảy ra'}`, 'error')
        }
    }

    const handleDeleteCourse = async (course: SkillItem) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${course.title}"?\n\nTác vụ này sẽ thực hiện Cascading Rollback xóa an toàn các liên kết liên quan.`)) {
            return
        }

        setSyncStatus('PENDING')
        try {
            await adminService.deleteSkill(course.id)
            showToast(`🗑️ Đã xóa khóa học "${course.title}" và đồng bộ real-time UI người dùng.`)
            await loadData()
        } catch (error: any) {
            setSyncStatus('FAILED')
            showToast(`⚠️ Xóa thất bại (Đã Rollback trạng thái CSDL): ${error?.message || 'Có lỗi xảy ra'}`, 'error')
        }
    }

    const toggleStatus = async (course: SkillItem) => {
        const nextStatus = course.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE'
        try {
            await adminService.updateSkill(course.id, { status: nextStatus })
            showToast(`Đã đổi trạng thái khóa học sang "${nextStatus === 'ACTIVE' ? 'Xuất bản' : 'Nháp'}".`)
            await loadData()
        } catch (error: any) {
            showToast(`Thay đổi trạng thái thất bại: ${error?.message}`, 'error')
        }
    }

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCat = categoryFilter === 'ALL' || c.category.toUpperCase() === categoryFilter.toUpperCase()
        return matchesSearch && matchesCat
    })

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Toast Alert */}
            {toastMessage && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 font-bold text-xs animate-in slide-in-from-top-2 duration-200 ${toastMessage.type === 'success'
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-rose-600 text-white border-rose-400'
                    }`}>
                    {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span>{toastMessage.msg}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                            <BookOpen className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Quản Lý Danh Sách Khóa Học
                        </h1>
                        {/* Real-time Sync Status Indicator */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${syncStatus === 'SYNCED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : syncStatus === 'PENDING'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}>
                            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-indigo-600' : ''}`} />
                            <span>
                                {syncStatus === 'SYNCED' ? 'Đồng bộ Real-Time Active (< 2s)' : syncStatus === 'PENDING' ? 'Đang đồng bộ...' : 'Lỗi đồng bộ'}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý đầy đủ tính năng Tạo, Sửa, Xóa khóa học. Tự động đồng bộ tức thời cho toàn bộ Học viên. Lần kiểm tra mới nhất: <strong>{lastSyncedTime}</strong>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={loadData} className="font-bold flex items-center gap-1.5 text-xs">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
                    </Button>
                    <Button variant="indigo" onClick={handleOpenCreateModal} className="font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Tạo khóa học mới
                    </Button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên hoặc danh mục khóa học..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3C4097] dark:text-white font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <span className="text-xs font-bold text-gray-500 shrink-0">Danh mục:</span>
                    {['ALL', 'FRONTEND', 'BACKEND', 'DATABASE', 'DATA', 'DEVOPS', 'QA'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${categoryFilter === cat
                                ? 'bg-[#3C4097] text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            {cat === 'ALL' ? 'Tất cả' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center text-sm font-bold text-gray-500">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#3C4097] mb-2" />
                        Đang tải danh sách khóa học và trạng thái đồng bộ...
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Không tìm thấy khóa học nào phù hợp.</p>
                        <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setCategoryFilter('ALL') }}>Xóa bộ lọc</Button>
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-[#E2E4EB] dark:border-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">STT</th>
                                <th className="p-4">Tên Khóa Học</th>
                                <th className="p-4">Mã Slug</th>
                                <th className="p-4">Danh Mục</th>
                                <th className="p-4">Cây Sinh Trưởng</th>
                                <th className="p-4">Trạng Thái</th>
                                <th className="p-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E4EB] dark:divide-gray-800">
                            {filteredCourses.map((c, idx) => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 font-bold text-gray-600 dark:text-gray-400">{idx + 1}</td>
                                    <td className="p-4 font-bold text-gray-900 dark:text-gray-100 max-w-xs truncate">{c.title}</td>
                                    <td className="p-4 font-mono text-[11px] text-gray-500 dark:text-gray-400">{c.slug}</td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-md font-extrabold border border-indigo-200 dark:border-indigo-800">
                                            {c.category}
                                        </span>
                                    </td>
                                    <td className="p-4 font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                        <Sprout className="w-4 h-4 text-emerald-500" />
                                        <span>{(c as any).plant_name || 'Cây mặc định'}</span>
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => toggleStatus(c)} className="flex items-center gap-1.5 font-bold cursor-pointer">
                                            {c.status === 'ACTIVE' ? (
                                                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full flex items-center gap-1">
                                                    <ToggleRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Xuất bản
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full flex items-center gap-1">
                                                    <ToggleLeft className="w-4 h-4 text-gray-500" /> Nháp
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEditModal(c)}
                                            className="font-bold dark:border-gray-700 dark:hover:bg-gray-800 cursor-pointer"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Sửa
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteCourse(c)}
                                            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create & Edit Course Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" />
                                {editingCourse ? 'Chỉnh Sửa Khóa Học' : 'Tạo Khóa Học Mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCourse} className="space-y-4 text-xs font-bold text-gray-700 dark:text-gray-300">
                            <div>
                                <label className="block mb-1">Tên Khóa Học (*)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: React 19 & TypeScript Masterclass"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-1">Danh Mục</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:text-white"
                                    >
                                        <option value="Frontend">Frontend</option>
                                        <option value="Backend">Backend</option>
                                        <option value="Database">Database</option>
                                        <option value="Data">Data / AI</option>
                                        <option value="DevOps">DevOps</option>
                                        <option value="QA">QA & Testing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1">Trạng Thái</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:text-white"
                                    >
                                        <option value="ACTIVE">Xuất bản (ACTIVE)</option>
                                        <option value="DRAFT">Bản nháp (DRAFT)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1">Cây Sinh Trưởng Gán Vào</label>
                                <select
                                    value={formData.plant_id}
                                    onChange={(e) => setFormData({ ...formData, plant_id: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:text-white"
                                >
                                    <option value="">-- Mặc định --</option>
                                    {plants.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1">Mô Tả Chi Tiết Khóa Học</label>
                                <textarea
                                    rows={3}
                                    placeholder="Nhập mô tả tóm tắt nội dung bài học..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:text-white"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                                <Button type="submit" variant="indigo" className="font-black">
                                    {editingCourse ? 'Lưu & Đồng bộ Changes' : 'Tạo mới & Đồng bộ Instant'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
