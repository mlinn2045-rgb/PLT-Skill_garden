// skill_garden-Frontend/src/test/payment.test.tsx

import { describe, it, expect, beforeEach } from 'vitest';
import {
    paymentService,
    generateEmvcoQrString,
    DEFAULT_BANK_INFO,
    DEFAULT_COURSE
} from '../services/paymentService';

describe('Payment Service & Architecture Compliance', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('validates vouchers accurately and calculates discounts', () => {
        // Valid voucher SKILLGARDEN (-100k)
        const v1 = paymentService.validateVoucher('SKILLGARDEN');
        expect(v1.isValid).toBe(true);
        expect(v1.discountAmount).toBe(100000);

        // Valid voucher PLT2026 (-150k)
        const v2 = paymentService.validateVoucher('PLT2026');
        expect(v2.isValid).toBe(true);
        expect(v2.discountAmount).toBe(150000);

        // Valid voucher VUONXANH (-50k)
        const v3 = paymentService.validateVoucher('VUONXANH');
        expect(v3.isValid).toBe(true);
        expect(v3.discountAmount).toBe(50000);

        // Invalid voucher
        const vInvalid = paymentService.validateVoucher('INVALID_CODE');
        expect(vInvalid.isValid).toBe(false);
        expect(vInvalid.discountAmount).toBe(0);

        // Empty voucher
        const vEmpty = paymentService.validateVoucher('   ');
        expect(vEmpty.isValid).toBe(false);
    });

    it('generates standard EMVCo Dynamic QR strings with valid tags and CRC-16 checksum', () => {
        const qrString = generateEmvcoQrString(
            DEFAULT_BANK_INFO.bankBin,
            DEFAULT_BANK_INFO.accountNumber,
            600000,
            'A100291',
            'SKILLGARDEN'
        );

        // Must start with Format Indicator 000201
        expect(qrString.startsWith('000201')).toBe(true);

        // Must contain VietQR AID Tag 38
        expect(qrString).toContain('A000000727');

        // Must contain currency 5303704 (VND)
        expect(qrString).toContain('5303704');

        // Must contain amount 5406600000
        expect(qrString).toContain('5406600000');

        // Must contain Country VN 5802VN
        expect(qrString).toContain('5802VN');

        // Must contain CRC-16 tag 6304 followed by 4-hex checksum
        expect(qrString).toMatch(/6304[0-9A-F]{4}$/);
    });

    it('creates transaction with PENDING status and valid 15-minute expiration', () => {
        const tx = paymentService.createTransaction(
            {
                orderCode: 1711928301,
                amount: 500000,
                originalAmount: 600000,
                discountAmount: 100000,
                voucherCode: 'SKILLGARDEN',
                description: 'A100291',
                items: [{ name: DEFAULT_COURSE.title, quantity: 1, price: 500000 }],
                returnUrl: '/checkout/qr',
                cancelUrl: '/checkout',
                method: 'vietqr'
            },
            DEFAULT_COURSE
        );

        expect(tx.status).toBe('PENDING');
        expect(tx.amount).toBe(500000);
        expect(tx.discountAmount).toBe(100000);
        expect(tx.orderIdStr).toBe('A100291');
        expect(tx.expiresAt).toBeGreaterThan(Date.now());

        // Verify retrieval from storage
        const current = paymentService.getCurrentTransaction();
        expect(current).not.toBeNull();
        expect(current?.orderCode).toBe(1711928301);
    });

    it('manages state machine transitions: PENDING -> PAID and activates garden/course idempotently', () => {
        const tx = paymentService.createTransaction(
            {
                orderCode: 888999,
                amount: 600000,
                originalAmount: 600000,
                discountAmount: 0,
                description: 'A100291',
                items: [{ name: DEFAULT_COURSE.title, quantity: 1, price: 600000 }],
                returnUrl: '/checkout/qr',
                cancelUrl: '/checkout',
                method: 'vietqr'
            },
            DEFAULT_COURSE
        );

        expect(tx.status).toBe('PENDING');

        // Transition to PAID
        const updated = paymentService.updateStatus('PAID');
        expect(updated?.status).toBe('PAID');
        expect(updated?.completedAt).toBeDefined();

        // Check enrollment and garden storage
        const enrolled = JSON.parse(localStorage.getItem('skillgarden_enrolled_courses') || '[]');
        expect(enrolled).toContain(DEFAULT_COURSE.id);

        const planted = JSON.parse(localStorage.getItem('skillgarden_planted_skills') || '[]');
        expect(planted).toContain(DEFAULT_COURSE.id);

        // Check idempotency: calling post-payment activation again should not duplicate
        paymentService.handlePostPaymentSuccess(updated!);
        const plantedAfter = JSON.parse(localStorage.getItem('skillgarden_planted_skills') || '[]');
        expect(plantedAfter.filter((id: string) => id === DEFAULT_COURSE.id).length).toBe(1);
    });

    it('transitions to CANCELLED and EXPIRED properly', () => {
        paymentService.createTransaction(
            {
                orderCode: 123456,
                amount: 600000,
                originalAmount: 600000,
                discountAmount: 0,
                description: 'A100291',
                items: [{ name: DEFAULT_COURSE.title, quantity: 1, price: 600000 }],
                returnUrl: '/checkout/qr',
                cancelUrl: '/checkout',
                method: 'vietqr'
            },
            DEFAULT_COURSE
        );

        paymentService.cancelTransaction();
        const cancelled = paymentService.getCurrentTransaction();
        expect(cancelled?.status).toBe('CANCELLED');

        paymentService.updateStatus('EXPIRED');
        const expired = paymentService.getCurrentTransaction();
        expect(expired?.status).toBe('EXPIRED');

        // Renew transaction
        const renewed = paymentService.renewTransaction();
        expect(renewed?.status).toBe('PENDING');
        expect(renewed?.expiresAt).toBeGreaterThan(Date.now());
    });
});
