// skill_garden-Frontend/src/pages/auth/RegisterPage.tsx

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ArrowRight, Code, Terminal, Server, CheckCircle2, AlertCircle, Check, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate()
    const { register, isLoading } = useAuthStore()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [selectedSeed, setSelectedSeed] = useState('front-end')
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // Password policy criteria
    const policy = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasDigit: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    }

    const passedCount = Object.values(policy).filter(Boolean).length

    const getStrengthColor = () => {
        if (passedCount <= 2) return { text: 'Yếu', color: 'text-red-500', bar: 'bg-red-500', count: 1 }
        if (passedCount <= 4) return { text: 'Trung bình', color: 'text-amber-500', bar: 'bg-amber-500', count: 3 }
        return { text: 'Rất mạnh (Khuyến nghị)', color: 'text-emerald-600', bar: 'bg-emerald-500', count: 4 }
    }

    const strength = getStrengthColor()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)
        setSuccessMessage(null)

        if (passedCount < 5) {
            setErrorMessage('Mật khẩu chưa đáp ứng đầy đủ yêu cầu bảo mật (bao gồm ký tự đặc biệt).')
            return
        }

        const res = await register(fullName, email, password)
        if (res.success) {
            setSuccessMessage(res.message || 'Đăng ký thành công! Vui lòng chờ quản trị viên phê duyệt tài khoản.')
        } else {
            setErrorMessage(res.message || 'Đăng ký không thành công.')
        }
    }

    const seeds = [
        { id: 'front-end', label: 'Front-end', icon: <Code className="w-4 h-4" /> },
        { id: 'python', label: 'Python', icon: <Terminal className="w-4 h-4" /> },
        { id: 'back-end', label: 'Back-end', icon: <Server className="w-4 h-4" /> },
    ]

    return (
        <AuthLayout
            heroTitle="Bắt đầu gieo hạt giống tri thức đầu tiên."
            heroSubtitle="Nhận ngay 100 XP khởi đầu, mở khóa 6 lộ trình lập trình chuẩn doanh nghiệp và theo dõi cây tri thức của bạn vươn mình."
            badgeText="KHỞI TẠO VƯỜN KỸ NĂNG MIỄN PHÍ"
            leftVariant="register"
        >
            <div className="space-y-5">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#1A2E22] flex items-center gap-2">
                        Bắt đầu khu vườn của bạn <span className="text-xl">🌱</span>
                    </h2>
                    <p className="text-xs text-[#718096] mt-1">
                        Đăng ký tài khoản học viên chỉ mất chưa đầy 1 phút.
                    </p>
                </div>

                {/* Google OAuth Button */}
                <Button
                    variant="outline"
                    fullWidth
                    size="lg"
                    className="border-[#E2E8F0] text-[#1A2E22] hover:bg-gray-50 flex items-center justify-center gap-3 font-semibold text-sm"
                    onClick={() => navigate('/dashboard/learning-path/1')}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Đăng ký nhanh bằng Google</span>
                </Button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-[#E6ECE6] w-full" />
                    <span className="bg-white px-3 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider absolute">
                        HOẶC ĐIỀN THÔNG TIN
                    </span>
                </div>

                {/* Messages */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-700">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="block font-bold">Lỗi đăng ký</strong>
                            <span>{errorMessage}</span>
                        </div>
                    </div>
                )}

                {successMessage ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-start gap-3 text-emerald-900">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold">Tạo tài khoản thành công!</h4>
                                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                                    {successMessage}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="indigo"
                            fullWidth
                            size="lg"
                            onClick={() => navigate('/login')}
                            className="mt-2 text-sm font-bold"
                        >
                            Chuyển tới trang Đăng nhập
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <Input
                            label="HỌ VÀ TÊN"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Nguyen Van A"
                            required
                        />

                        <Input
                            label="ĐỊA CHỈ EMAIL HỌC TẬP"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email-cua-ban@gmail.com"
                            required
                        />

                        <div>
                            <Input
                                label="MẬT KHẨU"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                            />

                            {/* Password strength meter matching design */}
                            {password.length > 0 && (
                                <div className="mt-2.5 bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-[#718096]">Độ mạnh mật khẩu:</span>
                                        <span className={`font-bold ${strength.color}`}>{strength.text}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                                        {[1, 2, 3, 4].map((idx) => (
                                            <div
                                                key={idx}
                                                className={`rounded-full h-full transition-all ${idx <= strength.count ? strength.bar : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Password policy checks */}
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] pt-1">
                                        <div className={`flex items-center gap-1.5 ${policy.minLength ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                                            {policy.minLength ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-gray-400" />}
                                            <span>Tối thiểu 8 ký tự</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${policy.hasUppercase ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                                            {policy.hasUppercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-gray-400" />}
                                            <span>Ít nhất 1 chữ hoa (A-Z)</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${policy.hasLowercase ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                                            {policy.hasLowercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-gray-400" />}
                                            <span>Ít nhất 1 chữ thường (a-z)</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${policy.hasDigit ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                                            {policy.hasDigit ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-gray-400" />}
                                            <span>Ít nhất 1 chữ số (0-9)</span>
                                        </div>
                                        <div className={`col-span-2 flex items-center gap-1.5 ${policy.hasSpecial ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                                            {policy.hasSpecial ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-gray-400" />}
                                            <span>Ít nhất 1 ký tự đặc biệt (!@#$%^&*)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Seed Selection */}
                        <div className="space-y-1.5 pt-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A5568] block">
                                CHỌN HẠT GIỐNG ĐẦU TIÊN MUỐN GIEO:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {seeds.map((seed) => {
                                    const isSelected = selectedSeed === seed.id
                                    return (
                                        <button
                                            key={seed.id}
                                            type="button"
                                            onClick={() => setSelectedSeed(seed.id)}
                                            className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isSelected
                                                    ? 'border-[#3F49C8] bg-[#EEF0FD] text-[#3F49C8] shadow-xs ring-1 ring-[#3F49C8]'
                                                    : 'border-[#E2E8F0] bg-[#F7FAF7] text-[#4A5568] hover:bg-white'
                                                }`}
                                        >
                                            {seed.icon}
                                            <span>{seed.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <p className="text-[11px] text-[#718096] leading-relaxed pt-1">
                            Bằng việc đăng ký, bạn đồng ý với{' '}
                            <a href="#" className="font-semibold text-[#3F49C8] underline">Điều khoản dịch vụ</a> và{' '}
                            <a href="#" className="font-semibold text-[#3F49C8] underline">Chính sách bảo mật</a> của SkillGarden.
                        </p>

                        <Button
                            type="submit"
                            variant="indigo"
                            size="lg"
                            fullWidth
                            disabled={isLoading}
                            iconRight={<ArrowRight className="w-4 h-4" />}
                            className="text-sm font-bold shadow-md"
                        >
                            {isLoading ? 'Đang khởi tạo...' : 'Tạo tài khoản & Nhận 100 XP'}
                        </Button>
                    </form>
                )}
            </div>
        </AuthLayout>
    )
}
