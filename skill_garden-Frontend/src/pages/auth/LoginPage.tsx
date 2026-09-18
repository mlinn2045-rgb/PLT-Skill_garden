import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Check, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
)

export const LoginPage: React.FC = () => {
    const navigate = useNavigate()
    const { login, isLoading, error, clearError } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)
    const [isGoogleFormOpen, setIsGoogleFormOpen] = useState(false)
    const [googleEmail, setGoogleEmail] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        const success = await login(email, password)
        if (success) {
            navigate('/dashboard/learning-path/1')
        }
    }

    return (
        <AuthLayout
            heroTitle="Nuôi dưỡng kỹ năng công nghệ mỗi ngày."
            heroSubtitle="Đăng nhập để tiếp tục chuỗi streak học tập, tưới nước cho các cây kỹ năng và gặt hái chứng chỉ thực chiến."
            badgeText="HỌC LẬP TRÌNH THEO MÔ HÌNH VƯỜN SỐ"
            leftVariant="login"
        >
            <div className="space-y-6">
                {/* Form Title */}
                <div>
                    <h2 className="text-2xl font-extrabold text-[#1A2E22] flex items-center gap-2">
                        Chào mừng trở lại <span className="text-xl">🌱</span>
                    </h2>
                    <p className="text-xs text-[#718096] mt-1">
                        Đăng nhập để tiếp tục hành trình nuôi dưỡng khu vườn kỹ năng.
                    </p>
                </div>

                {/* Google sign-in form */}
                {!isGoogleFormOpen ? (
                    <Button
                        type="button"
                        variant="outline"
                        fullWidth
                        size="lg"
                        className="border-[#E2E8F0] text-[#1A2E22] hover:bg-gray-50 font-semibold"
                        onClick={() => setIsGoogleFormOpen(true)}
                        icon={<GoogleIcon />}
                    >
                        Tiếp tục với tài khoản Google
                    </Button>
                ) : (
                    <form className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#FAFCFF] p-4" onSubmit={(event) => event.preventDefault()}>
                        <div className="flex items-center gap-2 text-sm font-bold text-[#1A2E22]">
                            <GoogleIcon />
                            <span>Đăng nhập bằng Google</span>
                        </div>
                        <p className="text-xs text-[#718096]">Nhập email Google để tiếp tục xác thực tài khoản.</p>
                        <Input
                            label="EMAIL GOOGLE"
                            type="email"
                            value={googleEmail}
                            onChange={(event) => setGoogleEmail(event.target.value)}
                            placeholder="tenban@gmail.com"
                            required
                        />
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsGoogleFormOpen(false)} fullWidth>
                                Quay lại
                            </Button>
                            <Button type="submit" variant="indigo" size="sm" fullWidth disabled={!googleEmail}>
                                Tiếp tục
                            </Button>
                        </div>
                    </form>
                )}

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4">
                    <div className="border-t border-[#E6ECE6] w-full" />
                    <span className="bg-white px-3 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider absolute">
                        HOẶC EMAIL
                    </span>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-red-700">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block">Đăng nhập không thành công</span>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Auth Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="ĐỊA CHỈ EMAIL"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nhap-email@plt.com"
                        required
                        iconRight={email.includes('@') ? <Check className="w-4 h-4 text-emerald-600" /> : undefined}
                    />

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[#4A5568]">
                                MẬT KHẨU
                            </label>
                            <Link to="/forgot-password" className="text-xs font-bold text-[#3F49C8] hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            required
                            iconRight={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[#718096] hover:text-[#1A2E22]"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#3F49C8] focus:ring-[#3F49C8]"
                            />
                            <span className="text-xs font-medium text-[#4A5568]">Ghi nhớ đăng nhập trên thiết bị này</span>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        variant="indigo"
                        size="lg"
                        fullWidth
                        disabled={isLoading}
                        iconRight={<ArrowRight className="w-4 h-4" />}
                        className="mt-2 text-base font-bold shadow-md"
                    >
                        {isLoading ? 'Đang xác thực...' : 'Vào vườn học ngay'}
                    </Button>
                </form>

                {/* Footer info */}
                <p className="text-[11px] text-center text-[#A0AEC0] pt-4 border-t border-[#E6ECE6]">
                    Được bảo mật bởi hạ tầng chứng thực <span className="font-semibold text-[#718096]">PLT Solutions Security</span>
                </p>
            </div>
        </AuthLayout>
    )
}
