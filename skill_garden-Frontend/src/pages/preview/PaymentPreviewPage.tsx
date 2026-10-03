import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    ShieldCheck,
    CheckCircle2,
    Copy,
    ArrowRight,
    QrCode,
    Sparkles,
    ChevronRight,
    Lock,
    Clock,
    Flame,
    Zap,
    Sprout,
    HelpCircle,
    ArrowLeft,
    Check,
    AlertCircle,
    BadgeCheck,
    FileText,
    ExternalLink,
    CreditCard,
    Smartphone,
    RefreshCw,
    Moon,
    Sun,
    Award
} from 'lucide-react'
import { PltLogo } from '../../components/ui/PltLogo'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../stores/authStore'

export const PaymentPreviewPage: React.FC = () => {
    const navigate = useNavigate()
    const { isDarkMode, toggleDarkMode } = useAuthStore()

    // Payment method state
    const [selectedMethod, setSelectedMethod] = useState<'vietqr' | 'momo' | 'atm'>('vietqr')

    // Voucher state
    const [voucherCode, setVoucherCode] = useState('SKILLGARDEN2026')
    const [appliedDiscount, setAppliedDiscount] = useState(400000)
    const [voucherStatus, setVoucherStatus] = useState<'applied' | 'invalid' | null>('applied')

    // Copy toast notification state
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    // Simulation states
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    // Countdown timer (15 minutes)
    const [timeLeft, setTimeLeft] = useState(14 * 60 + 58)

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const copyToClipboard = (text: string, label: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
        } else {
            const textArea = document.createElement('textarea')
            textArea.value = text
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
        }
        setToastMessage(`Đã sao chép ${label}`)
        setTimeout(() => setToastMessage(null), 2500)
    }

    const handleApplyVoucher = (e: React.FormEvent) => {
        e.preventDefault()
        if (voucherCode.trim().toUpperCase() === 'SKILLGARDEN2026' || voucherCode.trim().toUpperCase() === 'PLT2026') {
            setAppliedDiscount(400000)
            setVoucherStatus('applied')
            setToastMessage('Đã áp dụng mã ưu đãi thành công!')
            setTimeout(() => setToastMessage(null), 2500)
        } else {
            setVoucherStatus('invalid')
            setAppliedDiscount(0)
        }
    }

    const handleSimulatePayment = () => {
        setIsProcessing(true)
        setTimeout(() => {
            setIsProcessing(false)
            setShowSuccessModal(true)
        }, 1800)
    }

    const originalPrice = 899000
    const finalPrice = Math.max(originalPrice - appliedDiscount, 0)

    return (
        <div className="min-h-screen bg-[#FBFDFB] dark:bg-[#070D09] text-[#1A2E22] dark:text-[#E2E8F0] font-sans transition-colors duration-200 antialiased selection:bg-[#68D391]/30 selection:text-[#0B1F14]">
            {/* Top Standalone Preview Announcement Bar */}
            <div className="bg-[#E6FFFA] dark:bg-emerald-950/70 border-b border-[#68D391]/40 dark:border-emerald-800/80 px-4 py-2 text-xs font-semibold text-[#2D7A4F] dark:text-emerald-300 flex items-center justify-between">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2D7A4F] dark:bg-emerald-400 animate-pulse shrink-0" />
                        <span>
                            <strong>Chế độ Xem trước Độc lập (Standalone Preview)</strong> — Tuyến đường: <code className="font-mono bg-white dark:bg-emerald-900/60 px-1.5 py-0.5 rounded border border-[#68D391]/40">/payment</code> (Chưa liên kết vào luồng chính)
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline text-xs text-[#2D7A4F]/80 dark:text-emerald-400/80">Theme:</span>
                        <button
                            onClick={toggleDarkMode}
                            className="p-1 rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                            title="Chuyển đổi Sáng / Tối"
                        >
                            {isDarkMode ? (
                                <>
                                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="hidden md:inline">Giao diện Sáng</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="w-3.5 h-3.5 text-emerald-800" />
                                    <span className="hidden md:inline">Giao diện Tối</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Standalone Brand Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0B1510]/90 backdrop-blur-md border-b border-[#E6ECE6] dark:border-[#1E2E24] shadow-[0_2px_12px_-4px_rgba(26,46,34,0.03)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    {/* Brand Logo & Name */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <PltLogo height={36} className="shrink-0" />
                            <div className="h-6 w-px bg-[#E2E8F0] dark:bg-gray-700 hidden sm:block" />
                            <div>
                                <div className="text-base sm:text-lg font-black text-[#1A2E22] dark:text-white tracking-tight leading-none flex items-center gap-1.5">
                                    <span>SkillGarden</span>
                                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-300 border border-[#68D391]/30">
                                        Academy
                                    </span>
                                </div>
                                <div className="text-[10px] font-semibold text-[#718096] dark:text-emerald-400/80 tracking-wider uppercase leading-none mt-1">
                                    PLT SOLUTIONS • KHU VƯỜN KỸ NĂNG SỐ
                                </div>
                            </div>
                        </div>

                        {/* Breadcrumbs (Desktop) */}
                        <div className="hidden lg:flex items-center gap-2 text-xs text-[#718096] dark:text-gray-400 ml-6 pl-6 border-l border-[#E6ECE6] dark:border-gray-800">
                            <span className="hover:text-[#2D7A4F] cursor-pointer">Khóa học</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#A0AEC0]" />
                            <span className="hover:text-[#2D7A4F] cursor-pointer">Backend Architecture</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#A0AEC0]" />
                            <span className="font-semibold text-[#2D7A4F] dark:text-emerald-300">Cổng Thanh Toán</span>
                        </div>
                    </div>

                    {/* Right utilities: SSL Badge & Safe indicator */}
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6FFFA] dark:bg-emerald-950/80 border border-[#68D391]/40 dark:border-emerald-800 text-[#2D7A4F] dark:text-emerald-300 text-xs font-semibold">
                            <ShieldCheck className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400 shrink-0" />
                            <span>Bảo mật SSL 256-bit</span>
                        </div>

                        <Link
                            to="/dashboard"
                            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#4A5568] dark:text-gray-300 hover:text-[#2D7A4F] dark:hover:text-emerald-300 px-3 py-1.5 rounded-xl hover:bg-[#F3F6F3] dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Về tổng quan</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Checkout Body */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* Page Heading & Motto */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-[#2D7A4F] dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1.5">
                            <Sprout className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400" />
                            <span>Gieo Mầm Tri Thức • Kích Hoạt Kỹ Năng</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E22] dark:text-white tracking-tight">
                            Thanh Toán Khóa Học
                        </h1>
                        <p className="text-sm text-[#4A5568] dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
                            Hoàn tất thanh toán an toàn để bắt đầu nuôi dưỡng cây kỹ năng và nhận quyền truy cập toàn bộ tài liệu giảng dạy.
                        </p>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex items-center gap-3 bg-white dark:bg-[#111A15] px-4 py-2.5 rounded-2xl border border-[#E6ECE6] dark:border-[#1E2E24] shadow-[0_2px_10px_-2px_rgba(45,122,79,0.04)] self-start md:self-auto">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D7A4F] dark:text-emerald-400">
                            <BadgeCheck className="w-4 h-4" />
                            <span>Kích hoạt tự động 3s</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-[#CBD5E0]" />
                        <div className="flex items-center gap-1 text-xs text-[#718096] dark:text-gray-400">
                            <Lock className="w-3.5 h-3.5 text-[#2D7A4F] dark:text-emerald-400" />
                            <span>Chuẩn PCI-DSS</span>
                        </div>
                    </div>
                </div>

                {/* 2-Column Grid Layout: 7 Cols Left / 5 Cols Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* LEFT COLUMN: Payment Methods & Transfer Canvas (7 Cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Card: Payment Methods Selection */}
                        <div className="bg-white dark:bg-[#111A15] rounded-2xl p-5 sm:p-7 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-[0_4px_20px_-2px_rgba(45,122,79,0.04)] space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE6] dark:border-[#1E2E24]">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#E6FFFA] dark:bg-emerald-950/80 border border-[#68D391]/30 flex items-center justify-center text-[#2D7A4F] dark:text-emerald-400">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-[#1A2E22] dark:text-white">
                                            Chọn phương thức thanh toán
                                        </h2>
                                        <p className="text-xs text-[#718096] dark:text-gray-400">
                                            Lựa chọn phương thức phù hợp nhất để kích hoạt tức thì
                                        </p>
                                    </div>
                                </div>
                                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-300 text-xs font-semibold border border-[#68D391]/30">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Xác thực an toàn
                                </span>
                            </div>

                            {/* Options List */}
                            <div className="space-y-3">
                                {/* Option 1: VietQR */}
                                <div
                                    onClick={() => setSelectedMethod('vietqr')}
                                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all duration-200 relative ${selectedMethod === 'vietqr'
                                            ? 'border-[#2D7A4F] dark:border-emerald-500 bg-[#F7FAF7] dark:bg-emerald-950/30 shadow-[0_4px_16px_-2px_rgba(45,122,79,0.08)]'
                                            : 'border-[#E6ECE6] dark:border-[#1E2E24] hover:border-[#68D391] hover:bg-[#FBFDFB] dark:hover:bg-[#16221C]'
                                        }`}
                                >
                                    <div className="flex items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-start sm:items-center gap-3.5">
                                            {/* Custom Radio Circle */}
                                            <div
                                                className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 sm:mt-0 shrink-0 transition-colors ${selectedMethod === 'vietqr'
                                                        ? 'bg-[#2D7A4F] text-white shadow-xs'
                                                        : 'border-2 border-[#CBD5E0] dark:border-gray-600 bg-white dark:bg-gray-800'
                                                    }`}
                                            >
                                                {selectedMethod === 'vietqr' && <Check className="w-3 h-3 stroke-[3]" />}
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-bold text-sm sm:text-base text-[#1A2E22] dark:text-white">
                                                        VietQR Chuyển khoản nhanh 24/7
                                                    </span>
                                                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-300 border border-[#68D391]/40">
                                                        Khuyên dùng
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#718096] dark:text-gray-400 mt-1 leading-relaxed">
                                                    Quét mã QR từ bất kỳ app ngân hàng nào (Vietcombank, MB, Techcombank, VPBank...) hoặc ví điện tử. Tự động mở khóa khóa học trong 3 giây.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Badges logos */}
                                        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                                            <span className="font-mono text-xs font-black px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-[#E6ECE6] dark:border-gray-700 text-[#2F3C96] dark:text-indigo-400">
                                                VietQR
                                            </span>
                                            <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-[#E6ECE6] dark:border-gray-700 text-[#2D7A4F] dark:text-emerald-400">
                                                Napas247
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Option 2: MoMo */}
                                <div
                                    onClick={() => setSelectedMethod('momo')}
                                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all duration-200 relative ${selectedMethod === 'momo'
                                            ? 'border-[#2D7A4F] dark:border-emerald-500 bg-[#F7FAF7] dark:bg-emerald-950/30 shadow-[0_4px_16px_-2px_rgba(45,122,79,0.08)]'
                                            : 'border-[#E6ECE6] dark:border-[#1E2E24] hover:border-[#68D391] hover:bg-[#FBFDFB] dark:hover:bg-[#16221C]'
                                        }`}
                                >
                                    <div className="flex items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-start sm:items-center gap-3.5">
                                            <div
                                                className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 sm:mt-0 shrink-0 transition-colors ${selectedMethod === 'momo'
                                                        ? 'bg-[#2D7A4F] text-white shadow-xs'
                                                        : 'border-2 border-[#CBD5E0] dark:border-gray-600 bg-white dark:bg-gray-800'
                                                    }`}
                                            >
                                                {selectedMethod === 'momo' && <Check className="w-3 h-3 stroke-[3]" />}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm sm:text-base text-[#1A2E22] dark:text-white">
                                                        Ví điện tử MoMo
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#718096] dark:text-gray-400 mt-1 leading-relaxed">
                                                    Thanh toán 1-chạm hoặc quét mã bằng ứng dụng MoMo chính chủ.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="shrink-0 self-start sm:self-center">
                                            <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-[#A50064]/10 text-[#A50064] dark:bg-[#A50064]/20 border border-[#A50064]/30">
                                                MoMo Pay
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Option 3: ATM / Napas Banking */}
                                <div
                                    onClick={() => setSelectedMethod('atm')}
                                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all duration-200 relative ${selectedMethod === 'atm'
                                            ? 'border-[#2D7A4F] dark:border-emerald-500 bg-[#F7FAF7] dark:bg-emerald-950/30 shadow-[0_4px_16px_-2px_rgba(45,122,79,0.08)]'
                                            : 'border-[#E6ECE6] dark:border-[#1E2E24] hover:border-[#68D391] hover:bg-[#FBFDFB] dark:hover:bg-[#16221C]'
                                        }`}
                                >
                                    <div className="flex items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-start sm:items-center gap-3.5">
                                            <div
                                                className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 sm:mt-0 shrink-0 transition-colors ${selectedMethod === 'atm'
                                                        ? 'bg-[#2D7A4F] text-white shadow-xs'
                                                        : 'border-2 border-[#CBD5E0] dark:border-gray-600 bg-white dark:bg-gray-800'
                                                    }`}
                                            >
                                                {selectedMethod === 'atm' && <Check className="w-3 h-3 stroke-[3]" />}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm sm:text-base text-[#1A2E22] dark:text-white">
                                                        Thẻ ATM / Internet Banking / Visa
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#718096] dark:text-gray-400 mt-1 leading-relaxed">
                                                    Cổng thanh toán thẻ nội địa Napas của hơn 40 ngân hàng & thẻ thanh toán quốc tế.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-[#718096] self-start sm:self-center">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card: VietQR Interactive Workspace */}
                        {selectedMethod === 'vietqr' && (
                            <div className="bg-white dark:bg-[#111A15] rounded-2xl p-5 sm:p-7 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-[0_4px_20px_-2px_rgba(45,122,79,0.04)] space-y-6">
                                <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE6] dark:border-[#1E2E24]">
                                    <div className="flex items-center gap-2.5">
                                        <QrCode className="w-5 h-5 text-[#2D7A4F] dark:text-emerald-400" />
                                        <h3 className="font-bold text-base sm:text-lg text-[#1A2E22] dark:text-white">
                                            Hướng dẫn quét mã VietQR tự động
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-[#718096] dark:text-gray-400 bg-[#F7FAF7] dark:bg-gray-800 px-2.5 py-1 rounded-full border border-[#E6ECE6] dark:border-gray-700">
                                        <Clock className="w-3.5 h-3.5 text-[#2D7A4F] dark:text-emerald-400" />
                                        <span>Khởi tạo: 14:32</span>
                                    </div>
                                </div>

                                {/* Step process strip */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-[#F7FAF7] dark:bg-[#16221C] p-3.5 rounded-xl border border-[#E6ECE6] dark:border-[#1E2E24]">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-[#2D7A4F] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                                1
                                            </span>
                                            <span className="font-bold text-xs text-[#1A2E22] dark:text-white truncate">
                                                Mở App Bank
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#718096] dark:text-gray-400 pl-7">
                                            Mọi ngân hàng VN
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-[#2D7A4F] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                                2
                                            </span>
                                            <span className="font-bold text-xs text-[#1A2E22] dark:text-white truncate">
                                                Quét mã QR
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#718096] dark:text-gray-400 pl-7">
                                            Chọn tính năng QR
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-[#2D7A4F] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                                3
                                            </span>
                                            <span className="font-bold text-xs text-[#1A2E22] dark:text-white truncate">
                                                Kiểm tra số tiền
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#718096] dark:text-gray-400 pl-7">
                                            Đúng {finalPrice.toLocaleString('vi-VN')} ₫
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-[#2D7A4F] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                                4
                                            </span>
                                            <span className="font-bold text-xs text-[#1A2E22] dark:text-white truncate">
                                                Hoàn tất
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#718096] dark:text-gray-400 pl-7">
                                            Mở khóa ngay 3s
                                        </p>
                                    </div>
                                </div>

                                {/* QR Canvas & Transfer Details Split */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                                    {/* Left: QR Code Box (5 Cols) */}
                                    <div className="md:col-span-5 bg-[#F7FAF7] dark:bg-[#16221C] rounded-2xl p-5 border border-[#E6ECE6] dark:border-[#1E2E24] flex flex-col items-center justify-center text-center">
                                        {/* Styled QR Display with Botanical Emblem */}
                                        <div className="relative bg-white dark:bg-white p-3.5 rounded-2xl shadow-sm border border-[#E6ECE6] mb-3">
                                            <svg
                                                className="w-48 h-48 sm:w-52 sm:h-52 text-[#2D7A4F]"
                                                viewBox="0 0 220 220"
                                                fill="currentColor"
                                            >
                                                {/* Top Left Finder Pattern */}
                                                <rect x="10" y="10" width="56" height="56" rx="10" fill="#2D7A4F" />
                                                <rect x="20" y="20" width="36" height="36" rx="6" fill="#ffffff" />
                                                <rect x="28" y="28" width="20" height="20" rx="4" fill="#2D7A4F" />

                                                {/* Top Right Finder Pattern */}
                                                <rect x="154" y="10" width="56" height="56" rx="10" fill="#2D7A4F" />
                                                <rect x="164" y="20" width="36" height="36" rx="6" fill="#ffffff" />
                                                <rect x="172" y="28" width="20" height="20" rx="4" fill="#2D7A4F" />

                                                {/* Bottom Left Finder Pattern */}
                                                <rect x="10" y="154" width="56" height="56" rx="10" fill="#2D7A4F" />
                                                <rect x="20" y="164" width="36" height="36" rx="6" fill="#ffffff" />
                                                <rect x="28" y="172" width="20" height="20" rx="4" fill="#2D7A4F" />

                                                {/* Data Matrix Modules */}
                                                <rect x="76" y="16" width="10" height="10" rx="2" fill="#2D7A4F" />
                                                <rect x="94" y="16" width="10" height="10" rx="2" fill="#38A169" />
                                                <rect x="112" y="16" width="10" height="10" rx="2" fill="#2D7A4F" />
                                                <rect x="130" y="16" width="10" height="10" rx="2" fill="#2D7A4F" />
                                                <rect x="76" y="34" width="18" height="10" rx="2" fill="#2D7A4F" />
                                                <rect x="106" y="34" width="10" height="18" rx="2" fill="#68D391" />
                                                <rect x="124" y="34" width="18" height="10" rx="2" fill="#2D7A4F" />

                                                <rect x="16" y="76" width="10" height="18" rx="2" fill="#2D7A4F" />
                                                <rect x="34" y="76" width="18" height="10" rx="2" fill="#38A169" />
                                                <rect x="60" y="76" width="10" height="10" rx="2" fill="#68D391" />
                                                <rect x="16" y="104" width="18" height="10" rx="2" fill="#2D7A4F" />
                                                <rect x="42" y="104" width="10" height="18" rx="2" fill="#2D7A4F" />
                                                <rect x="60" y="122" width="10" height="10" rx="2" fill="#2D7A4F" />

                                                {/* Secondary Matrix Right */}
                                                <rect x="154" y="76" width="18" height="10" rx="2" fill="#2D7A4F" />
                                                <rect x="180" y="76" width="10" height="18" rx="2" fill="#38A169" />
                                                <rect x="198" y="76" width="12" height="10" rx="2" fill="#2D7A4F" />
                                                <rect x="154" y="104" width="10" height="10" rx="2" fill="#68D391" />
                                                <rect x="172" y="98" width="18" height="18" rx="3" fill="#2D7A4F" />
                                                <rect x="198" y="104" width="12" height="18" rx="2" fill="#2D7A4F" />

                                                {/* Bottom Matrix */}
                                                <rect x="76" y="154" width="18" height="10" rx="2" fill="#2D7A4F" />
                                                <rect x="102" y="154" width="10" height="18" rx="2" fill="#38A169" />
                                                <rect x="120" y="154" width="22" height="10" rx="2" fill="#68D391" />
                                                <rect x="76" y="172" width="10" height="20" rx="2" fill="#2D7A4F" />
                                                <rect x="94" y="180" width="18" height="12" rx="2" fill="#2D7A4F" />
                                                <rect x="120" y="172" width="12" height="12" rx="2" fill="#2D7A4F" />
                                                <rect x="154" y="154" width="12" height="20" rx="2" fill="#2D7A4F" />
                                                <rect x="174" y="154" width="18" height="10" rx="2" fill="#38A169" />
                                                <rect x="174" y="172" width="36" height="12" rx="2" fill="#2D7A4F" />
                                                <rect x="154" y="182" width="12" height="18" rx="2" fill="#68D391" />
                                                <rect x="198" y="192" width="12" height="14" rx="2" fill="#2D7A4F" />

                                                {/* Center Botanical Badge */}
                                                <rect x="80" y="80" width="60" height="60" rx="14" fill="#ffffff" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.15))" />
                                                <circle cx="110" cy="110" r="22" fill="#E6FFFA" stroke="#68D391" strokeWidth="1.5" />
                                                {/* Organic Sprout Metaphor */}
                                                <path
                                                    d="M110 119C110 119 110 114 110 111C110 106 106 102 101 102C101 107 104 111 110 111M110 119C110 119 110 113 111 109C113 103 119 101 119 101C119 106 115 112 110 119M110 119V124"
                                                    fill="none"
                                                    stroke="#2D7A4F"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>

                                        {/* Status badge */}
                                        <div className="flex items-center gap-1.5 text-[#2D7A4F] dark:text-emerald-400 text-xs font-bold mb-1">
                                            <span className="w-2 h-2 rounded-full bg-[#2D7A4F] dark:bg-emerald-400 animate-pulse" />
                                            <span>Mã thanh toán trực tiếp (Live QR)</span>
                                        </div>
                                        <span className="text-xs text-[#718096] dark:text-gray-400">
                                            Hết hạn sau <span className="font-mono font-bold text-[#2D7A4F] dark:text-emerald-300">{formatTimer(timeLeft)}</span>
                                        </span>
                                    </div>

                                    {/* Right: Bank Transfer Information Table (7 Cols) */}
                                    <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                                        {/* Field 1: Account Holder */}
                                        <div className="bg-[#F7FAF7] dark:bg-[#16221C] p-3 sm:p-3.5 rounded-xl border border-[#E6ECE6] dark:border-[#1E2E24] flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] dark:text-gray-400 block">
                                                    Chủ tài khoản
                                                </span>
                                                <span className="font-bold text-xs sm:text-sm text-[#1A2E22] dark:text-white truncate block">
                                                    SKILLGARDEN ACADEMY - PLT SOLUTIONS
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard('SKILLGARDEN ACADEMY', 'Tên chủ tài khoản')}
                                                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-[#2D7A4F] dark:text-emerald-300 hover:bg-[#E6FFFA] dark:hover:bg-emerald-950 border border-[#E6ECE6] dark:border-gray-700 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Sao chép</span>
                                            </button>
                                        </div>

                                        {/* Field 2: Account Number */}
                                        <div className="bg-[#F7FAF7] dark:bg-[#16221C] p-3 sm:p-3.5 rounded-xl border border-[#E6ECE6] dark:border-[#1E2E24] flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] dark:text-gray-400 block">
                                                    Số tài khoản (MB Bank - Chi nhánh Hội Sở)
                                                </span>
                                                <span className="font-mono font-bold text-sm sm:text-base text-[#2D7A4F] dark:text-emerald-400 tracking-wider block">
                                                    0388 2948 201
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard('03882948201', 'Số tài khoản')}
                                                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-[#2D7A4F] dark:text-emerald-300 hover:bg-[#E6FFFA] dark:hover:bg-emerald-950 border border-[#E6ECE6] dark:border-gray-700 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Sao chép</span>
                                            </button>
                                        </div>

                                        {/* Field 3: Amount */}
                                        <div className="bg-[#F7FAF7] dark:bg-[#16221C] p-3 sm:p-3.5 rounded-xl border border-[#E6ECE6] dark:border-[#1E2E24] flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] dark:text-gray-400 block">
                                                    Số tiền chuyển khoản
                                                </span>
                                                <span className="font-bold text-base sm:text-lg text-[#2D7A4F] dark:text-emerald-400 block">
                                                    {finalPrice.toLocaleString('vi-VN')} ₫
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(finalPrice.toString(), 'Số tiền')}
                                                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-[#2D7A4F] dark:text-emerald-300 hover:bg-[#E6FFFA] dark:hover:bg-emerald-950 border border-[#E6ECE6] dark:border-gray-700 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Sao chép</span>
                                            </button>
                                        </div>

                                        {/* Field 4: Crucial Memo Code */}
                                        <div className="bg-[#E6FFFA] dark:bg-emerald-950/60 p-3 sm:p-3.5 rounded-xl border-2 border-[#68D391] dark:border-emerald-700 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D7A4F] dark:text-emerald-300 flex items-center gap-1">
                                                    <span>Nội dung chuyển khoản (Bắt buộc)</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E53E3E]" />
                                                </span>
                                                <span className="font-mono font-black text-base sm:text-lg text-[#2D7A4F] dark:text-emerald-200 tracking-widest block">
                                                    SKG-KHOA-2026
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard('SKG-KHOA-2026', 'Nội dung chuyển khoản')}
                                                className="px-3 py-2 rounded-xl bg-[#2D7A4F] text-white hover:bg-[#38A169] text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm transition-all cursor-pointer hover:-translate-y-0.5"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Sao chép mã</span>
                                            </button>
                                        </div>

                                        {/* Organic Sprout Clarification Note */}
                                        <div className="bg-[#F7FAF7] dark:bg-[#16221C] p-3 rounded-xl border border-[#E6ECE6] dark:border-[#1E2E24] flex items-start gap-2.5 text-xs text-[#4A5568] dark:text-gray-300">
                                            <Sprout className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400 shrink-0 mt-0.5" />
                                            <p className="leading-relaxed">
                                                <strong className="text-[#1A2E22] dark:text-white font-semibold">Gieo mầm tức thì:</strong> Khóa học sẽ tự động được gieo mầm vào tài khoản học viên ngay khi hệ thống ngân hàng ghi nhận giao dịch. Vui lòng giữ nguyên nội dung chuyển khoản để đối soát chính xác.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Alternate Method: MoMo Placeholder Canvas */}
                        {selectedMethod === 'momo' && (
                            <div className="bg-white dark:bg-[#111A15] rounded-2xl p-6 sm:p-8 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-[0_4px_20px_-2px_rgba(45,122,79,0.04)] text-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-[#A50064]/10 text-[#A50064] flex items-center justify-center mx-auto">
                                    <Smartphone className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-lg text-[#1A2E22] dark:text-white">
                                    Thanh toán qua Ví điện tử MoMo
                                </h3>
                                <p className="text-xs sm:text-sm text-[#4A5568] dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                                    Nhấn nút <strong className="text-[#1A2E22] dark:text-white font-semibold">"Xác nhận & Hoàn tất thanh toán"</strong> bên phải để điều hướng trực tiếp sang ứng dụng MoMo và xác nhận giao dịch số tiền <strong className="text-[#2D7A4F] dark:text-emerald-400 font-bold">{finalPrice.toLocaleString('vi-VN')} ₫</strong>.
                                </p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A50064]/10 text-[#A50064] text-xs font-semibold">
                                    <span>Hỗ trợ MoMo QR & MoMo App Link</span>
                                </div>
                            </div>
                        )}

                        {/* Alternate Method: ATM Card Placeholder Canvas */}
                        {selectedMethod === 'atm' && (
                            <div className="bg-white dark:bg-[#111A15] rounded-2xl p-6 sm:p-8 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-[0_4px_20px_-2px_rgba(45,122,79,0.04)] text-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-[#E6FFFA] dark:bg-emerald-950/80 text-[#2D7A4F] dark:text-emerald-400 flex items-center justify-center mx-auto">
                                    <CreditCard className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-lg text-[#1A2E22] dark:text-white">
                                    Cổng Ngân Hàng Nội Địa & Quốc Tế Napas
                                </h3>
                                <p className="text-xs sm:text-sm text-[#4A5568] dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                                    Hệ thống sẽ chuyển hướng bạn đến cổng thanh toán bảo mật tiêu chuẩn Napas. Vui lòng chuẩn bị thẻ ATM đã kích hoạt Internet Banking hoặc thẻ Visa/Mastercard.
                                </p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-300 text-xs font-semibold">
                                    <span>Bảo mật 3D-Secure 2.0</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Order Summary & Course Card (5 Cols) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                        {/* Order Summary Card */}
                        <div className="bg-white dark:bg-[#111A15] rounded-2xl p-5 sm:p-6 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-[0_4px_20px_-2px_rgba(45,122,79,0.04)] space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE6] dark:border-[#1E2E24]">
                                <h2 className="text-base sm:text-lg font-bold text-[#1A2E22] dark:text-white">
                                    Đơn hàng của bạn
                                </h2>
                                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-300 border border-[#68D391]/30">
                                    1 khóa học
                                </span>
                            </div>

                            {/* Course Item Box */}
                            <div className="p-3.5 rounded-2xl bg-[#F7FAF7] dark:bg-[#16221C] border border-[#E6ECE6] dark:border-[#1E2E24] flex gap-3.5 items-center">
                                {/* Course Thumbnail */}
                                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden shrink-0 relative bg-[#1A2E22] border border-[#E6ECE6] dark:border-gray-700">
                                    <img
                                        src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"
                                        alt="ASP.NET Core Web API"
                                        className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-1 left-1 bg-[#2D7A4F] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                                        PRO
                                    </div>
                                </div>

                                {/* Course Meta */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2D7A4F] dark:text-emerald-400 uppercase tracking-wider">
                                        <span>Backend Architecture</span>
                                        <span>•</span>
                                        <span>Cổ Thụ Bách Tùng 🌲</span>
                                    </div>
                                    <h3 className="font-extrabold text-sm sm:text-base text-[#1A2E22] dark:text-white truncate mt-0.5">
                                        ASP.NET Core Web API & Microservices
                                    </h3>
                                    <p className="text-xs text-[#718096] dark:text-gray-400 truncate mt-0.5">
                                        Giảng viên: ThS. Hoàng Minh Đức
                                    </p>

                                    {/* Stats Badges */}
                                    <div className="flex items-center gap-2 text-[11px] text-[#718096] dark:text-gray-400 mt-2">
                                        <span className="font-semibold text-[#1A2E22] dark:text-gray-300">48 bài học</span>
                                        <span>•</span>
                                        <span>32 giờ video</span>
                                        <span>•</span>
                                        <span className="text-[#ED8936] dark:text-amber-400 font-bold">+500 XP</span>
                                    </div>
                                </div>
                            </div>

                            {/* Skill Voucher (Coupon) Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#4A5568] dark:text-gray-300 uppercase tracking-wider block">
                                    Mã ưu đãi học tập (Skill Voucher)
                                </label>
                                <form onSubmit={handleApplyVoucher} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value)}
                                        placeholder="Nhập mã ưu đãi..."
                                        className="flex-1 h-11 px-3.5 rounded-xl bg-[#F7FAF7] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 text-xs font-mono font-bold text-[#1A2E22] dark:text-white uppercase placeholder:text-[#A0AEC0] focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#2D7A4F] focus:ring-2 focus:ring-[#68D391]/25 transition-all"
                                    />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        size="md"
                                        className="text-xs px-3.5 font-bold"
                                    >
                                        Áp dụng
                                    </Button>
                                </form>

                                {voucherStatus === 'applied' && (
                                    <div className="flex items-center gap-1.5 text-xs text-[#2D7A4F] dark:text-emerald-400 font-semibold pt-1">
                                        <CheckCircle2 className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400 shrink-0" />
                                        <span>Đã áp dụng học bổng phát triển kỹ năng 400.000 ₫</span>
                                    </div>
                                )}
                                {voucherStatus === 'invalid' && (
                                    <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold pt-1">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>Mã ưu đãi không hợp lệ hoặc đã hết hạn</span>
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown Calculation */}
                            <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
                                <div className="flex items-center justify-between text-[#718096] dark:text-gray-400">
                                    <span>Giá niêm yết khóa học</span>
                                    <span className="font-semibold line-through text-[#A0AEC0]">
                                        {originalPrice.toLocaleString('vi-VN')} ₫
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-[#2D7A4F] dark:text-emerald-400 font-semibold">
                                    <span className="flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Học bổng SkillGarden</span>
                                    </span>
                                    <span className="font-bold">-{appliedDiscount.toLocaleString('vi-VN')} ₫</span>
                                </div>

                                <div className="flex items-center justify-between text-[#718096] dark:text-gray-400">
                                    <span>Thuế VAT (Chính sách Giáo dục)</span>
                                    <span className="font-semibold">0 ₫</span>
                                </div>

                                <div className="h-px bg-[#E6ECE6] dark:bg-[#1E2E24] my-3" />

                                <div className="flex items-end justify-between pt-1">
                                    <div>
                                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#718096] dark:text-gray-400 block">
                                            Tổng thanh toán
                                        </span>
                                        <span className="text-[11px] text-[#2D7A4F] dark:text-emerald-400 font-semibold">
                                            Bao gồm mã nguồn & chứng chỉ
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl sm:text-3xl font-black text-[#2D7A4F] dark:text-emerald-400 tracking-tight block">
                                            {finalPrice.toLocaleString('vi-VN')} ₫
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Main CTA Button */}
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={handleSimulatePayment}
                                disabled={isProcessing}
                                iconRight={isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                className="h-13 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                {isProcessing ? 'Đang xác thực giao dịch...' : 'Xác nhận & Hoàn tất thanh toán'}
                            </Button>

                            {/* Student Guarantees Strip */}
                            <div className="pt-4 border-t border-[#E6ECE6] dark:border-[#1E2E24] space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-xs text-[#1A2E22] dark:text-white">
                                            Cam kết chất lượng 100%
                                        </div>
                                        <div className="text-[11px] text-[#718096] dark:text-gray-400 leading-relaxed">
                                            Hoàn tiền 100% trong vòng 7 ngày nếu nội dung không đúng như mô tả.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-[#EEF0FD] dark:bg-indigo-950 text-[#3F49C8] dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                                        <Award className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-xs text-[#1A2E22] dark:text-white">
                                            Chứng chỉ & Quyền truy cập trọn đời
                                        </div>
                                        <div className="text-[11px] text-[#718096] dark:text-gray-400 leading-relaxed">
                                            Cấp chứng chỉ xác thực URL gắn hồ sơ LinkedIn và hỗ trợ kỹ thuật trực tiếp.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Support Badge */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#111A15] border border-[#E6ECE6] dark:border-[#1E2E24] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#F7FAF7] dark:bg-gray-800 flex items-center justify-center text-[#2D7A4F] dark:text-emerald-400">
                                    <HelpCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="font-bold text-xs text-[#1A2E22] dark:text-white block">
                                        Cần hỗ trợ thanh toán?
                                    </span>
                                    <span className="text-[11px] text-[#718096] dark:text-gray-400">
                                        Hotline: 1900 6868 (8:00 - 22:00)
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-[#2D7A4F] dark:text-emerald-400 hover:underline cursor-pointer">
                                Chat Zalo
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Standalone Footer */}
            <footer className="mt-16 border-t border-[#E6ECE6] dark:border-[#1E2E24] bg-white dark:bg-[#0B1510] py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#718096] dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400" />
                        <span>© 2026 SkillGarden Academy by PLT Solutions. Nền tảng nuôi dưỡng kỹ năng số.</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="hover:text-[#2D7A4F] cursor-pointer">Điều khoản dịch vụ</span>
                        <span className="hover:text-[#2D7A4F] cursor-pointer">Chính sách hoàn tiền</span>
                        <span className="hover:text-[#2D7A4F] cursor-pointer">Bảo mật thông tin</span>
                    </div>
                </div>
            </footer>

            {/* Interactive Feedback Toast */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#1A2E22] dark:bg-emerald-950 text-white px-4 py-3 rounded-xl shadow-xl border border-[#68D391]/30 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <CheckCircle2 className="w-5 h-5 text-[#68D391] shrink-0" />
                    <span className="text-xs font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* Simulation Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-[#111A15] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="w-18 h-18 rounded-3xl bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner border border-[#68D391]/40">
                            <Sprout className="w-10 h-10 animate-bounce" />
                        </div>

                        <div>
                            <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-300 border border-[#68D391]/40 uppercase">
                                Giao dịch thành công
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-[#1A2E22] dark:text-white tracking-tight mt-3">
                                Mầm Cây Đã Được Gieo! 🌲
                            </h3>
                            <p className="text-xs sm:text-sm text-[#4A5568] dark:text-gray-300 mt-2 leading-relaxed">
                                Khóa học <strong className="text-[#1A2E22] dark:text-white">ASP.NET Core Web API & Microservices</strong> đã được kích hoạt thành công trong khu vườn kỹ năng của bạn.
                            </p>
                        </div>

                        <div className="bg-[#F7FAF7] dark:bg-[#16221C] p-4 rounded-2xl border border-[#E6ECE6] dark:border-[#1E2E24] flex items-center justify-around text-left">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-[#718096] dark:text-gray-400 block">
                                    Mã đơn hàng
                                </span>
                                <span className="font-mono text-xs font-black text-[#2D7A4F] dark:text-emerald-400">
                                    SKG-KHOA-2026
                                </span>
                            </div>
                            <div className="h-8 w-px bg-[#E2E8F0] dark:bg-gray-700" />
                            <div>
                                <span className="text-[10px] uppercase font-bold text-[#718096] dark:text-gray-400 block">
                                    Phần thưởng mở mầm
                                </span>
                                <span className="font-bold text-xs text-[#ED8936] flex items-center gap-1">
                                    <Zap className="w-3.5 h-3.5 fill-current" />
                                    <span>+200 XP</span>
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Button
                                variant="primary"
                                size="md"
                                fullWidth
                                onClick={() => {
                                    setShowSuccessModal(false)
                                    navigate('/dashboard')
                                }}
                                className="font-bold h-11"
                            >
                                Vào Khu Vườn Học Tập Ngay
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                fullWidth
                                onClick={() => setShowSuccessModal(false)}
                                className="text-xs"
                            >
                                Đóng hộp thoại
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PaymentPreviewPage
