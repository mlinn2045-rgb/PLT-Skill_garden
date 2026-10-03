// skill_garden-Frontend/src/pages/payment/PaymentQrPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShieldCheck,
    CheckCircle2,
    Copy,
    Check,
    Clock,
    AlertCircle,
    ArrowLeft,
    Lightbulb,
    RefreshCw,
    Download,
    ExternalLink,
    Sparkles,
    Sprout,
    BookOpen,
    Sun,
    Moon,
    X,
    Lock
} from 'lucide-react';
import {
    DEFAULT_BANK_INFO,
    DEFAULT_COURSE,
    paymentService
} from '../../services/paymentService';
import { PaymentStatus, PaymentTransaction } from '../../types/payment';
import { useAuthStore } from '../../stores/authStore';

export const PaymentQrPage: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleDarkMode } = useAuthStore();

    // Transaction state
    const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 mins in seconds

    // Copy Toast State
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Checking & Success Modal States
    const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

    // Load active transaction on mount
    useEffect(() => {
        let activeTx = paymentService.getCurrentTransaction();
        if (!activeTx) {
            // Auto create default transaction if accessing directly
            activeTx = paymentService.createTransaction(
                {
                    orderCode: Date.now(),
                    amount: DEFAULT_COURSE.originalPrice,
                    originalAmount: DEFAULT_COURSE.originalPrice,
                    discountAmount: 0,
                    description: 'A100291',
                    items: [{ name: DEFAULT_COURSE.title, quantity: 1, price: DEFAULT_COURSE.originalPrice }],
                    returnUrl: '/checkout/qr',
                    cancelUrl: '/checkout',
                    method: 'vietqr'
                },
                DEFAULT_COURSE
            );
        }
        setTransaction(activeTx);

        // Calculate initial remaining seconds
        const remaining = Math.max(Math.floor((activeTx.expiresAt - Date.now()) / 1000), 0);
        setTimeLeft(remaining);
    }, []);

    // Countdown Timer (15 Minutes)
    useEffect(() => {
        if (!transaction || transaction.status !== 'PENDING') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    paymentService.updateStatus('EXPIRED');
                    setTransaction((curr) => (curr ? { ...curr, status: 'EXPIRED' } : null));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [transaction?.status]);

    // Browser navigation / beforeunload guard
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (transaction?.status === 'PENDING') {
                e.preventDefault();
                e.returnValue = 'Giao dịch thanh toán chưa hoàn tất. Bạn có chắc chắn muốn rời khỏi trang?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [transaction?.status]);

    // Format Countdown mm:ss
    const formatCountdown = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Copy to clipboard with toast
    const handleCopy = (text: string, label: string, fieldId: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }

        setCopiedField(fieldId);
        setToastMessage(`Đã sao chép ${label}`);

        setTimeout(() => {
            setCopiedField(null);
        }, 2000);

        setTimeout(() => {
            setToastMessage(null);
        }, 2500);
    };

    // Check payment status simulation
    const handleCheckPaymentStatus = () => {
        if (!transaction || transaction.status !== 'PENDING') return;

        setIsCheckingStatus(true);
        setTimeout(() => {
            setIsCheckingStatus(false);
            const updated = paymentService.updateStatus('PAID');
            if (updated) {
                setTransaction(updated);
                setShowSuccessModal(true);
            }
        }, 1500);
    };

    // Renew QR when expired
    const handleRenewQr = () => {
        const renewed = paymentService.renewTransaction();
        if (renewed) {
            setTransaction(renewed);
            setTimeLeft(15 * 60);
            setToastMessage('Đã tạo mã QR mới!');
            setTimeout(() => setToastMessage(null), 2500);
        }
    };

    // Cancel transaction confirm
    const handleConfirmCancel = () => {
        paymentService.cancelTransaction();
        setShowCancelModal(false);
        navigate('/checkout');
    };

    if (!transaction) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FBFDFB] dark:bg-[#070D09]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D7A4F]"></div>
            </div>
        );
    }

    const bankInfo = transaction.bankInfo || DEFAULT_BANK_INFO;
    const isExpired = transaction.status === 'EXPIRED' || timeLeft <= 0;

    return (
        <div className="min-h-screen bg-[#FBFDFB] dark:bg-[#070D09] text-[#1A2E22] dark:text-[#E2E8F0] font-sans transition-colors duration-200 antialiased selection:bg-[#68D391]/30 pb-16">
            {/* Top Merchant Account Notice Bar */}
            <div className="bg-[#E6FFFA] dark:bg-emerald-950/80 border-b border-[#68D391]/40 px-4 py-2 text-xs font-semibold text-[#2D7A4F] dark:text-emerald-300">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2D7A4F] dark:bg-emerald-400 animate-pulse" />
                        <span>
                            <strong>Tài khoản thụ hưởng chính thức:</strong> <code className="font-mono bg-white dark:bg-emerald-900/60 px-1.5 py-0.5 rounded border border-[#68D391]/40 font-bold">Vietcombank - 1031174223 (NGUYEN HOANG ANH KHOA)</code>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#2D7A4F] dark:text-emerald-300 font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Tài khoản Merchant đã xác thực</span>
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

                    {/* Right Utilities */}
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

            {/* Main Body */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
                {/* Stepper / Breadcrumbs */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718096] dark:text-gray-400 hover:text-[#2D7A4F] dark:hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Quay lại chỉnh sửa đơn hàng</span>
                    </button>

                    {/* Countdown Timer Badge */}
                    <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-colors ${
                            isExpired
                                ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                                : timeLeft < 180
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-pulse'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-[#2D7A4F] dark:text-emerald-300'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                            {isExpired ? 'Mã QR đã hết hạn' : `Thời gian hiệu lực: ${formatCountdown(timeLeft)}`}
                        </span>
                    </div>
                </div>

                {/* ================= THẺ THANH TOÁN CHÍNH (CHUẨN ẢNH MẪU 1) ================= */}
                <div className="bg-white dark:bg-[#111A15] rounded-3xl border border-[#E6ECE6] dark:border-[#1E2E24] shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                    {/* Top Notice Banner: 💡 Icon bóng đèn + Text hướng dẫn chuẩn ảnh mẫu 1 */}
                    <div className="bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 px-6 py-4 flex items-center justify-center gap-3 text-center">
                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
                            Mở App Ngân hàng bất kỳ để <strong className="text-[#2D7A4F] dark:text-emerald-400">quét mã VietQR</strong> hoặc <strong className="text-[#2D7A4F] dark:text-emerald-400">chuyển khoản</strong> chính xác số tiền bên dưới
                        </p>
                    </div>

                    {/* Card Content Grid: 2 Columns Matching Reference Image 1 */}
                    <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        {/* ================= CỘT TRÁI: KHUNG VIETQR PRO (5/12) ================= */}
                        <div className="md:col-span-5 flex flex-col items-center">
                            {/* Khung QR Card */}
                            <div className="w-full max-w-[280px] bg-white rounded-2xl p-4 border border-gray-200 shadow-md flex flex-col items-center relative">
                                {/* Header: VIETQR PRO Logo */}
                                <div className="flex items-center gap-1.5 mb-2 select-none">
                                    <span className="text-base font-black tracking-tight text-[#DA251D]">
                                        Viet
                                    </span>
                                    <span className="text-base font-black tracking-tight text-[#005CA9]">
                                        QR
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider ml-0.5">
                                        PRO
                                    </span>
                                </div>

                                {/* QR Code Image Display */}
                                <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-gray-100">
                                    <img
                                        src={transaction.qrImageUrl}
                                        alt="VietQR Payment Code"
                                        className={`w-full h-full object-contain transition-all duration-300 ${
                                            isExpired ? 'blur-xs opacity-25' : ''
                                        }`}
                                    />

                                    {/* Overlay if Expired */}
                                    {isExpired && (
                                        <div className="absolute inset-0 bg-white/90 dark:bg-black/85 flex flex-col items-center justify-center p-4 text-center">
                                            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                                            <span className="text-xs font-bold text-red-600 mb-2">
                                                Mã QR đã hết hạn
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleRenewQr}
                                                className="px-3 py-1.5 rounded-lg bg-[#2D7A4F] text-white text-[11px] font-bold hover:bg-[#38A169] transition-all cursor-pointer flex items-center gap-1.5"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                <span>Tạo mã mới</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Footer: napas 247 | Vietcombank */}
                                <div className="w-full flex items-center justify-center gap-2 pt-3 mt-1 border-t border-gray-100 text-xs text-gray-600 select-none">
                                    <span className="font-bold text-[#005CA9] text-[11px]">napas 247</span>
                                    <span className="text-gray-300">|</span>
                                    <div className="flex items-center gap-1 font-bold text-[#005C29] text-[11px]">
                                        <span className="w-2 h-2 rounded-full bg-[#005C29] shrink-0 inline-block" />
                                        <span>Vietcombank</span>
                                    </div>
                                </div>
                            </div>

                            {/* Nút "Huỷ" bên dưới khung QR (Khớp ảnh mẫu 1) */}
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(true)}
                                className="mt-5 w-24 py-2 px-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-xs font-bold text-[#4A5568] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer text-center"
                            >
                                Huỷ
                            </button>
                        </div>

                        {/* ================= CỘT PHẢI: THÔNG TIN CHUYỂN KHOẢN (7/12) ================= */}
                        <div className="md:col-span-7 space-y-4">
                            {/* Ngân hàng */}
                            <div className="flex items-center gap-3 pb-3 border-b border-[#E6ECE6] dark:border-[#1E2E24]">
                                <div className="w-10 h-10 rounded-full bg-[#005C29] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm uppercase tracking-tighter">
                                    VCB
                                </div>
                                <div>
                                    <div className="text-[11px] text-[#718096] dark:text-gray-400 font-medium">
                                        Ngân hàng
                                    </div>
                                    <div className="text-sm font-bold text-[#1A2E22] dark:text-white">
                                        {bankInfo.bankName} (Vietcombank)
                                    </div>
                                </div>
                            </div>

                            {/* Chủ tài khoản */}
                            <div className="space-y-0.5">
                                <div className="text-[11px] text-[#718096] dark:text-gray-400 font-medium">
                                    Chủ tài khoản:
                                </div>
                                <div className="text-sm font-black text-[#1A2E22] dark:text-white uppercase tracking-wide">
                                    {bankInfo.accountName}
                                </div>
                            </div>

                            {/* Số tài khoản */}
                            <div className="space-y-1">
                                <div className="text-[11px] text-[#718096] dark:text-gray-400 font-medium">
                                    Số tài khoản:
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-base font-black font-mono tracking-wider text-[#1A2E22] dark:text-white">
                                        {bankInfo.accountNumber}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(bankInfo.accountNumber, 'Số tài khoản', 'accountNumber')}
                                        className="px-3.5 py-1.5 rounded-lg bg-[#E6FFFA] hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-[#2D7A4F] dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                    >
                                        {copiedField === 'accountNumber' ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Đã chép</span>
                                            </>
                                        ) : (
                                            <span>Sao chép</span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Số tiền */}
                            <div className="space-y-1">
                                <div className="text-[11px] text-[#718096] dark:text-gray-400 font-medium">
                                    Số tiền:
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-base font-black font-mono text-[#2D7A4F] dark:text-emerald-400">
                                        {new Intl.NumberFormat('vi-VN').format(transaction.amount)} vnd
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(transaction.amount.toString(), 'Số tiền', 'amount')}
                                        className="px-3.5 py-1.5 rounded-lg bg-[#E6FFFA] hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-[#2D7A4F] dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                    >
                                        {copiedField === 'amount' ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Đã chép</span>
                                            </>
                                        ) : (
                                            <span>Sao chép</span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Nội dung */}
                            <div className="space-y-1">
                                <div className="text-[11px] text-[#718096] dark:text-gray-400 font-medium">
                                    Nội dung:
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-base font-black font-mono text-[#1A2E22] dark:text-white">
                                        {transaction.orderIdStr}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(transaction.orderIdStr, 'Nội dung chuyển khoản', 'description')}
                                        className="px-3.5 py-1.5 rounded-lg bg-[#E6FFFA] hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-[#2D7A4F] dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                    >
                                        {copiedField === 'description' ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Đã chép</span>
                                            </>
                                        ) : (
                                            <span>Sao chép</span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Dòng ghi chú quan trọng (Khớp ảnh mẫu 1) */}
                            <div className="pt-3 text-xs text-[#718096] dark:text-gray-400 font-medium">
                                Lưu ý : Nhập chính xác số tiền{' '}
                                <strong className="text-[#1A2E22] dark:text-white font-black">
                                    {new Intl.NumberFormat('vi-VN').format(transaction.amount)}
                                </strong>{' '}
                                khi chuyển khoản
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar: Kiểm tra trạng thái giao dịch */}
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-5 sm:p-6 border-t border-[#E6ECE6] dark:border-[#1E2E24] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-[#718096] dark:text-gray-400 font-semibold">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>Đang chờ nhận khoản tiền từ ngân hàng của bạn...</span>
                        </div>

                        <button
                            type="button"
                            disabled={isCheckingStatus || isExpired}
                            onClick={handleCheckPaymentStatus}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D7A4F] hover:bg-[#38A169] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#2D7A4F]/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isCheckingStatus ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Đang kiểm tra giao dịch...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Kiểm tra trạng thái giao dịch</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            {/* ================= TOAST NOTIFICATION ================= */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#1A2E22] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ================= MODAL XÁC NHẬN HUỶ ================= */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-[#111A15] rounded-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-bold text-[#1A2E22] dark:text-white">
                                Xác nhận huỷ thanh toán?
                            </h3>
                            <p className="text-xs text-[#718096] dark:text-gray-400">
                                Đơn hàng hiện tại sẽ bị hủy và bạn sẽ được chuyển về trang thông tin khóa học.
                            </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            >
                                Tiếp tục thanh toán
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmCancel}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                            >
                                Huỷ giao dịch
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= SUCCESS MODAL (KÍCH HOẠT KHÓA HỌC & TẶNG CÂY VÀO VƯỜN) ================= */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#111A15] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-emerald-200 dark:border-emerald-800/60 shadow-2xl space-y-6 text-center relative overflow-hidden">
                        {/* Confetti Decorative Dots */}
                        <div className="absolute top-2 left-4 text-emerald-400 text-xl animate-bounce">✨</div>
                        <div className="absolute top-4 right-6 text-amber-400 text-xl animate-pulse">🎉</div>

                        {/* Big Green Badge */}
                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#2D7A4F] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                                <span>Giao Dịch Thành Công</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-[#1A2E22] dark:text-white">
                                Chúc Mừng Bạn Đã Mở Khóa Khóa Học!
                            </h3>
                            <p className="text-xs text-[#4A5568] dark:text-gray-300 leading-relaxed">
                                Đơn hàng <strong className="font-mono text-[#2D7A4F] dark:text-emerald-400">{transaction.orderIdStr}</strong> đã được đối soát tự động thành công.
                            </p>
                        </div>

                        {/* Gamification Gift: Seed Planted into Garden */}
                        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3.5 text-left">
                            <div className="w-12 h-12 rounded-xl bg-[#2D7A4F] text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                                🌱
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[#1A2E22] dark:text-white flex items-center gap-1.5">
                                    <span>Tặng 01 Hạt Giống Kỹ Năng</span>
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                </div>
                                <p className="text-[11px] text-[#4A5568] dark:text-gray-300 mt-0.5">
                                    Mầm cây đã được gieo vào <strong>Khu Vườn của bạn</strong>. Hãy bắt đầu học để tưới nước và chăm sóc cây phát triển!
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2.5 pt-2">
                            <Link
                                to="/dashboard/garden"
                                className="w-full py-3.5 px-5 rounded-xl bg-[#2D7A4F] hover:bg-[#38A169] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#2D7A4F]/20 cursor-pointer"
                            >
                                <Sprout className="w-4 h-4" />
                                <span>Đến khu vườn nhận cây 🌱</span>
                            </Link>

                            <Link
                                to="/dashboard/skill/1"
                                className="w-full py-3 px-5 rounded-xl border border-gray-200 dark:border-gray-800 text-[#4A5568] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span>Vào học bài đầu tiên</span>
                            </Link>

                            {/* Nút test lại luồng thanh toán độc lập */}
                            <button
                                type="button"
                                onClick={() => {
                                    paymentService.createTransaction(
                                        {
                                            orderCode: Date.now(),
                                            amount: DEFAULT_COURSE.originalPrice,
                                            originalAmount: DEFAULT_COURSE.originalPrice,
                                            discountAmount: 0,
                                            description: 'A100291',
                                            items: [{ name: DEFAULT_COURSE.title, quantity: 1, price: DEFAULT_COURSE.originalPrice }],
                                            returnUrl: '/checkout/qr',
                                            cancelUrl: '/checkout',
                                            method: 'vietqr'
                                        },
                                        DEFAULT_COURSE
                                    );
                                    setShowSuccessModal(false);
                                    navigate('/checkout');
                                }}
                                className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 dark:border-emerald-800 text-[#2D7A4F] dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>🔄 Chạy lại luồng Test từ đầu (Trang 1)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentQrPage;
