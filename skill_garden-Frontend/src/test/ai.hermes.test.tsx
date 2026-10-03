// skill_garden-Frontend/src/test/ai.hermes.test.tsx

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { aiService, HERMES_MODELS, DEFAULT_HERMES_MODEL } from '../services/aiService';
import { HermesStudioPage } from '../pages/dashboard/HermesStudioPage';
import { useAIHermesStore } from '../stores/aiHermesStore';

describe('AI Hermes Studio & Dual Architecture Suite', () => {
    beforeEach(() => {
        localStorage.clear();
        useAIHermesStore.setState({
            userCredits: 50,
            selectedModel: DEFAULT_HERMES_MODEL,
            isDepositModalOpen: false,
            depositOrder: null
        });
    });

    it('parses reasoning blocks <think>...</think> accurately from AI Hermes stream', () => {
        // Case 1: Complete thinking block and final answer
        const raw1 = `<think>
1. Phân tích bài toán QuickSort
2. Độ phức tạp O(N log N)
</think>
Đây là lời giải thuật toán chi tiết:`;

        const res1 = aiService.extractThinking(raw1);
        expect(res1.isThinking).toBe(false);
        expect(res1.thinking).toContain('Phân tích bài toán QuickSort');
        expect(res1.answer).toBe('Đây là lời giải thuật toán chi tiết:');

        // Case 2: In-progress thinking phase (stream hasn't sent </think> yet)
        const raw2 = `<think>
Đang kiểm tra các trường hợp biên...`;

        const res2 = aiService.extractThinking(raw2);
        expect(res2.isThinking).toBe(true);
        expect(res2.thinking).toContain('Đang kiểm tra các trường hợp biên...');
        expect(res2.answer).toBe('');

        // Case 3: No thinking tag
        const raw3 = 'Trả lời trực tiếp mà không cần thẻ think';
        const res3 = aiService.extractThinking(raw3);
        expect(res3.isThinking).toBe(false);
        expect(res3.thinking).toBe('');
        expect(res3.answer).toBe(raw3);
    });

    it('provides multi-model configuration with DeepSeek R1, Qwen Coder, and Gemini', () => {
        expect(HERMES_MODELS.length).toBeGreaterThanOrEqual(3);

        const deepseek = HERMES_MODELS.find(m => m.id.includes('deepseek'));
        expect(deepseek).toBeDefined();
        expect(deepseek?.supportsThinking).toBe(true);
        expect(deepseek?.costCredits).toBe(5);

        const qwen = HERMES_MODELS.find(m => m.id.includes('qwen'));
        expect(qwen).toBeDefined();
        expect(qwen?.costCredits).toBe(5);

        const gemini = HERMES_MODELS.find(m => m.id.includes('gemini'));
        expect(gemini).toBeDefined();
    });

    it('manages Credit Wallet and creates Vietcombank VietQR deposit orders', async () => {
        const wallet = await aiService.getWalletInfo();
        expect(wallet.credits).toBeGreaterThanOrEqual(0);
        expect(wallet.packages.length).toBeGreaterThanOrEqual(3);

        // Check Merchant Account Vietcombank
        expect(wallet.merchantBank.bankName).toBe('Vietcombank');
        expect(wallet.merchantBank.accountNumber).toBe('1031174223');
        expect(wallet.merchantBank.accountHolder).toBe('NGUYEN HOANG ANH KHOA');

        // Create deposit order for PKG_50K
        const order = await aiService.createDepositOrder('PKG_50K');
        expect(order.amount).toBe(50000);
        expect(order.package.credits + order.package.bonusCredits).toBe(700);
        expect(order.bank.accountNumber).toBe('1031174223');
        expect(order.qrImageUrl).toContain('970436-1031174223');

        // Confirm deposit and verify credit increment
        const confirmed = await aiService.confirmDeposit(order.orderCode, 'PKG_50K');
        expect(confirmed.creditsAdded).toBe(700);
        expect(confirmed.newBalance).toBeGreaterThan(500);
    });

    it('generates structured LMS Quiz questions from document content', async () => {
        const sampleDoc = `
        Kiến trúc ứng dụng Web hiện đại:
        1. Luồng dữ liệu một chiều (Unidirectional Data Flow)
        2. Tối ưu UX với React 19 useOptimistic
        3. Thanh toán VietQR chuẩn EMVCo an toàn
        `;

        const quizResult = await aiService.generateQuizFromText(sampleDoc, 3, 'MEDIUM');
        expect(quizResult.questions.length).toBeGreaterThanOrEqual(3);

        const q1 = quizResult.questions[0];
        expect(q1.question).toBeDefined();
        expect(q1.options.length).toBe(4);
        expect(typeof q1.correctAnswerIndex).toBe('number');
        expect(q1.explanation).toBeDefined();
    });

    it('renders HermesStudioPage UI with Model Switcher, Live Credits, and VietQR Modal', async () => {
        render(
            <BrowserRouter>
                <HermesStudioPage />
            </BrowserRouter>
        );

        // Check Studio Header
        expect(screen.getByText('AI Hermes Studio')).toBeInTheDocument();
        expect(screen.getByText(/PRO REASONING/i)).toBeInTheDocument();

        // Check Model Switcher
        expect(screen.getByText('DeepSeek')).toBeInTheDocument();
        expect(screen.getByText('Qwen')).toBeInTheDocument();

        // Check Credits indicator
        expect(screen.getAllByText(/50 Credits/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/5 Credits \/ câu hỏi/i)).toBeInTheDocument();

        // Open Deposit Modal
        const depositBtn = screen.getByRole('button', { name: /Nạp Credits/i });
        fireEvent.click(depositBtn);

        // Verify Modal content
        await waitFor(() => {
            expect(screen.getByText(/Nạp Hermes Credits • VietQR Vietcombank/i)).toBeInTheDocument();
            expect(screen.getByText(/Gói Hermes Siêu Trí Tuệ/i)).toBeInTheDocument();
            expect(screen.getByText('1031174223')).toBeInTheDocument();
            expect(screen.getByText(/NGUYEN HOANG ANH KHOA/i)).toBeInTheDocument();
        });
    });
});
