import React, { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Search, Shield, AlertTriangle, RefreshCw, Check, Clock, Edit, Trash2, Lock, Unlock, X, UserCog } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { API_BASE_URL } from '../../services/authService'

interface RealUser {
    id: number
    uuid: string
    email: string
    full_name: string
    username: string
    role: string
    status: string
    is_approved: number | boolean
    created_at: string
}

export const UserApprovalPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [usersList, setUsersList] = useState<RealUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const [toastMsg, setToastMsg] = useState('')

    const [selectedUser, setSelectedUser] = useState<RealUser | null>(null)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false)
    const [editFormData, setEditFormData] = useState({
        id: 0,
        full_name: '',
        email: '',
        role: 'USER',
        status: 'ACTIVE',
        is_approved: 1
    })

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [userToDelete, setUserToDelete] = useState<RealUser | null>(null)

    // Fetch real user list from Backend API
    const fetchUsers = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users.php`)
            const json = await res.json()
            const users = Array.isArray(json?.data) ? json.data : Array.isArray(json?.data?.users) ? json.data.users : []

            if (json.success && users.length >= 0) {
                setUsersList(users)
            } else {
                setErrorMsg(json.message || 'Không thể lấy dữ liệu người dùng từ máy chủ.')
            }
        } catch (err: any) {
            setErrorMsg('Lỗi kết nối API Backend: ' + (err.message || 'Server offline'))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const showToast = (msg: string) => {
        setToastMsg(msg)
        setTimeout(() => setToastMsg(''), 4000)
    }

    // Handle Approve User
    const handleApprove = async (user: RealUser) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve', user_id: user.id })
            })
            const json = await res.json()
            if (json.success) {
                showToast(`Đã phê duyệt tài khoản ${user.email} thành công!`)
                fetchUsers()
            } else {
                alert('Lỗi: ' + json.message)
            }
        } catch (err: any) {
            alert('Lỗi phê duyệt: ' + err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle Reject User Submit
    const handleRejectSubmit = async () => {
        if (!selectedUser) return
        setIsSubmitting(true)
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', user_id: selectedUser.id, reason: rejectReason })
            })
            const json = await res.json()
            if (json.success) {
                showToast(`Đã từ chối tài khoản ${selectedUser.email}`)
                setShowRejectModal(false)
                setRejectReason('')
                setSelectedUser(null)
                fetchUsers()
            } else {
                alert('Lỗi: ' + json.message)
            }
        } catch (err: any) {
            alert('Lỗi từ chối: ' + err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle Lock / Unlock
    const handleToggleLock = async (user: RealUser) => {
        setIsSubmitting(true)
        const isCurrentlyLocked = user.status === 'LOCKED'
        const action = isCurrentlyLocked ? 'unlock' : 'lock'
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, user_id: user.id })
            })
            const json = await res.json()
            if (json.success) {
                showToast(isCurrentlyLocked ? `Đã mở khóa tài khoản ${user.email} thành công!` : `Đã khóa tài khoản ${user.email}!`)
                fetchUsers()
            } else {
                alert('Lỗi: ' + json.message)
            }
        } catch (err: any) {
            alert('Lỗi thay đổi trạng thái khóa: ' + err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle Open Edit
    const handleOpenEdit = (user: RealUser) => {
        setEditFormData({
            id: user.id,
            full_name: user.full_name || '',
            email: user.email || '',
            role: user.role || 'USER',
            status: user.status || 'ACTIVE',
            is_approved: Number(user.is_approved) === 1 ? 1 : 0
        })
        setShowEditModal(true)
    }

    // Handle Edit Submit
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editFormData.email.trim()) {
            alert('Email không được để trống.')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: editFormData.id,
                    full_name: editFormData.full_name.trim(),
                    email: editFormData.email.trim(),
                    role: editFormData.role,
                    status: editFormData.status,
                    is_approved: Number(editFormData.is_approved)
                })
            })
            const json = await res.json()
            if (json.success) {
                showToast(`Cập nhật thông tin học viên ${editFormData.email} thành công!`)
                setShowEditModal(false)
                fetchUsers()
            } else {
                alert('Lỗi: ' + json.message)
            }
        } catch (err: any) {
            alert('Lỗi cập nhật người dùng: ' + err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle Delete Submit
    const handleDeleteSubmit = async () => {
        if (!userToDelete) return
        setIsSubmitting(true)
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userToDelete.id })
            })
            const json = await res.json()
            if (json.success) {
                showToast(`Đã xóa vĩnh viễn tài khoản ${userToDelete.email}!`)
                setShowDeleteModal(false)
                setUserToDelete(null)
                fetchUsers()
            } else {
                alert('Lỗi: ' + json.message)
            }
        } catch (err: any) {
            alert('Lỗi xóa người dùng: ' + err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredUsers = usersList.filter(
        (u) =>
            (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const pendingUsersCount = usersList.filter((u) => Number(u.is_approved) === 0 && u.status !== 'REJECTED' && u.status !== 'LOCKED').length
    const approvedUsersCount = usersList.filter((u) => Number(u.is_approved) === 1 && u.status !== 'LOCKED').length
    const lockedUsersCount = usersList.filter((u) => u.status === 'LOCKED').length

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Shield className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Quản Lý Duyệt & Phân Quyền Học Viên
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Hỗ trợ đầy đủ chức năng Duyệt, Chỉnh sửa, Khóa/Mở khóa và Xóa tài khoản học viên đồng bộ trực tiếp CSDL MySQL.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1.5 bg-[#FFFBEB] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 text-xs font-bold rounded-xl border border-[#FEF3C7] dark:border-amber-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Chờ duyệt: {pendingUsersCount}
                    </span>
                    <span className="px-3 py-1.5 bg-[#DCEFE1] dark:bg-emerald-950/40 text-[#2C6A3D] dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Đã duyệt: {approvedUsersCount}
                    </span>
                    {lockedUsersCount > 0 && (
                        <span className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                            <Lock className="w-4 h-4" /> Đã khóa: {lockedUsersCount}
                        </span>
                    )}
                    <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading} className="font-bold flex items-center gap-1 dark:border-gray-700 dark:hover:bg-gray-800 cursor-pointer">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
                    </Button>
                </div>
            </div>

            {/* Toast feedback */}
            {toastMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* Error message */}
            {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 flex items-center justify-between gap-4 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm theo Tên, Username hoặc Email học viên..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm overflow-x-auto">
                {isLoading ? (
                    <div className="p-12 text-center text-xs font-bold text-gray-500 dark:text-gray-400 space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#3C4097] dark:text-indigo-400" />
                        <p>Đang nạp dữ liệu tài khoản từ MySQL Database...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400">
                        Không tìm thấy tài khoản học viên nào phù hợp.
                    </div>
                ) : (
                    <table className="w-full text-left text-xs min-w-[700px]">
                        <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-[#E2E4EB] dark:border-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">STT</th>
                                <th className="p-4">Họ Và Tên</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Quyền</th>
                                <th className="p-4">Ngày Đăng Ký</th>
                                <th className="p-4">Trạng Thái</th>
                                <th className="p-4 text-right whitespace-nowrap">Thao Tác Quản Trị</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E4EB] dark:divide-gray-800">
                            {filteredUsers.map((u, idx) => {
                                const isApproved = Number(u.is_approved) === 1
                                const isRejected = u.status === 'REJECTED' || u.status === 'INACTIVE'
                                const isLocked = u.status === 'LOCKED'

                                return (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 font-bold text-gray-600 dark:text-gray-400">{idx + 1}</td>
                                        <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                                            {u.full_name || u.username || 'Học viên'}
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300 font-mono">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded font-bold ${u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
                                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-[#3C4097] dark:text-indigo-300'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : 'Mới tạo'}
                                        </td>
                                        <td className="p-4">
                                            {isLocked ? (
                                                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full font-bold inline-flex items-center gap-1">
                                                    <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Đã khóa
                                                </span>
                                            ) : isApproved ? (
                                                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full font-bold inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Đã phê duyệt
                                                </span>
                                            ) : isRejected ? (
                                                <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 rounded-full font-bold inline-flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" /> Đã từ chối
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-full font-bold inline-flex items-center gap-1 animate-pulse">
                                                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Chờ phê duyệt
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Duyệt & Từ chối nếu chưa được duyệt */}
                                                {!isApproved && !isRejected && (
                                                    <>
                                                        <Button
                                                            variant="indigo"
                                                            size="sm"
                                                            disabled={isSubmitting}
                                                            onClick={() => handleApprove(u)}
                                                            className="font-bold shadow-xs text-xs px-2.5 py-1 cursor-pointer"
                                                        >
                                                            Duyệt
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={isSubmitting}
                                                            className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-200 dark:border-amber-900 font-bold text-xs px-2 py-1 cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedUser(u)
                                                                setShowRejectModal(true)
                                                            }}
                                                        >
                                                            Từ chối
                                                        </Button>
                                                    </>
                                                )}

                                                {/* Sửa thông tin tài khoản */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isSubmitting}
                                                    onClick={() => handleOpenEdit(u)}
                                                    className="font-bold text-xs px-2 py-1 dark:border-gray-700 dark:hover:bg-gray-800 cursor-pointer"
                                                    title="Chỉnh sửa thông tin học viên"
                                                >
                                                    <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mr-1" />
                                                    <span>Sửa</span>
                                                </Button>

                                                {/* Khóa / Mở khóa tài khoản */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isSubmitting}
                                                    onClick={() => handleToggleLock(u)}
                                                    className={`font-bold text-xs px-2 py-1 cursor-pointer ${isLocked
                                                        ? 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                                        : 'text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                        }`}
                                                    title={isLocked ? 'Mở khóa tài khoản học viên' : 'Khóa tài khoản học viên'}
                                                >
                                                    {isLocked ? (
                                                        <>
                                                            <Unlock className="w-3.5 h-3.5 text-amber-500 mr-1" />
                                                            <span>Mở khóa</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="w-3.5 h-3.5 text-gray-500 mr-1" />
                                                            <span>Khóa</span>
                                                        </>
                                                    )}
                                                </Button>

                                                {/* Xóa tài khoản */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isSubmitting || u.role === 'SUPER_ADMIN'}
                                                    onClick={() => {
                                                        setUserToDelete(u)
                                                        setShowDeleteModal(true)
                                                    }}
                                                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900 font-bold text-xs px-2 py-1 cursor-pointer"
                                                    title="Xóa vĩnh viễn tài khoản học viên"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                    <span>Xóa</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-[#E2E4EB] dark:border-gray-800 max-w-lg w-full space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                            <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-400">
                                <UserCog className="w-5 h-5" />
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Chỉnh sửa thông tin học viên</h3>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-bold text-gray-700 dark:text-gray-300">
                            <div>
                                <label className="block mb-1 text-gray-900 dark:text-gray-200">Họ Và Tên (*)</label>
                                <input
                                    type="text"
                                    required
                                    value={editFormData.full_name}
                                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-gray-900 dark:text-gray-200">Email (*)</label>
                                <input
                                    type="email"
                                    required
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:text-white font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-1 text-gray-900 dark:text-gray-200">Vai Trò (Role)</label>
                                    <select
                                        value={editFormData.role}
                                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:text-white"
                                    >
                                        <option value="USER">USER (Học viên)</option>
                                        <option value="ADMIN">ADMIN (Quản trị viên)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-900 dark:text-gray-200">Trạng Thái (Status)</label>
                                    <select
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:text-white"
                                    >
                                        <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                                        <option value="LOCKED">LOCKED (Bị khóa)</option>
                                        <option value="INACTIVE">INACTIVE (Ngừng hoạt động)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 text-gray-900 dark:text-gray-200">Trạng Thái Phê Duyệt</label>
                                <select
                                    value={editFormData.is_approved}
                                    onChange={(e) => setEditFormData({ ...editFormData, is_approved: Number(e.target.value) })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:text-white"
                                >
                                    <option value={1}>Đã phê duyệt (Cho phép đăng nhập)</option>
                                    <option value={0}>Chờ phê duyệt (Khóa quyền truy cập)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setShowEditModal(false)} className="dark:border-gray-700 cursor-pointer">
                                    Hủy
                                </Button>
                                <Button type="submit" variant="indigo" disabled={isSubmitting} className="font-bold cursor-pointer">
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-red-200 dark:border-red-900 max-w-md w-full space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-6 h-6 shrink-0" />
                            <h3 className="text-base font-extrabold">Xác nhận xóa tài khoản</h3>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản học viên <strong className="text-gray-900 dark:text-white font-mono">{userToDelete?.email}</strong>?
                            Hành động này sẽ xóa toàn bộ tiến trình học, điểm XP và cây sinh trưởng trong khu vườn của học viên này.
                        </p>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" disabled={isSubmitting} onClick={() => setShowDeleteModal(false)} className="dark:border-gray-700 cursor-pointer">
                                Hủy
                            </Button>
                            <Button
                                variant="outline"
                                disabled={isSubmitting}
                                className="bg-red-600 text-white hover:bg-red-700 font-bold cursor-pointer"
                                onClick={handleDeleteSubmit}
                            >
                                {isSubmitting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-[#E2E4EB] dark:border-gray-800 max-w-md w-full space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-base font-extrabold">Từ chối tài khoản học viên</h3>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300">
                            Vui lòng nhập lý do từ chối tài khoản <span className="font-bold text-gray-900 dark:text-white">{selectedUser?.email}</span> để gửi thông báo phản hồi.
                        </p>

                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="Nhập lý do từ chối (Ví dụ: Định danh email không khớp với danh sách lớp)..."
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" disabled={isSubmitting} onClick={() => setShowRejectModal(false)} className="dark:border-gray-700 cursor-pointer">Hủy</Button>
                            <Button
                                variant="outline"
                                disabled={isSubmitting}
                                className="bg-red-600 text-white hover:bg-red-700 font-bold cursor-pointer"
                                onClick={handleRejectSubmit}
                            >
                                {isSubmitting ? 'Đang từ chối...' : 'Xác nhận Từ chối'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

