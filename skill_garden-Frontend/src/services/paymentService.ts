// skill_garden-Frontend/src/services/paymentService.ts

import {
    BankAccountInfo,
    CoursePaymentInfo,
    CreatePaymentPayload,
    PaymentMethodType,
    PaymentStatus,
    PaymentTransaction,
    VoucherValidationResult
} from '../types/payment';

/**
 * Official Primary Merchant Bank Account (Vietcombank)
 * Single registered account receiving 100% of VietQR payments
 */
export const PRIMARY_MERCHANT_BANK: BankAccountInfo = {
    bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    bankShortName: 'Vietcombank',
    bankBin: '970436', // Vietcombank BIN
    accountNumber: '1031174223',
    accountName: 'NGUYEN HOANG ANH KHOA'
};

export const DEFAULT_BANK_INFO: BankAccountInfo = PRIMARY_MERCHANT_BANK;

// Default Course Information
export const DEFAULT_COURSE: CoursePaymentInfo = {
    id: '1',
    title: 'Lập trình Fullstack & Kiến Trúc Hệ Thống Chuyên Sâu',
    instructor: 'Nguyễn Văn A',
    rating: 4.8,
    lessonsCount: 24,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    originalPrice: 600000,
    benefits: [
        'Truy cập trọn đời bài giảng & tài liệu kỹ thuật',
        'Cấp chứng chỉ tốt nghiệp chính thức từ Skill Garden',
        'Tặng 01 hạt giống cây kỹ năng đặc biệt vào Khu Vườn của bạn'
    ],
    plantType: 'Cây Bách Hợp Tri Thức 🌿',
    plantIcon: '🌿'
};

// CRC-16 CCITT Calculation for EMVCo QR Code
function calculateCRC16(data: string): string {
    let crc = 0xffff;
    const polynomial = 0x1021;

    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ polynomial) & 0xffff;
            } else {
                crc = (crc << 1) & 0xffff;
            }
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generate EMVCo standard QR Code string
 * Specification: AI_AND_PAYMENT_ARCHITECTURE_SPEC.md (Section 2.2)
 */
export function generateEmvcoQrString(
    bin: string,
    accountNo: string,
    amount: number,
    description: string,
    merchantName: string = 'SKILLGARDEN'
): string {
    const pad = (id: string, val: string) => `${id}${val.length.toString().padStart(2, '0')}${val}`;

    // Tag 38: Merchant Account Information
    const sub00 = pad('00', 'A000000727'); // VietQR AID
    const sub01 = pad('01', pad('00', bin) + pad('01', accountNo));
    const sub02 = pad('02', 'QRIBFTTA');
    const tag38 = pad('38', sub00 + sub01 + sub02);

    // Tag 54: Amount
    const tag54 = pad('54', amount.toString());

    // Tag 62: Additional Data Field (Order description)
    const sub08 = pad('08', description.slice(0, 25));
    const tag62 = pad('62', sub08);

    const payloadWithoutCrc =
        pad('00', '01') + // Format indicator
        pad('01', '12') + // Dynamic QR
        tag38 +
        pad('53', '704') + // Currency: VND
        tag54 +
        pad('58', 'VN') + // Country
        pad('59', merchantName.slice(0, 25)) +
        pad('60', 'HA NOI') +
        tag62 +
        '6304';

    const crc = calculateCRC16(payloadWithoutCrc);
    return payloadWithoutCrc + crc;
}

/**
 * Generate VietQR PRO image URL (matches Reference Screenshot 1)
 */
export function getVietQrImageUrl(
    bin: string,
    accountNo: string,
    amount: number,
    description: string,
    accountName: string
): string {
    const encodedDesc = encodeURIComponent(description);
    const encodedName = encodeURIComponent(accountName);
    return `https://img.vietqr.io/image/${bin}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
}

// Storage keys
const TRANSACTION_KEY = 'skillgarden_current_transaction';
const PROCESSED_ORDERS_KEY = 'skillgarden_processed_orders';
const ENROLLED_COURSES_KEY = 'skillgarden_enrolled_courses';
const PLANTED_SKILLS_KEY = 'skillgarden_planted_skills';

export const paymentService = {
    /**
     * Validate voucher discount code
     */
    validateVoucher(code: string, _currentTotal?: number): VoucherValidationResult {
        const clean = code.trim().toUpperCase();
        if (!clean) {
            return {
                isValid: false,
                discountAmount: 0,
                code: '',
                message: 'Vui lòng nhập mã giảm giá'
            };
        }

        switch (clean) {
            case 'SKILLGARDEN':
            case 'SKILLGARDEN2026':
                return {
                    isValid: true,
                    discountAmount: 100000,
                    code: clean,
                    message: 'Áp dụng mã ưu đãi SKILLGARDEN thành công (-100.000đ)'
                };
            case 'PLT2026':
                return {
                    isValid: true,
                    discountAmount: 150000,
                    code: clean,
                    message: 'Áp dụng mã đối tác PLT2026 thành công (-150.000đ)'
                };
            case 'VUONXANH':
                return {
                    isValid: true,
                    discountAmount: 50000,
                    code: clean,
                    message: 'Áp dụng mã mầm xanh thành công (-50.000đ)'
                };
            case 'A100291':
            case 'GIAM100K':
                return {
                    isValid: true,
                    discountAmount: 100000,
                    code: clean,
                    message: 'Mã ưu đãi khóa học A100291 (-100.000đ)'
                };
            default:
                return {
                    isValid: false,
                    discountAmount: 0,
                    code: clean,
                    message: 'Mã giảm giá không tồn tại hoặc đã hết hạn sử dụng'
                };
        }
    },

    /**
     * Get active merchant bank configuration (Always returns registered Vietcombank)
     */
    getBankConfig(): BankAccountInfo {
        return PRIMARY_MERCHANT_BANK;
    },

    /**
     * Micro-test price mode (2.000đ for safe testing vs 600.000đ official)
     */
    isMicroTestPriceMode(): boolean {
        // Default to true for testing phase as user agreed "được luôn"
        const saved = localStorage.getItem('skillgarden_micro_test_mode');
        return saved === null ? true : saved === 'true';
    },

    setMicroTestPriceMode(enabled: boolean): void {
        localStorage.setItem('skillgarden_micro_test_mode', enabled ? 'true' : 'false');
    },

    getEffectivePrice(basePrice: number): number {
        return this.isMicroTestPriceMode() ? 2000 : basePrice;
    },

    /**
     * Create a new payment transaction (State: PENDING)
     */
    createTransaction(
        payload: CreatePaymentPayload,
        course: CoursePaymentInfo,
        customBank?: BankAccountInfo
    ): PaymentTransaction {
        const bank = customBank || this.getBankConfig();
        const orderIdStr = 'A100291'; // Matching Reference Screenshot 1
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes timeout

        const emvcoQr = generateEmvcoQrString(
            bank.bankBin,
            bank.accountNumber,
            payload.amount,
            orderIdStr,
            bank.accountName
        );

        const qrImageUrl = getVietQrImageUrl(
            bank.bankBin,
            bank.accountNumber,
            payload.amount,
            orderIdStr,
            bank.accountName
        );

        const transaction: PaymentTransaction = {
            orderCode: payload.orderCode,
            orderIdStr,
            amount: payload.amount,
            originalAmount: payload.originalAmount,
            discountAmount: payload.discountAmount,
            voucherCode: payload.voucherCode,
            course,
            status: 'PENDING',
            method: payload.method,
            bankInfo: bank,
            emvcoQrString: emvcoQr,
            qrImageUrl,
            createdAt: Date.now(),
            expiresAt
        };

        localStorage.setItem(TRANSACTION_KEY, JSON.stringify(transaction));
        return transaction;
    },

    /**
     * Get current active transaction
     */
    getCurrentTransaction(): PaymentTransaction | null {
        try {
            const raw = localStorage.getItem(TRANSACTION_KEY);
            if (!raw) return null;
            const tx: PaymentTransaction = JSON.parse(raw);

            // Check expiration
            if (tx.status === 'PENDING' && Date.now() > tx.expiresAt) {
                tx.status = 'EXPIRED';
                localStorage.setItem(TRANSACTION_KEY, JSON.stringify(tx));
            }

            return tx;
        } catch {
            return null;
        }
    },

    /**
     * Update transaction status (State Machine)
     */
    updateStatus(newStatus: PaymentStatus): PaymentTransaction | null {
        const tx = this.getCurrentTransaction();
        if (!tx) return null;

        tx.status = newStatus;
        if (newStatus === 'PAID') {
            tx.completedAt = Date.now();
            this.handlePostPaymentSuccess(tx);
        }

        localStorage.setItem(TRANSACTION_KEY, JSON.stringify(tx));
        return tx;
    },

    /**
     * Idempotent Event-Driven Course Enrollment & Garden Planting
     * Specification: AI_AND_PAYMENT_ARCHITECTURE_SPEC.md (Section 2.3 & 3.1)
     */
    handlePostPaymentSuccess(tx: PaymentTransaction): boolean {
        try {
            // 1. Idempotency Check: Prevent duplicate processing for same orderCode
            const processedOrdersRaw = localStorage.getItem(PROCESSED_ORDERS_KEY);
            const processedOrders: number[] = processedOrdersRaw ? JSON.parse(processedOrdersRaw) : [];

            if (processedOrders.includes(tx.orderCode)) {
                // Already processed, idempotent return
                return true;
            }

            processedOrders.push(tx.orderCode);
            localStorage.setItem(PROCESSED_ORDERS_KEY, JSON.stringify(processedOrders));

            // 2. Enroll Course
            const enrolledRaw = localStorage.getItem(ENROLLED_COURSES_KEY);
            const enrolledCourses: string[] = enrolledRaw ? JSON.parse(enrolledRaw) : [];
            if (!enrolledCourses.includes(tx.course.id)) {
                enrolledCourses.push(tx.course.id);
                localStorage.setItem(ENROLLED_COURSES_KEY, JSON.stringify(enrolledCourses));
            }

            // 3. Plant Seed in My Garden (Gamification)
            const plantedRaw = localStorage.getItem(PLANTED_SKILLS_KEY);
            const plantedSkills: string[] = plantedRaw ? JSON.parse(plantedRaw) : [];
            if (!plantedSkills.includes(tx.course.id)) {
                plantedSkills.push(tx.course.id);
                localStorage.setItem(PLANTED_SKILLS_KEY, JSON.stringify(plantedSkills));
            }

            // 4. Dispatch Global Events
            window.dispatchEvent(new Event('skillgarden_tree_planted'));
            window.dispatchEvent(new Event('skillgarden_xp_updated'));

            return true;
        } catch (e) {
            console.error('Error handling post-payment activation:', e);
            return false;
        }
    },

    /**
     * Cancel current transaction
     */
    cancelTransaction(): void {
        this.updateStatus('CANCELLED');
    },

    /**
     * Regenerate expired transaction
     */
    renewTransaction(): PaymentTransaction | null {
        const tx = this.getCurrentTransaction();
        if (!tx) return null;

        tx.status = 'PENDING';
        tx.createdAt = Date.now();
        tx.expiresAt = Date.now() + 15 * 60 * 1000;
        localStorage.setItem(TRANSACTION_KEY, JSON.stringify(tx));
        return tx;
    },

    /**
     * Format currency display (VND)
     */
    formatVnd(amount: number): string {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
};
