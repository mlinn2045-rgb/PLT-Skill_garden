import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Button } from '../../components/ui/Button'
import { Clock, ShieldCheck, Mail, LogOut, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export const PendingApprovalPage: React.FC = () => {
    const navigate = useNavigate()
    const { logout, user } = useAuthStore()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <AuthLayout
            heroTitle="Khu vườn của bạn đang sẵn sàng gieo mầm!"
            heroSubtitle="Tài khoản mới đăng ký cần được Quản trị viên phê duyệt để đảm bảo chất lượng sinh thái học tập PLT Solutions."
            badgeText="XÁC THỰC TÀI KHOẢN HỌC VIÊN"
            leftVariant="register"
        >
            <div className="space-y-6 text-center py-4">
                {/* Icon Status */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-4 border-amber-100 dark:border-amber-900 shadow-lg animate-pulse">
                    <Clock className="w-10 h-10" />
                </div>

                {/* Title */}
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        Tài khoản đang chờ duyệt ⏳
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                        Chào <span className="font-bold text-gray-900 dark:text-white">{user?.full_name || 'Học viên'}</span>, yêu cầu khởi tạo tài khoản của bạn đã được gửi đến Ban Quản trị. Thông thường thời gian phê duyệt từ <span className="font-semibold text-gray-800 dark:text-gray-200">5 - 15 phút</span>.
                    </p>
                </div>

                {/* Card Info */}
                <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-left space-y-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-700 dark:text-emerald-300">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">Tiêu chuẩn duyệt tự động</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">Kiểm tra định danh Email & quy chuẩn Password Policy</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded-xl text-blue-700 dark:text-blue-300">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">Email hỗ trợ</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">support@pltsolutions.com (Phản hồi 24/7)</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-3">
                    <Button
                        variant="indigo"
                        fullWidth
                        size="lg"
                        className="font-bold shadow-md"
                        onClick={() => window.location.reload()}
                    >
                        Tải lại trang để kiểm tra
                    </Button>

                    <Button
                        variant="ghost"
                        fullWidth
                        size="md"
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất & Quay lại Đăng nhập</span>
                    </Button>
                </div>
            </div>
        </AuthLayout>
    )
}
