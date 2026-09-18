import React, { useState } from 'react'
import { Settings, Shield, Bell, Moon, Lock, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../stores/authStore'

export const SettingsPage: React.FC = () => {
    const { user, isDarkMode, toggleDarkMode } = useAuthStore()
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

    const [emailNotifications, setEmailNotifications] = useState(true)
    const [systemAlerts, setSystemAlerts] = useState(true)
    const [twoFactor, setTwoFactor] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault()
        setSuccessMsg('Đã lưu các thiết lập cấu hình hệ thống thành công!')
        setTimeout(() => setSuccessMsg(''), 4000)
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] dark:bg-gray-900 text-[#20223A] dark:text-gray-100 pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-700 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-[#20223A] dark:text-white">
                        <Settings className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Cài Đặt Hệ Thống & Tài Khoản
                    </h1>
                    <p className="text-xs text-[#6B6D7A] dark:text-gray-400 mt-1">Cấu hình thông báo, bảo mật 2 lớp và tùy chọn giao diện SkillGarden.</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${isAdmin ? 'bg-indigo-50 border-indigo-200 text-[#3C4097] dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300' : 'bg-[#DCEFE1] border-emerald-200 text-[#2C6A3D] dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                    }`}>
                    {isAdmin ? 'Quyền Quản Trị' : 'Quyền Học Viên'}
                </span>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Thông báo */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-base font-bold flex items-center gap-2 border-b border-[#E2E4EB] dark:border-gray-700 pb-3 text-[#20223A] dark:text-white">
                        <Bell className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" /> Thông Báo & Phản Hồi
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-[#FAFAF7] dark:bg-gray-900 rounded-xl border border-[#E2E4EB] dark:border-gray-700">
                            <div>
                                <p className="text-xs font-bold text-[#20223A] dark:text-white">Thông báo qua Email</p>
                                <p className="text-[11px] text-[#6B6D7A] dark:text-gray-400">Nhận email nhắc nhở Streak và cập nhật bài học mới.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={emailNotifications}
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                                className="w-5 h-5 accent-[#3C4097] cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#FAFAF7] dark:bg-gray-900 rounded-xl border border-[#E2E4EB] dark:border-gray-700">
                            <div>
                                <p className="text-xs font-bold text-[#20223A] dark:text-white">Cảnh báo hệ thống & Duyệt tài khoản</p>
                                <p className="text-[11px] text-[#6B6D7A] dark:text-gray-400">Nhận thông báo khi bài Quiz được chấm hoặc khi tài khoản được duyệt.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={systemAlerts}
                                onChange={(e) => setSystemAlerts(e.target.checked)}
                                className="w-5 h-5 accent-[#3C4097] cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Bảo mật & Quyền riêng tư */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-base font-bold flex items-center gap-2 border-b border-[#E2E4EB] dark:border-gray-700 pb-3 text-[#20223A] dark:text-white">
                        <Shield className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" /> Bảo Mật & Xác Thực
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-[#FAFAF7] dark:bg-gray-900 rounded-xl border border-[#E2E4EB] dark:border-gray-700">
                            <div>
                                <p className="text-xs font-bold text-[#20223A] dark:text-white">Bảo mật 2 lớp (2FA)</p>
                                <p className="text-[11px] text-[#6B6D7A] dark:text-gray-400">Yêu cầu mã OTP qua Email/Authenticator mỗi khi đăng nhập.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={twoFactor}
                                onChange={(e) => setTwoFactor(e.target.checked)}
                                className="w-5 h-5 accent-[#3C4097] cursor-pointer"
                            />
                        </div>

                        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs space-y-1">
                            <p className="font-bold flex items-center gap-1.5"><Lock className="w-4 h-4" /> Chính sách bảo vệ dữ liệu PLT</p>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400">Tất cả dữ liệu cá nhân và bài học được mã hóa HTTPS/TLS theo tiêu chuẩn ISO 27001.</p>
                        </div>
                    </div>
                </div>

                {/* Giao diện */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-base font-bold flex items-center gap-2 border-b border-[#E2E4EB] dark:border-gray-700 pb-3 text-[#20223A] dark:text-white">
                        <Moon className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" /> Tùy Chọn Giao Diện
                    </h2>

                    <div className="flex items-center justify-between p-3 bg-[#FAFAF7] dark:bg-gray-900 rounded-xl border border-[#E2E4EB] dark:border-gray-700">
                        <div>
                            <p className="text-xs font-bold text-[#20223A] dark:text-white">Chế độ Tối (Dark Mode)</p>
                            <p className="text-[11px] text-[#6B6D7A] dark:text-gray-400">Chuyển đổi giao diện sang tông màu tối bảo vệ mắt.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={isDarkMode}
                            onChange={toggleDarkMode}
                            className="w-5 h-5 accent-[#3C4097] cursor-pointer"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" variant="indigo" size="lg" className="font-bold flex items-center gap-2 shadow-md cursor-pointer">
                        <Save className="w-4 h-4" /> Lưu cấu hình cài đặt
                    </Button>
                </div>
            </form>
        </div>
    )
}
