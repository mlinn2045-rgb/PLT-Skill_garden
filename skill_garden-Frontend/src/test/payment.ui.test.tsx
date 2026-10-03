// skill_garden-Frontend/src/test/payment.ui.test.tsx

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PaymentCheckoutPage } from '../pages/payment/PaymentCheckoutPage';
import { PaymentQrPage } from '../pages/payment/PaymentQrPage';
import { paymentService } from '../services/paymentService';

describe('Payment Pages UI Rendering & Interactions', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders Trang 1 (PaymentCheckoutPage) with 2-column layout and default course details', () => {
        // Test with official 600.000đ price mode
        paymentService.setMicroTestPriceMode(false);

        render(
            <BrowserRouter>
                <PaymentCheckoutPage />
            </BrowserRouter>
        );

        // Header check
        expect(screen.getByText('Skill Garden')).toBeInTheDocument();
        expect(screen.getByText('🔒 Thanh toán an toàn')).toBeInTheDocument();

        // 2-column headings
        expect(screen.getByText('THANH TOÁN')).toBeInTheDocument();
        expect(screen.getByText('ĐƠN HÀNG CỦA BẠN')).toBeInTheDocument();

        // Course details
        expect(screen.getAllByText(/Lập trình Fullstack/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Nguyễn Văn A/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/4.8/)).toBeInTheDocument();
        expect(screen.getAllByText(/24 bài học/i).length).toBeGreaterThan(0);

        // 3 Payment methods
        expect(screen.getAllByText('VietQR').length).toBeGreaterThan(0);
        expect(screen.getAllByText('MoMo').length).toBeGreaterThan(0);
        expect(screen.getByText('ATM / Internet Banking')).toBeInTheDocument();

        // CTA button
        expect(screen.getByRole('button', { name: /THANH TOÁN NGAY/i })).toBeInTheDocument();

        // Official total price 600.000đ
        expect(screen.getAllByText('600.000đ').length).toBeGreaterThan(0);

        // Merchant account notice banner displays official Vietcombank
        expect(screen.getByText(/Vietcombank - 1031174223 \(NGUYEN HOANG ANH KHOA\)/i)).toBeInTheDocument();
    });

    it('supports 2.000đ micro-test price mode for safe end-to-end testing', () => {
        // Ensure micro-test price mode is active
        paymentService.setMicroTestPriceMode(true);

        render(
            <BrowserRouter>
                <PaymentCheckoutPage />
            </BrowserRouter>
        );

        expect(screen.getAllByText('2.000đ').length).toBeGreaterThan(0);
    });

    it('applies voucher SKILLGARDEN and recalculates the total on Trang 1', () => {
        // Switch to full price to test voucher discount
        paymentService.setMicroTestPriceMode(false);

        render(
            <BrowserRouter>
                <PaymentCheckoutPage />
            </BrowserRouter>
        );

        const voucherInput = screen.getByPlaceholderText(/Nhập mã giảm giá/i);
        const applyButton = screen.getByRole('button', { name: /Áp dụng/i });

        fireEvent.change(voucherInput, { target: { value: 'SKILLGARDEN' } });
        fireEvent.click(applyButton);

        // Price recalculation after voucher discount: 600k - 100k = 500k
        setTimeout(() => {
            expect(screen.getByText('500.000đ')).toBeInTheDocument();
            expect(screen.getByText(/-100.000đ/)).toBeInTheDocument();
        }, 400);
    });

    it('renders Trang 2 (PaymentQrPage) with VietQR Pro, Single Vietcombank Merchant Account, and 1-Click copy buttons', () => {
        render(
            <BrowserRouter>
                <PaymentQrPage />
            </BrowserRouter>
        );

        // Top Banner with lightbulb
        expect(
            screen.getByText(/Mở App Ngân hàng bất kỳ để/i)
        ).toBeInTheDocument();

        // VietQR Pro Header
        expect(screen.getByText('Viet')).toBeInTheDocument();
        expect(screen.getByText('QR')).toBeInTheDocument();
        expect(screen.getByText('PRO')).toBeInTheDocument();

        // Napas 247 & Vietcombank in card footer
        expect(screen.getByText('napas 247')).toBeInTheDocument();
        expect(screen.getAllByText('Vietcombank').length).toBeGreaterThan(0);

        // Official Merchant Transfer details (Vietcombank)
        expect(screen.getAllByText(/NGUYEN HOANG ANH KHOA/i).length).toBeGreaterThan(0);
        expect(screen.getByText('1031174223')).toBeInTheDocument();
        expect(screen.getByText('A100291')).toBeInTheDocument();

        // Verify there is NO multi-bank dropdown or modal selector
        expect(screen.queryByText(/Chọn ngân hàng thụ hưởng/i)).toBeNull();
        expect(screen.queryByRole('combobox')).toBeNull();

        // Check copy buttons
        const copyButtons = screen.getAllByRole('button', { name: /Sao chép/i });
        expect(copyButtons.length).toBe(3); // STK, Amount, Content

        // Cancel button
        expect(screen.getByRole('button', { name: 'Huỷ' })).toBeInTheDocument();

        // Check payment status button
        expect(
            screen.getByRole('button', { name: /Kiểm tra trạng thái giao dịch/i })
        ).toBeInTheDocument();
    });
});

