import React, { useState, useEffect } from 'react'
import { Settings, Save, Globe, Lock, RefreshCw, Sparkles, Cpu, Key, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { superAdminService } from '../../services/superAdminService'

export const SystemConfigPage: React.FC = () => {
    const [siteName, setSiteName] = useState('PLT Solutions - SkillGarden')
    const [allowRegistration, setAllowRegistration] = useState(true)
    const [requireApproval, setRequireApproval] = useState(true)
    const [maxLoginAttempts, setMaxLoginAttempts] = useState('5')
    const [sessionTimeout, setSessionTimeout] = useState('120')

    // AI Platform Configurations
    const [aiGeminiKey, setAiGeminiKey] = useState('')
    const [aiGroqKey, setAiGroqKey] = useState('')
    const [aiOpenRouterKey, setAiOpenRouterKey] = useState('')
    const [aiPrimaryModel, setAiPrimaryModel] = useState('google/gemini-2.0-flash')
    const [aiRateLimit, setAiRateLimit] = useState('20')

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

                // AI Keys
                if (item.config_key === 'ai_gemini_api_key') setAiGeminiKey(item.config_value)
                if (item.config_key === 'ai_groq_api_key') setAiGroqKey(item.config_value)
                if (item.config_key === 'ai_openrouter_api_key') setAiOpenRouterKey(item.config_value)
                if (item.config_key === 'ai_primary_model') setAiPrimaryModel(item.config_value)
                if (item.config_key === 'ai_rate_limit') setAiRateLimit(item.config_value)
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

                // AI Platform
                ai_gemini_api_key: aiGeminiKey.trim(),
                ai_groq_api_key: aiGroqKey.trim(),
                ai_openrouter_api_key: aiOpenRouterKey.trim(),
                ai_primary_model: aiPrimaryModel.trim(),
                ai_rate_limit: aiRateLimit.trim()
            })
            setToastMsg('Đã cập nhật cấu hình hệ thống & API Keys AI thành công vào MySQL Database!')
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

                {/* AI Platform & LLM Providers (Multi-Model Fallback Engine) */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-5 md:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E4EB] dark:border-gray-800 pb-3">
                        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>Cấu Hình Nền Tảng AI Hermes & AI Tutor (8-Layer Multi-LLM Engine)</span>
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 self-start">
                            AI Specification 2026
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Gemini Key */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                                    <Key className="w-3.5 h-3.5 text-blue-500" /> Google Gemini API Key
                                </label>
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">AI Tutor Mặc định</span>
                            </div>
                            <input
                                type="password"
                                value={aiGeminiKey}
                                onChange={(e) => setAiGeminiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-mono outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Miễn phí 15 RPM, phản hồi siêu tốc độ cho AI Tutor bài học.</p>
                        </div>

                        {/* Groq Cloud Key */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                                    <Cpu className="w-3.5 h-3.5 text-orange-500" /> Groq Cloud API Key
                                </label>
                                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">DeepSeek R1 LPU</span>
                            </div>
                            <input
                                type="password"
                                value={aiGroqKey}
                                onChange={(e) => setAiGroqKey(e.target.value)}
                                placeholder="gsk_..."
                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-mono outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Tăng tốc suy luận LPU 500 tokens/s cho mô hình tư duy Hermes.</p>
                        </div>

                        {/* OpenRouter Key */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> OpenRouter API Key
                                </label>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Fallback & Qwen</span>
                            </div>
                            <input
                                type="password"
                                value={aiOpenRouterKey}
                                onChange={(e) => setAiOpenRouterKey(e.target.value)}
                                placeholder="sk-or-v1-..."
                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-mono outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Dự phòng chống sập 100% khi nhà cung cấp chính gặp lỗi.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Primary Model */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                                Mô Hình LLM Ưu Tiên (Primary Model)
                            </label>
                            <input
                                type="text"
                                value={aiPrimaryModel}
                                onChange={(e) => setAiPrimaryModel(e.target.value)}
                                placeholder="google/gemini-2.0-flash"
                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Rate Limit */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                                Giới Hạn Gọi AI (Request Quota / Phút / User)
                            </label>
                            <input
                                type="number"
                                value={aiRateLimit}
                                onChange={(e) => setAiRateLimit(e.target.value)}
                                placeholder="20"
                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button type="submit" variant="indigo" disabled={isSaving} className="font-extrabold flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 px-6 py-2.5">
                            <Save className="w-4 h-4" /> {isSaving ? 'Đang lưu cấu hình...' : 'Lưu Toàn Bộ Cấu Hình Hệ Thống & AI'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
