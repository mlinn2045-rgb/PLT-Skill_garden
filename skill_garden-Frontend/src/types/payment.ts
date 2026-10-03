// skill_garden-Frontend/src/types/payment.ts

/**
 * Universal JSON Contract & Payment Types
 * Compliant with AI_AND_PAYMENT_ARCHITECTURE_SPEC.md (Section 2)
 */

export type PaymentMethodType = 'vietqr' | 'momo' | 'atm';

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'FAILED';

export interface PaymentOrderItem {
    name: string;
    quantity: number;
    price: number;
}

export interface CoursePaymentInfo {
    id: string;
    title: string;
    instructor: string;
    rating: number;
    lessonsCount: number;
    thumbnail: string;
    originalPrice: number;
    benefits: string[];
    plantType?: string;
    plantIcon?: string;
}

export interface CreatePaymentPayload {
    orderCode: number;
    amount: number;
    originalAmount: number;
    discountAmount: number;
    voucherCode?: string;
    description: string;
    items: PaymentOrderItem[];
    buyerName?: string;
    buyerEmail?: string;
    returnUrl: string;
    cancelUrl: string;
    method: PaymentMethodType;
}

export interface BankAccountInfo {
    bankName: string;
    bankShortName: string;
    bankBin: string;
    accountNumber: string;
    accountName: string;
}

export interface PaymentTransaction {
    orderCode: number;
    orderIdStr: string;
    amount: number;
    originalAmount: number;
    discountAmount: number;
    voucherCode?: string;
    course: CoursePaymentInfo;
    status: PaymentStatus;
    method: PaymentMethodType;
    bankInfo: BankAccountInfo;
    emvcoQrString: string;
    qrImageUrl: string;
    createdAt: number;
    expiresAt: number;
    completedAt?: number;
}

export interface VoucherValidationResult {
    isValid: boolean;
    discountAmount: number;
    code: string;
    message: string;
}
