// skill_garden-Frontend/src/pages/auth/ForgotPasswordPage.tsx

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ArrowRight, ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { authService } from '../../services/authService'

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('')
    const [isSent, setIsSent] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg(null)
        setIsLoading(true)
        try {
            await authService.forgotPassword(email)
            setIsSent(true)
        } catch (err: any) {
            setErrorMsg(err.message || 'Gửi liên kết khôi phục thất bại.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthLayout
            heroTitle="Khôi phục chìa khóa vào khu vườn."
            heroSubtitle="Đừng lo lắng! Toàn bộ chuỗi ngày streak, điểm XP và các cây kỹ năng bạn đã dày công chăm sóc đều được lưu trữ an toàn trên máy chủ PLT Solutions."
            badgeText="KHÔI PHỤC TRUY CẬP AN TOÀN"
            leftVariant="forgot"
        >
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#1A2E22] flex items-center gap-2">
                        Quên mật khẩu? <span className="text-xl">🔑</span>
                    </h2>
                    <p className="text-xs text-[#718096] mt-1">
                        Nhập email liên kết với tài khoản SkillGarden của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu ngay lập tức.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-700">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="block font-bold">Lỗi</strong>
                            <span>{errorMsg}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="EMAIL TÀI KHOẢN CẦN KHÔI PHỤC"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="anhkhoa.plt@gmail.com"
                        required
                        iconRight={<Mail className="w-4 h-4 text-[#718096]" />}
                    />

                    {isSent ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-emerald-900">Đã gửi email khôi phục thành công!</h4>
                                <p className="text-xs text-emerald-700 mt-0.5">
                                    Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam/Quảng cáo) của <strong>{email}</strong> để tạo mật khẩu mới.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#E6FFFA] border border-[#68D391]/30 rounded-2xl p-3.5 flex items-start gap-2.5">
                            <span className="text-base text-[#2D7A4F]">✓</span>
                            <div className="text-xs text-[#2D7A4F]">
                                <strong className="block font-bold">Đã sẵn sàng gửi email!</strong>
                                <span>Kiểm tra hộp thư đến (hoặc thư mục Spam) sau khi nhấn nút gửi bên dưới.</span>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="indigo"
                        size="lg"
                        fullWidth
                        disabled={isLoading || isSent}
                        iconRight={<ArrowRight className="w-4 h-4" />}
                        className="text-base font-bold shadow-md"
                    >
                        {isLoading ? 'Đang xử lý...' : isSent ? 'Đã gửi liên kết' : 'Gửi liên kết khôi phục'}
                    </Button>
                </form>

                <div className="pt-2 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A5568] hover:text-[#1A2E22] hover:underline"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Quay lại trang Đăng nhập</span>
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}
