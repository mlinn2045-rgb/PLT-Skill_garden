import React, { useState, useEffect } from 'react'
import { ShieldCheck, UserPlus, Lock, Unlock, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { superAdminService, AdminUser } from '../../services/superAdminService'

export const AdminUserManagementPage: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const [toastMsg, setToastMsg] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchAdmins = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const data = await superAdminService.getAdminUsers()
            setAdmins(data)
        } catch (err: any) {
            setErrorMsg(err.message || 'Không thể tải danh sách Admin từ máy chủ.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAdmins()
    }, [])

    const showToast = (msg: string) => {
        setToastMsg(msg)
        setTimeout(() => setToastMsg(''), 4000)
    }

    const handleCreateAdmin = async () => {
        if (!fullName || !email || !password) {
            alert('Vui lòng nhập Họ tên, Email và Mật khẩu.')
            return
        }
        setIsSubmitting(true)
        try {
            await superAdminService.createAdminUser({
                full_name: fullName,
                email,
                username,
                password,
            })
            showToast('Đã tạo tài khoản Admin mới thành công!')
            setShowModal(false)
            setFullName('')
            setEmail('')
            setUsername('')
            setPassword('')
            fetchAdmins()
        } catch (err: any) {
            alert(err.message || 'Tạo tài khoản Admin thất bại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleLock = async (adm: AdminUser) => {
        const newStatus = adm.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'
        try {
            await superAdminService.updateAdminUser(adm.id, { status: newStatus as any })
            showToast(`Đã ${newStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản ${adm.email}`)
            fetchAdmins()
        } catch (err: any) {
            alert(err.message || 'Cập nhật trạng thái thất bại.')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa tài khoản Admin này?')) return
        try {
            await superAdminService.deleteAdminUser(id)
            showToast('Đã xóa tài khoản Admin.')
            fetchAdmins()
        } catch (err: any) {
            alert(err.message || 'Xóa tài khoản thất bại.')
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Quản Lý Tài Khoản Quản Trị Viên (Admin) (API Thật)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tạo mới tài khoản Admin, cấp quyền quản lý nội dung và khóa/mở khóa tài khoản từ CSDL MySQL.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchAdmins} disabled={isLoading} className="font-bold flex items-center gap-1 dark:border-gray-700 dark:hover:bg-gray-800">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
                    </Button>
                    <Button variant="indigo" onClick={() => setShowModal(true)} className="font-bold flex items-center gap-2 bg-purple-700 hover:bg-purple-800 border-none">
                        <UserPlus className="w-4 h-4" /> Thêm Admin mới
                    </Button>
                </div>
            </div>

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

            {/* Admin Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-xs font-bold text-gray-500 dark:text-gray-400 space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 dark:text-purple-400" />
                        <p>Đang nạp danh sách Admin từ Backend...</p>
                    </div>
                ) : admins.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400">
                        Chưa có tài khoản Admin nào trong danh sách.
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-[#E2E4EB] dark:border-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">STT</th>
                                <th className="p-4">Họ Và Tên</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Vai Trò</th>
                                <th className="p-4">Phân Quyền</th>
                                <th className="p-4">Trạng Thái</th>
                                <th className="p-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E4EB] dark:divide-gray-800">
                            {admins.map((adm, idx) => (
                                <tr key={adm.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 font-bold text-gray-600 dark:text-gray-400">{idx + 1}</td>
                                    <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                                        {adm.full_name || adm.username}
                                    </td>
                                    <td className="p-4 font-medium text-gray-600 dark:text-gray-300 font-mono">{adm.email}</td>
                                    <td className="p-4"><span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 rounded font-bold">{adm.role}</span></td>
                                    <td className="p-4 font-bold text-[#3C4097] dark:text-indigo-400">{(adm.permissions || []).length} quyền được cấp</td>
                                    <td className="p-4">
                                        <button onClick={() => toggleLock(adm)} className="flex items-center gap-1.5 font-bold cursor-pointer">
                                            {adm.status === 'ACTIVE' ? (
                                                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full flex items-center gap-1"><Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Active</span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 rounded-full flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-red-600 dark:text-red-400" /> Locked</span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(adm.id)}
                                            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Admin Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 max-w-md w-full space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Tạo Tài Khoản Admin Mới
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold block mb-1 text-gray-700 dark:text-gray-300">Họ và tên *</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="font-bold block mb-1 text-gray-700 dark:text-gray-300">Email *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@skillgarden.vn"
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="font-bold block mb-1 text-gray-700 dark:text-gray-300">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin_nguyenvana"
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="font-bold block mb-1 text-gray-700 dark:text-gray-300">Mật khẩu *</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E4EB] dark:border-gray-800">
                            <Button variant="outline" disabled={isSubmitting} onClick={() => setShowModal(false)} className="dark:border-gray-700 dark:hover:bg-gray-800">Hủy</Button>
                            <Button variant="indigo" disabled={isSubmitting} onClick={handleCreateAdmin} className="font-bold bg-purple-700 hover:bg-purple-800">
                                {isSubmitting ? 'Đang tạo...' : 'Tạo mới'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
