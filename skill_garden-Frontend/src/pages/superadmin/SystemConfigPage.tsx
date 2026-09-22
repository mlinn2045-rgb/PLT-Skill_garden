import React, { useState, useEffect } from 'react'
import { Settings, Save, Globe, Lock, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { superAdminService } from '../../services/superAdminService'

export const SystemConfigPage: React.FC = () => {
    const [siteName, setSiteName] = useState('PLT Solutions - SkillGarden')
    const [allowRegistration, setAllowRegistration] = useState(true)
    const [requireApproval, setRequireApproval] = useState(true)
    const [maxLoginAttempts, setMaxLoginAttempts] = useState('5')
    const [sessionTimeout, setSessionTimeout] = useState('120')

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [toastMsg, setToastMsg] = useState('')

    const fetchConfigs = async () => {
        setIsLoading(true)
        try {
            const configs = await superAdminService.getSystemConfigs()
            configs.forEach((item: any) => {
                if (item.config_key === 'site_name') setSiteName(item.config_value)
                if (item.config_key === 'allow_registration') setAllowRegistration(item.config_value === '1' || item.config_value === 'true')
                if (item.config_key === 'require_approval') setRequireApproval(item.config_value === '1' || item.config_value === 'true')
                if (item.config_key === 'max_login_attempts') setMaxLoginAttempts(item.config_value)
                if (item.config_key === 'session_timeout') setSessionTimeout(item.config_value)
            })
        } catch {
            // Keep default fallback values if empty
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchConfigs()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await superAdminService.updateSystemConfigs({
                site_name: siteName,
                allow_registration: allowRegistration ? '1' : '0',
                require_approval: requireApproval ? '1' : '0',
                max_login_attempts: maxLoginAttempts,
                session_timeout: sessionTimeout,
            })
            setToastMsg('Đã cập nhật cấu hình hệ thống thành công vào MySQL Database!')
            setTimeout(() => setToastMsg(''), 4000)
        } catch (err: any) {
            alert(err.message || 'Lưu cấu hình thất bại.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Cấu Hình Hệ Thống (System Global Settings - API Thật)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cấu hình thương hiệu, chính sách đăng ký, bảo mật tài khoản từ CSDL MySQL (FR-SA07).</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchConfigs} disabled={isLoading} className="font-bold flex items-center gap-1 dark:border-gray-700 dark:hover:bg-gray-800">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
                </Button>
            </div>

            {toastMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold shadow-xs">
                    {toastMsg}
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Brand & Reg Config */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-4">
                    <h2 className="text-sm font-extrabold text-gray-900 dark:text-white border-b border-[#E2E4EB] dark:border-gray-800 pb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Cấu Hình Thương Hiệu & Đăng Ký
                    </h2>

                    <Input
                        label="TÊN HỆ THỐNG / THƯƠNG HIỆU"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                    />

                    <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer text-xs font-bold text-gray-800 dark:text-gray-200">
                            <input
                                type="checkbox"
                                checked={allowRegistration}
                                onChange={(e) => setAllowRegistration(e.target.checked)}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>Cho phép người dùng mới Đăng Ký tài khoản</span>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer text-xs font-bold text-gray-800 dark:text-gray-200">
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
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white border-b border-[#E2E4EB] dark:border-gray-800 pb-3 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Chính Sách Bảo Mật Session
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

                    <Button type="submit" variant="indigo" disabled={isSaving} fullWidth className="font-bold flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 border-none mt-4">
                        <Save className="w-4 h-4" /> {isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Hệ Thống'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
