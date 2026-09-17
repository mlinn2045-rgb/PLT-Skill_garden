import React, { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Search, Shield, AlertTriangle, RefreshCw, Check, Clock } from 'lucide-react'
import { Button } from '../../components/ui/Button'

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

    // Fetch real user list from Backend API
    const fetchUsers = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const res = await fetch('http://localhost:8000/api/admin/users.php')
            const json = await res.json()
            if (json.success && Array.isArray(json.data)) {
                setUsersList(json.data)
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
            const res = await fetch('http://localhost:8000/api/admin/users.php', {
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
            const res = await fetch('http://localhost:8000/api/admin/users.php', {
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

    const filteredUsers = usersList.filter(
        (u) =>
            (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const pendingUsersCount = usersList.filter((u) => Number(u.is_approved) === 0 && u.status !== 'REJECTED').length
    const approvedUsersCount = usersList.filter((u) => Number(u.is_approved) === 1).length

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-[#3C4097]" /> Quản Lý Duyệt Tài Khoản (Dữ Liệu Thật)
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">
                        Dữ liệu thời gian thực được đồng bộ trực tiếp từ Database MySQL (`skill_garden.users`).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-[#FFFBEB] text-[#D97706] text-xs font-bold rounded-xl border border-[#FEF3C7] flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Chờ duyệt: {pendingUsersCount}
                    </span>
                    <span className="px-3 py-1.5 bg-[#DCEFE1] text-[#2C6A3D] text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Đã duyệt: {approvedUsersCount}
                    </span>
                    <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading} className="font-bold flex items-center gap-1">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
                    </Button>
                </div>
            </div>

            {/* Toast feedback */}
            {toastMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* Error message */}
            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E2E4EB] flex items-center justify-between gap-4 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm theo Tên, Username hoặc Email học viên..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#E2E4EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3C4097]"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-xs font-bold text-[#6B6D7A] space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#3C4097]" />
                        <p>Đang nạp dữ liệu tài khoản từ MySQL Database...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#6B6D7A]">
                        Không tìm thấy tài khoản học viên nào phù hợp.
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-[#E2E4EB] text-[#6B6D7A] uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">STT</th>
                                <th className="p-4">Họ Và Tên</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Quyền</th>
                                <th className="p-4">Ngày Đăng Ký</th>
                                <th className="p-4">Trạng Thái Phê Duyệt</th>
                                <th className="p-4 text-right">Thao Tác Quản Trị</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E4EB]">
                            {filteredUsers.map((u, idx) => {
                                const isApproved = Number(u.is_approved) === 1
                                const isRejected = u.status === 'REJECTED' || u.status === 'INACTIVE'

                                return (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-bold">{idx + 1}</td>
                                        <td className="p-4 font-bold text-[#20223A]">
                                            {u.full_name || u.username || 'Học viên'}
                                        </td>
                                        <td className="p-4 text-[#6B6D7A] font-mono">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded font-bold ${u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-indigo-50 text-[#3C4097]'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[#6B6D7A]">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : 'Mới tạo'}
                                        </td>
                                        <td className="p-4">
                                            {isApproved ? (
                                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã phê duyệt
                                                </span>
                                            ) : isRejected ? (
                                                <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-bold inline-flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5 text-red-600" /> Đã từ chối
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold inline-flex items-center gap-1 animate-pulse">
                                                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Chờ phê duyệt
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {!isApproved && (
                                                <>
                                                    <Button
                                                        variant="indigo"
                                                        size="sm"
                                                        disabled={isSubmitting}
                                                        onClick={() => handleApprove(u)}
                                                        className="font-bold shadow-sm"
                                                    >
                                                        Phê duyệt
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isSubmitting}
                                                        className="text-red-600 hover:bg-red-50 border-red-200 font-bold"
                                                        onClick={() => {
                                                            setSelectedUser(u)
                                                            setShowRejectModal(true)
                                                        }}
                                                    >
                                                        Từ chối
                                                    </Button>
                                                </>
                                            )}
                                            {isApproved && (
                                                <span className="text-[11px] text-gray-400 font-semibold italic">Đã kích hoạt</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] max-w-md w-full space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-600">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Từ chối tài khoản học viên</h3>
                        </div>

                        <p className="text-xs text-[#6B6D7A]">
                            Vui lòng nhập lý do từ chối tài khoản <span className="font-bold text-[#20223A]">{selectedUser?.email}</span> để gửi thông báo phản hồi.
                        </p>

                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="Nhập lý do từ chối (Ví dụ: Định danh email không khớp với danh sách lớp)..."
                            className="w-full p-3 border border-[#E2E4EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" disabled={isSubmitting} onClick={() => setShowRejectModal(false)}>Hủy</Button>
                            <Button
                                variant="outline"
                                disabled={isSubmitting}
                                className="bg-red-600 text-white hover:bg-red-700 font-bold"
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
