import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Check, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { HuskyAvatar } from '../../components/auth/HuskyAvatar'

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
)

const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 170 170" fill="currentColor" aria-hidden="true">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.59-6.3-9.57-11.16-20.46-14.58-32.66-3.42-12.21-5.13-23.75-5.13-34.62 0-14.58 3.59-26.68 10.78-36.3 7.19-9.61 16.29-14.5 27.29-14.67 4.9 0 10.15 1.25 15.75 3.75 5.6 2.5 9.49 3.8 11.67 3.9 1.74 0 5.76-1.39 12.07-4.17 6.31-2.77 11.83-4 16.57-3.68 12.3.98 22.09 5.86 29.37 14.65-10.78 6.53-16.06 15.56-15.86 27.1.2 9.04 3.7 16.71 10.5 23.01 6.8 6.3 14.88 9.9 24.23 10.79-2.45 7.07-5.16 14.24-8.13 21.5zm-33.15-115.1c0 6.64-2.4 12.83-7.2 18.57-4.8 5.74-10.87 9.38-18.21 10.92-.78-2.61-1.17-5.11-1.17-7.5 0-6.63 2.58-13.14 7.74-19.53 5.16-6.39 11.45-10.19 18.84-11.41.07 3.03 0 5.95 0 8.95z" />
    </svg>
)

export const LoginPage: React.FC = () => {
    const navigate = useNavigate()
    const { login, isLoading, error, clearError } = useAuthStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isPasswordFocused, setIsPasswordFocused] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)

    const isEmailValid = email.trim().length > 3 && email.includes('@')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        const success = await login(email, password)
        if (success) {
            navigate('/dashboard/learning-path/1')
        }
    }

    const handleGoogleSignIn = () => {
        console.log('Initiate Google OAuth')
    }

    const handleAppleSignIn = () => {
        console.log('Initiate Apple OAuth')
    }

    return (
        <AuthLayout
            heroTitle="Nuôi dưỡng kỹ năng công nghệ mỗi ngày."
            heroSubtitle="Đăng nhập để tiếp tục chuỗi streak học tập, tưới nước cho các cây kỹ năng và gặt hái chứng chỉ thực chiến."
            badgeText="HỌC LẬP TRÌNH THEO MÔ HÌNH VƯỜN SỐ"
            leftVariant="login"
        >
            <div className="relative flex flex-col items-center w-full max-w-[370px] sm:max-w-[390px] mx-auto">
                {/* 1. CHÚ CHÓ HUSKY TƯƠNG TÁC (NHÔ LÊN TRÊN CARD) */}
                <HuskyAvatar
                    textLength={email.length}
                    isPasswordFocused={isPasswordFocused}
                    isPasswordVisible={showPassword}
                    className="mb-[-32px] sm:mb-[-34px] z-20"
                />

                {/* 2. CARD ĐĂNG NHẬP THÍCH ỨNG HOÀN HẢO GIỮA LIGHT VÀ DARK MODE */}
                <div className="w-full bg-white dark:bg-[#151C28] border border-gray-200/90 dark:border-[#273248]/80 rounded-3xl pt-9 pb-5 px-5 sm:px-6 shadow-[0_15px_35px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 text-gray-900 dark:text-white transition-colors duration-200">
                    {/* Header: Tiêu đề & Phụ đề */}
                    <div className="text-center mb-3.5">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-1.5">
                            Chào mừng trở lại <span className="text-lg">🌱</span>
                        </h2>
                        <p className="text-[11px] sm:text-xs text-gray-500 dark:text-[#8B9BB4] mt-1 font-medium">
                            Người bạn Husky đang trông coi khu vườn của bạn.
                        </p>
                    </div>

                    {/* Thông báo lỗi nếu đăng nhập thất bại */}
                    {error && (
                        <div className="mb-3 bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-500/50 rounded-xl p-2.5 flex items-start gap-2 text-xs text-red-700 dark:text-red-200">
                            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <span className="font-bold block">Đăng nhập không thành công</span>
                                <span className="text-red-600 dark:text-red-300/90">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Form đăng nhập */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Trường TÊN ĐĂNG NHẬP / EMAIL */}
                        <div>
                            <label
                                htmlFor="login-email"
                                className="block text-[10.5px] font-bold tracking-wider text-gray-600 dark:text-[#8B9BB4] uppercase mb-1"
                            >
                                TÊN ĐĂNG NHẬP / EMAIL
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    id="login-email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (error) clearError()
                                    }}
                                    placeholder="anhkhoa.plt@gmail.com"
                                    required
                                    autoComplete="username"
                                    className="w-full h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-[#0D121C] border border-gray-200 dark:border-[#273248] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#0D121C] focus:ring-1 focus:ring-blue-500 transition-all duration-200 pr-9 text-xs sm:text-sm"
                                />
                                {isEmailValid && (
                                    <span className="absolute right-3 text-emerald-500 dark:text-emerald-400 flex items-center pointer-events-none">
                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Trường MẬT KHẨU */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label
                                    htmlFor="login-password"
                                    className="text-[10.5px] font-bold tracking-wider text-gray-600 dark:text-[#8B9BB4] uppercase"
                                >
                                    MẬT KHẨU
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-[11px] font-semibold text-[#2D7A4F] dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>
                            <div className="relative flex items-center">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        if (error) clearError()
                                    }}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    placeholder="••••••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-[#0D121C] border border-gray-200 dark:border-[#273248] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#0D121C] focus:ring-1 focus:ring-blue-500 transition-all duration-200 pr-9 tracking-wider text-xs sm:text-sm"
                                />
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Checkbox Ghi nhớ đăng nhập */}
                        <div className="flex items-center pt-0.5">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded bg-gray-50 dark:bg-[#0D121C] border-gray-300 dark:border-[#273248] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                                />
                                <span className="text-[11.5px] font-medium text-gray-600 dark:text-slate-300">Ghi nhớ đăng nhập</span>
                            </label>
                        </div>

                        {/* Nút Submit vào vườn */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-10.5 sm:h-11 rounded-xl bg-gradient-to-r from-[#22C55E] via-[#3B82F6] to-[#6366F1] hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                        >
                            <span>{isLoading ? 'Đang vào vườn...' : 'Vào vườn học ngay'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Dải phân cách Divider */}
                    <div className="relative flex items-center justify-center my-3.5">
                        <div className="border-t border-gray-200 dark:border-[#273248] w-full" />
                        <span className="bg-white dark:bg-[#151C28] px-2.5 text-[9.5px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest absolute">
                            HOẶC TIẾP TỤC VỚI
                        </span>
                    </div>

                    {/* Hàng nút Social Logins (Google & Apple) */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="h-9 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-[#1C2333] dark:hover:bg-[#242D42] border border-gray-200 dark:border-[#273248] text-gray-700 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer active:scale-95"
                        >
                            <GoogleIcon className="w-3.5 h-3.5" />
                            <span>Google</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleAppleSignIn}
                            className="h-9 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-[#1C2333] dark:hover:bg-[#242D42] border border-gray-200 dark:border-[#273248] text-gray-700 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer active:scale-95"
                        >
                            <AppleIcon className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
                            <span>Apple</span>
                        </button>
                    </div>

                    {/* Link đăng ký */}
                    <p className="text-[11.5px] text-center text-gray-500 dark:text-slate-400 mt-3.5">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="font-bold text-[#2D7A4F] dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    )
}
export default LoginPage
