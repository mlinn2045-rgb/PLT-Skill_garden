import React, { useState } from 'react'
import { Settings, Save, ShieldCheck, Globe, Lock, Bell, CheckSquare } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export const SystemConfigPage: React.FC = () => {
    const [siteName, setSiteName] = useState('PLT Solutions - SkillGarden')
    const [allowRegistration, setAllowRegistration] = useState(true)
    const [requireApproval, setRequireApproval] = useState(true)
    const [maxLoginAttempts, setMaxLoginAttempts] = useState('5')
    const [sessionTimeout, setSessionTimeout] = useState('120')

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        alert('Đã cập nhật cấu hình hệ thống thành công!')
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs">
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                    <Settings className="w-6 h-6 text-purple-600" /> Cấu Hình Hệ Thống (System Global Settings)
                </h1>
                <p className="text-xs text-[#6B6D7A] mt-1">Cấu hình tên thương hiệu, chính sách đăng ký, bảo mật tài khoản và thời gian phiên đăng nhập (FR-SA07).</p>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Brand & Reg Config */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-xs space-y-4">
                    <h2 className="text-sm font-extrabold text-[#20223A] border-b border-[#E2E4EB] pb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-600" /> Cấu Hình Thương Hiệu & Đăng Ký
                    </h2>

                    <Input
                        label="TÊN HỆ THỐNG / THƯƠNG HIỆU"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                    />

                    <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer text-xs font-bold">
                            <input
                                type="checkbox"
                                checked={allowRegistration}
                                onChange={(e) => setAllowRegistration(e.target.checked)}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>Cho phép người dùng mới Đăng Ký tài khoản</span>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer text-xs font-bold">
                            <input
                                type="checkbox"
                                checked={requireApproval}
                                onChange={(e) => setRequireApproval(e.target.checked)}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>Yêu cầu Admin Phê Duyệt trước khi tài khoản được Active</span>
                        </label>
                    </div>
                </div>

                {/* Security Config */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h2 className="text-sm font-extrabold text-[#20223A] border-b border-[#E2E4EB] pb-3 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-purple-600" /> Chính Sách Bảo Mật Session
                        </h2>

                        <Input
                            label="SỐ LẦN ĐĂNG NHẬP SAI TỐI ĐA TRƯỚC KHI TỰ ĐỘNG KHÓA"
                            type="number"
                            value={maxLoginAttempts}
                            onChange={(e) => setMaxLoginAttempts(e.target.value)}
                        />

                        <Input
                            label="THỜI GIAN HẾT HẠN PHIÊN ĐĂNG NHẬP (PHÚT)"
                            type="number"
                            value={sessionTimeout}
                            onChange={(e) => setSessionTimeout(e.target.value)}
                        />
                    </div>

                    <Button type="submit" variant="indigo" fullWidth className="font-bold flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 border-none mt-4">
                        <Save className="w-4 h-4" /> Lưu Cấu Hình Hệ Thống
                    </Button>
                </div>
            </form>
        </div>
    )
}
