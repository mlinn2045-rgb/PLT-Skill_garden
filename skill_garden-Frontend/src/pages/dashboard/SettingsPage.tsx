import React, { useState } from 'react'
import { Settings, Shield, Bell, Moon, Lock, Globe, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../stores/authStore'

export const SettingsPage: React.FC = () => {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

    const [emailNotifications, setEmailNotifications] = useState(true)
    const [systemAlerts, setSystemAlerts] = useState(true)
    const [twoFactor, setTwoFactor] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault()
        setSuccessMsg('Đã lưu các thiết lập cấu hình hệ thống thành công!')
        setTimeout(() => setSuccessMsg(''), 4000)
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <Settings className="w-6 h-6 text-[#3C4097]" /> Cài Đặt Hệ Thống & Tài Khoản
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Cấu hình thông báo, bảo mật 2 lớp và tùy chọn giao diện SkillGarden.</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${isAdmin ? 'bg-indigo-50 border-indigo-200 text-[#3C4097]' : 'bg-[#DCEFE1] border-emerald-200 text-[#2C6A3D]'
                    }`}>
                    {isAdmin ? 'Quyền Quản Trị' : 'Quyền Học Viên'}
                </span>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Thông báo */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-sm space-y-4">
                    <h2 className="text-base font-bold flex items-center gap-2 border-b border-[#E2E4EB] pb-3 text-[#20223A]">
                        <Bell className="w-5 h-5 text-[#3C4097]" /> Thông Báo & Phản Hồi
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-[#FAFAF7] rounded-xl border border-[#E2E4EB]">
                            <div>
                                <p className="text-xs font-bold">Thông báo qua Email</p>
                                <p className="text-[11px] text-[#6B6D7A]">Nhận email nhắc nhở Streak và cập nhật bài học mới.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={emailNotifications}
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                                className="w-5 h-5 accent-[#3C4097] cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#FAFAF7] rounded-xl border border-[#E2E4EB]">
                            <div>
                                <p className="text-xs font-bold">Cảnh báo hệ thống & Duyệt tài khoản</p>
                                <p className="text-[11px] text-[#6B6D7A]">Nhận thông báo khi bài Quiz được chấm hoặc khi tài khoản được duyệt.</p>
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
                <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-sm space-y-4">
                    <h2 className="text-base font-bold flex items-center gap-2 border-b border-[#E2E4EB] pb-3 text-[#20223A]">
                        <Shield className="w-5 h-5 text-[#3C4097]" /> Bảo Mật & Xác Thực
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-[#FAFAF7] rounded-xl border border-[#E2E4EB]">
                            <div>
                                <p className="text-xs font-bold">Bảo mật 2 lớp (2FA)</p>
                                <p className="text-[11px] text-[#6B6D7A]">Yêu cầu mã OTP qua Email/Authenticator mỗi khi đăng nhập.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={twoFactor}
                                onChange={(e) => setTwoFactor(e.target.checked)}
                                className="w-5 h-5 accent-[#3C4097] cursor-pointer"
                            />
                        </div>

                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs space-y-1">
                            <p className="font-bold flex items-center gap-1.5"><Lock className="w-4 h-4" /> Chính sách bảo vệ dữ liệu PLT</p>
                            <p className="text-[11px] text-amber-700">Tất cả dữ liệu cá nhân và bài học được mã hóa HTTPS/TLS theo tiêu chuẩn ISO 27001.</p>
                        </div>
                    </div>
                </div>

                {/* Giao diện */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-sm space-y-4">
                    <h2 className="text-base font-bold flex items-center gap-2 border-b border-[#E2E4EB] pb-3 text-[#20223A]">
                        <Moon className="w-5 h-5 text-[#3C4097]" /> Tùy Chọn Giao Diện
                    </h2>

                    <div className="flex items-center justify-between p-3 bg-[#FAFAF7] rounded-xl border border-[#E2E4EB]">
                        <div>
                            <p className="text-xs font-bold">Chế độ Tối (Dark Mode)</p>
                            <p className="text-[11px] text-[#6B6D7A]">Chuyển đổi giao diện sang tông màu tối bảo vệ mắt.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={(e) => setDarkMode(e.target.checked)}
                            className="w-5 h-5 accent-[#3C4097] cursor-pointer"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" variant="indigo" size="lg" className="font-bold flex items-center gap-2 shadow-md">
                        <Save className="w-4 h-4" /> Lưu cấu hình cài đặt
                    </Button>
                </div>
            </form>
        </div>
    )
}
