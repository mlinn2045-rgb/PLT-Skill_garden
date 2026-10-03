// skill_garden-Frontend/src/pages/payment/PaymentCheckoutPage.tsx

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ShieldCheck,
    CheckCircle2,
    Lock,
    Sparkles,
    Star,
    BookOpen,
    Award,
    Sprout,
    ArrowRight,
    ArrowLeft,
    Check,
    AlertCircle,
    QrCode,
    Smartphone,
    CreditCard,
    Sun,
    Moon,
    HelpCircle,
    Info
} from 'lucide-react';
import { DEFAULT_COURSE, paymentService } from '../../services/paymentService';
import { CoursePaymentInfo, PaymentMethodType } from '../../types/payment';
import { useAuthStore } from '../../stores/authStore';

export const PaymentCheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isDarkMode, toggleDarkMode, user } = useAuthStore();

    // Course information (Default or customized via query params)
    const course: CoursePaymentInfo = {
        ...DEFAULT_COURSE,
        id: searchParams.get('courseId') || DEFAULT_COURSE.id,
        title: searchParams.get('title') || DEFAULT_COURSE.title
    };

    // State for Payment Method: VietQR default as requested
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('vietqr');

    // Micro-test Pricing State (2.000đ vs 600.000đ)
    const [isMicroTestPrice, setIsMicroTestPrice] = useState(paymentService.isMicroTestPriceMode());

    const togglePriceMode = () => {
        const next = !isMicroTestPrice;
        setIsMicroTestPrice(next);
        paymentService.setMicroTestPriceMode(next);
    };

    // Voucher State
    const [voucherInput, setVoucherInput] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<{
        code: string;
        discountAmount: number;
    } | null>(null);
    const [voucherError, setVoucherError] = useState<string | null>(null);
    const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

    // Calculate Pricing
    const originalPrice = isMicroTestPrice ? 2000 : course.originalPrice;
    const discountAmount = appliedVoucher ? (isMicroTestPrice ? 0 : appliedVoucher.discountAmount) : 0;
    const finalPrice = Math.max(originalPrice - discountAmount, isMicroTestPrice ? 2000 : 0);

    // Apply Voucher Handler
    const handleApplyVoucher = (e: React.FormEvent) => {
        e.preventDefault();
        setVoucherError(null);
        setVoucherSuccess(null);
        setIsApplyingVoucher(true);

        setTimeout(() => {
            const result = paymentService.validateVoucher(voucherInput, originalPrice);
            setIsApplyingVoucher(false);

            if (result.isValid) {
                setAppliedVoucher({
                    code: result.code,
                    discountAmount: result.discountAmount
                });
                setVoucherSuccess(result.message);
                setVoucherError(null);
            } else {
                setAppliedVoucher(null);
                setVoucherError(result.message);
                setVoucherSuccess(null);
            }
        }, 300);
    };

    // Remove Voucher Handler
    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherInput('');
        setVoucherSuccess(null);
        setVoucherError(null);
    };

    // Navigate to Page 2 (QR Page)
    const handleProceedToPayment = () => {
        // Generate universal order code (timestamp-based number as required by spec)
        const orderCode = Date.now();

        // Create transaction in service / localStorage
        paymentService.createTransaction(
            {
                orderCode,
                amount: finalPrice,
                originalAmount: originalPrice,
                discountAmount,
                voucherCode: appliedVoucher?.code,
                description: 'A100291',
                items: [
                    {
                        name: course.title,
                        quantity: 1,
                        price: finalPrice
                    }
                ],
                buyerName: user?.full_name || 'Học Viên Skill Garden',
                buyerEmail: user?.email || 'student@skillgarden.vn',
                returnUrl: '/checkout/qr',
                cancelUrl: '/checkout',
                method: selectedMethod
            },
            course
        );

        // Navigate to Page 2
        navigate('/checkout/qr');
    };

    return (
        <div className="min-h-screen bg-[#FBFDFB] dark:bg-[#070D09] text-[#1A2E22] dark:text-[#E2E8F0] font-sans transition-colors duration-200 antialiased selection:bg-[#68D391]/30">
            {/* Top Merchant & Testing Status Bar */}
            <div className="bg-[#E6FFFA] dark:bg-emerald-950/80 border-b border-[#68D391]/40 px-4 py-2 text-xs font-semibold text-[#2D7A4F] dark:text-emerald-300">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2D7A4F] dark:bg-emerald-400 animate-pulse" />
                        <span>
                            <strong>Tài khoản thụ hưởng chính thức:</strong> <code className="font-mono bg-white dark:bg-emerald-900/60 px-1.5 py-0.5 rounded border border-[#68D391]/40 font-bold">Vietcombank - 1031174223 (NGUYEN HOANG ANH KHOA)</code>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#718096] dark:text-gray-400">Chế độ giá:</span>
                        <button
                            type="button"
                            onClick={togglePriceMode}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-800 border border-[#68D391]/40 font-bold text-xs cursor-pointer shadow-2xs flex items-center gap-1.5"
                        >
                            <span>{isMicroTestPrice ? '🧪 Test vi mô: 2.000đ' : '🏷️ Giá chính thức: 600.000đ'}</span>
                            <span className="text-[10px] text-[#2D7A4F] dark:text-emerald-300 underline font-bold">(Đổi)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Header: Thương hiệu "Skill Garden" cùng nhãn "🔒 Thanh toán an toàn" */}
            <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1510]/95 backdrop-blur-md border-b border-[#E6ECE6] dark:border-[#1E2E24] shadow-[0_2px_12px_-4px_rgba(26,46,34,0.03)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2D7A4F] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#2D7A4F]/20">
                            🌱
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-[#1A2E22] dark:text-white tracking-tight leading-none">
                                    Skill Garden
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6FFFA] dark:bg-emerald-950/80 text-[#2D7A4F] dark:text-emerald-300 border border-[#68D391]/30 uppercase tracking-wider">
                                    Academy
                                </span>
                            </div>
                            <p className="text-[10px] font-semibold text-[#718096] dark:text-emerald-400/70 tracking-wider uppercase leading-none mt-1">
                                KHU VƯỜN KỸ NĂNG SỐ • PLT SOLUTIONS
                            </p>
                        </div>
                    </div>

                    {/* Right Utilities: Security Badge & Theme Switcher */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* 🔒 Thanh toán an toàn */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6FFFA] dark:bg-emerald-950/80 border border-[#68D391]/40 text-[#2D7A4F] dark:text-emerald-300 text-xs font-bold shadow-xs">
                            <ShieldCheck className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400" />
                            <span>🔒 Thanh toán an toàn</span>
                        </div>

                        {/* Theme Switcher */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            title="Chuyển đổi giao diện Sáng / Tối"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Layout: 2 Columns */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* Notice Badge (Phong cách ảnh mẫu 2) */}
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                        <Lock className="w-3.5 h-3.5" />
                        THANH TOÁN AN TOÀN QUA HỆ THỐNG SKILL GARDEN
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* ================= CỘT TRÁI: THÔNG TIN THANH TOÁN (7/12) ================= */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Heading */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-[#1A2E22] dark:text-white tracking-tight">
                                THANH TOÁN
                            </h1>
                            <p className="text-sm text-[#4A5568] dark:text-gray-400 mt-1">
                                Bạn sẽ được chuyển sang trang thanh toán an toàn để hoàn tất giao dịch.
                            </p>
                        </div>

                        {/* Khối 1: Thông tin khóa học chi tiết */}
                        <div className="bg-white dark:bg-[#111A15] rounded-2xl p-5 sm:p-6 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-[#718096] dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400" />
                                Thông tin khóa học
                            </h2>

                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                {/* Thumbnail */}
                                <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden shrink-0 border border-[#E6ECE6] dark:border-[#1E2E24] relative group">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                                        PRO
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-1.5">
                                    <h3 className="text-lg font-bold text-[#1A2E22] dark:text-white leading-snug">
                                        {course.title}
                                    </h3>
                                    <p className="text-xs text-[#4A5568] dark:text-gray-300 font-medium">
                                        Giảng viên: <span className="font-bold text-[#1A2E22] dark:text-white">{course.instructor}</span>
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-[#718096] dark:text-gray-400 pt-0.5">
                                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                            {course.rating}
                                        </span>
                                        <span>•</span>
                                        <span className="font-semibold">{course.lessonsCount} bài học</span>
                                    </div>
                                </div>
                            </div>

                            {/* Lợi ích khóa học */}
                            <div className="pt-3 border-t border-[#E6ECE6] dark:border-[#1E2E24] space-y-2">
                                {course.benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-[#2D7A4F] dark:text-emerald-300 font-semibold">
                                        <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D7A4F] dark:text-emerald-400" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Khối 2: Phương thức thanh toán (3 Lựa chọn Radio) */}
                        <div className="bg-white dark:bg-[#111A15] rounded-2xl p-5 sm:p-6 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-[#718096] dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400" />
                                    Phương thức thanh toán
                                </h2>
                                <span className="text-xs text-[#2D7A4F] dark:text-emerald-400 font-bold flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Bảo mật cao
                                </span>
                            </div>

                            <div className="space-y-3">
                                {/* Option 1: VietQR (Mặc định được chọn) */}
                                <label
                                    onClick={() => setSelectedMethod('vietqr')}
                                    className={`relative flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                        selectedMethod === 'vietqr'
                                            ? 'border-[#2D7A4F] bg-[#E6FFFA]/50 dark:bg-emerald-950/40 dark:border-emerald-500'
                                            : 'border-[#E6ECE6] dark:border-[#1E2E24] hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-transparent'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        checked={selectedMethod === 'vietqr'}
                                        onChange={() => setSelectedMethod('vietqr')}
                                        className="mt-1 w-4 h-4 text-[#2D7A4F] focus:ring-[#2D7A4F] border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-[#1A2E22] dark:text-white">
                                                VietQR
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#2D7A4F] text-white">
                                                ✓ Khuyên dùng
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#4A5568] dark:text-gray-400 mt-0.5">
                                            Quét mã QR để thanh toán bằng bất kỳ app ngân hàng nào (Tự động kích hoạt ngay sau 3s)
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-[#2D7A4F] dark:text-emerald-300 shrink-0">
                                        <QrCode className="w-4 h-4" />
                                    </div>
                                </label>

                                {/* Option 2: MoMo */}
                                <label
                                    onClick={() => setSelectedMethod('momo')}
                                    className={`relative flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                        selectedMethod === 'momo'
                                            ? 'border-[#2D7A4F] bg-[#E6FFFA]/50 dark:bg-emerald-950/40 dark:border-emerald-500'
                                            : 'border-[#E6ECE6] dark:border-[#1E2E24] hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-transparent'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        checked={selectedMethod === 'momo'}
                                        onChange={() => setSelectedMethod('momo')}
                                        className="mt-1 w-4 h-4 text-[#2D7A4F] focus:ring-[#2D7A4F] border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <span className="font-bold text-sm text-[#1A2E22] dark:text-white">
                                            MoMo
                                        </span>
                                        <p className="text-xs text-[#4A5568] dark:text-gray-400 mt-0.5">
                                            Thanh toán qua ví điện tử MoMo
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center text-pink-600 shrink-0 font-black text-xs">
                                        M
                                    </div>
                                </label>

                                {/* Option 3: ATM / Internet Banking */}
                                <label
                                    onClick={() => setSelectedMethod('atm')}
                                    className={`relative flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                        selectedMethod === 'atm'
                                            ? 'border-[#2D7A4F] bg-[#E6FFFA]/50 dark:bg-emerald-950/40 dark:border-emerald-500'
                                            : 'border-[#E6ECE6] dark:border-[#1E2E24] hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-transparent'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        checked={selectedMethod === 'atm'}
                                        onChange={() => setSelectedMethod('atm')}
                                        className="mt-1 w-4 h-4 text-[#2D7A4F] focus:ring-[#2D7A4F] border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <span className="font-bold text-sm text-[#1A2E22] dark:text-white">
                                            ATM / Internet Banking
                                        </span>
                                        <p className="text-xs text-[#4A5568] dark:text-gray-400 mt-0.5">
                                            Thanh toán qua cổng thẻ ATM hoặc tài khoản ngân hàng nội địa
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 shrink-0">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Khối 3: Mã giảm giá (Voucher Input) */}
                        <div className="bg-white dark:bg-[#111A15] rounded-2xl p-5 sm:p-6 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-sm space-y-3">
                            <h2 className="text-sm font-bold text-[#718096] dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400" />
                                Mã giảm giá
                            </h2>

                            <form onSubmit={handleApplyVoucher} className="flex gap-2">
                                <input
                                    type="text"
                                    value={voucherInput}
                                    onChange={(e) => setVoucherInput(e.target.value)}
                                    placeholder="Nhập mã giảm giá (VD: SKILLGARDEN, PLT2026, VUONXANH)"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E6ECE6] dark:border-[#1E2E24] bg-gray-50/50 dark:bg-gray-900/50 text-sm font-medium text-[#1A2E22] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#2D7A4F] focus:ring-1 focus:ring-[#2D7A4F]"
                                />
                                <button
                                    type="submit"
                                    disabled={isApplyingVoucher || !voucherInput.trim()}
                                    className="px-5 py-2.5 rounded-xl bg-[#2D7A4F] text-white text-sm font-bold hover:bg-[#38A169] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                                >
                                    {isApplyingVoucher ? 'Đang kiểm tra...' : 'Áp dụng'}
                                </button>
                            </form>

                            {/* Voucher Feedback Messages */}
                            {voucherSuccess && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>{voucherSuccess}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveVoucher}
                                        className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer"
                                    >
                                        Gỡ bỏ
                                    </button>
                                </div>
                            )}

                            {voucherError && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-semibold">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <span>{voucherError}</span>
                                </div>
                            )}

                            {/* Gợi ý mã */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#718096] dark:text-gray-400">
                                <span>Gợi ý mã hot:</span>
                                <button
                                    type="button"
                                    onClick={() => setVoucherInput('SKILLGARDEN')}
                                    className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[#2D7A4F] dark:text-emerald-400 font-mono font-bold hover:bg-emerald-100 cursor-pointer"
                                >
                                    SKILLGARDEN (-100k)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVoucherInput('VUONXANH')}
                                    className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[#2D7A4F] dark:text-emerald-400 font-mono font-bold hover:bg-emerald-100 cursor-pointer"
                                >
                                    VUONXANH (-50k)
                                </button>
                            </div>
                        </div>

                        {/* Khối 4: Hướng dẫn thanh toán 4 bước chi tiết */}
                        <div className="bg-white dark:bg-[#111A15] rounded-2xl p-5 sm:p-6 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-sm space-y-3">
                            <h2 className="text-sm font-bold text-[#718096] dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400" />
                                Hướng dẫn thanh toán
                            </h2>

                            <ol className="space-y-2.5 text-xs text-[#4A5568] dark:text-gray-300 font-medium">
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                                        1
                                    </span>
                                    <span>
                                        <strong>Chọn phương thức thanh toán</strong> phù hợp bên trên (mặc định là VietQR).
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                                        2
                                    </span>
                                    <span>
                                        Nhấn <strong>"THANH TOÁN NGAY"</strong> để chuyển sang màn hình quét mã VietQR.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                                        3
                                    </span>
                                    <span>
                                        <strong>Hệ thống xác nhận giao dịch</strong> tự động trong 3 đến 30 giây.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-[#E6FFFA] dark:bg-emerald-950 text-[#2D7A4F] dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                                        4
                                    </span>
                                    <span>
                                        <strong>Khóa học được thêm vào khu vườn</strong> của bạn kèm mầm cây đặc biệt để bắt đầu nuôi dưỡng.
                                    </span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* ================= CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (5/12 - STICKY) ================= */}
                    <div className="lg:col-span-5 sticky top-24">
                        <div className="bg-white dark:bg-[#111A15] rounded-2xl p-6 border border-[#E6ECE6] dark:border-[#1E2E24] shadow-sm space-y-6">
                            <h2 className="text-base font-black text-[#1A2E22] dark:text-white uppercase tracking-wider">
                                ĐƠN HÀNG CỦA BẠN
                            </h2>

                            {/* Course Item Summary */}
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-[#E6ECE6] dark:border-[#1E2E24] flex gap-3 items-center">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-16 h-16 rounded-lg object-cover border border-[#E6ECE6] dark:border-gray-800 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                            KH
                                        </span>
                                        <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">
                                            A100291
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-[#1A2E22] dark:text-white truncate mt-1">
                                        {course.title}
                                    </h4>
                                    <p className="text-[11px] text-[#718096] dark:text-gray-400 mt-0.5">
                                        Giảng viên: {course.instructor} • {course.lessonsCount} bài học
                                    </p>
                                </div>
                            </div>

                            {/* Chi tiết giá */}
                            <div className="space-y-3 pt-2 text-xs">
                                <div className="flex justify-between items-center text-[#4A5568] dark:text-gray-300 font-medium">
                                    <span>Tạm tính</span>
                                    <span className="font-bold text-[#1A2E22] dark:text-white">
                                        {paymentService.formatVnd(originalPrice)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-[#4A5568] dark:text-gray-300 font-medium">
                                    <span>Giảm giá</span>
                                    <span className={`font-bold ${discountAmount > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                        {discountAmount > 0 ? `-${paymentService.formatVnd(discountAmount)}` : '-0đ'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-[#4A5568] dark:text-gray-300 font-medium">
                                    <span>Thuế (VAT)</span>
                                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                                        Đã bao gồm
                                    </span>
                                </div>

                                <div className="h-px bg-[#E6ECE6] dark:bg-[#1E2E24] my-2" />

                                <div className="flex justify-between items-baseline pt-1">
                                    <div>
                                        <span className="text-sm font-extrabold text-[#1A2E22] dark:text-white uppercase">
                                            TỔNG CỘNG
                                        </span>
                                        <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-normal">
                                            Truy cập vĩnh viễn
                                        </span>
                                    </div>
                                    <span className="text-2xl font-black text-[#2D7A4F] dark:text-emerald-400 font-mono tracking-tight">
                                        {paymentService.formatVnd(finalPrice)}
                                    </span>
                                </div>
                            </div>

                            {/* Nút THANH TOÁN NGAY nổi bật */}
                            <button
                                type="button"
                                onClick={handleProceedToPayment}
                                className="w-full py-4 px-6 rounded-xl bg-[#2D7A4F] hover:bg-[#38A169] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#2D7A4F]/25 hover:shadow-xl hover:shadow-[#2D7A4F]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                            >
                                <span>THANH TOÁN NGAY</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            {/* Footer nhỏ: 🔒 Thanh toán bảo mật */}
                            <div className="pt-2 text-center space-y-3">
                                <div className="inline-flex items-center gap-1.5 text-xs text-[#718096] dark:text-gray-400 font-semibold">
                                    <Lock className="w-3.5 h-3.5 text-[#2D7A4F] dark:text-emerald-400" />
                                    <span>🔒 Thanh toán bảo mật SSL 256-bit</span>
                                </div>

                                <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-400 dark:text-gray-500">
                                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px]">VietQR</span>
                                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px]">MoMo</span>
                                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px]">ATM / Napas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentCheckoutPage;
