// skill_garden-Frontend/src/pages/dashboard/HermesStudioPage.tsx
// Dedicated AI Hermes Studio Page - Deep Reasoning, Multi-Model Hub & Credit Wallet

import React, { useEffect, useRef, useState } from 'react';
import {
    Zap,
    Brain,
    Code,
    Sparkles,
    Send,
    Plus,
    RefreshCw,
    Wallet,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    AlertCircle,
    CheckCircle2,
    X,
    QrCode,
    CreditCard,
    ArrowUpRight,
    Terminal,
    Bot
} from 'lucide-react';
import { useAIHermesStore } from '../../stores/aiHermesStore';
import { AICreditPackage, AIHermesModel, AIMessage } from '../../types/ai';

export const HermesStudioPage: React.FC = () => {
    const {
        selectedModel,
        availableModels,
        setSelectedModel,
        messages,
        isStreaming,
        userCredits,
        fetchWallet,
        isDepositModalOpen,
        openDepositModal,
        closeDepositModal,
        packages,
        selectedPackage,
        selectPackage,
        depositOrder,
        isCreatingDeposit,
        isConfirmingDeposit,
        confirmDepositPayment,
        sendMessage,
        clearMessages,
        depositSuccessToast
    } = useAIHermesStore();

    const [inputPrompt, setInputPrompt] = useState('');
    const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    useEffect(() => {
        if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isStreaming]);

    const toggleThinking = (msgId: string) => {
        setExpandedThinking((prev) => ({
            ...prev,
            [msgId]: !prev[msgId]
        }));
    };

    const handleSend = () => {
        if (!inputPrompt.trim() || isStreaming) return;
        const msg = inputPrompt;
        setInputPrompt('');
        sendMessage(msg);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCopy = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const quickPrompts = [
        '🧠 Giải thuật toán QuickSort tối ưu hóa O(N log N) kèm phân tích trường hợp xấu nhất',
        '💻 Viết React 19 Custom Hook useDebouncedQuery có TypeScript type-safety',
        '⚡ Phân tích kiến trúc Clean Architecture cho dự án Fullstack Next.js & NestJS',
        '🔍 Debug và sửa lỗi Memory Leak trong useEffect khi lắng nghe WebSocket'
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto px-2 sm:px-4 pb-4">
            {/* Success Toast */}
            {depositSuccessToast && (
                <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl animate-bounce">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs sm:text-sm font-bold">{depositSuccessToast}</span>
                </div>
            )}

            {/* Top Workspace Header */}
            <div className="bg-white dark:bg-[#111A15] border border-gray-200 dark:border-[#1E2E24] rounded-2xl p-4 mb-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Left: Studio Branding */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-500/20">
                            ⚡
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                    AI Hermes Studio
                                </h1>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                    PRO REASONING
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Trung tâm suy luận chuyên sâu bài khó & lập trình nâng cao
                            </p>
                        </div>
                    </div>

                    {/* Middle: Model Switcher */}
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#070D09] p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                        {availableModels.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setSelectedModel(m)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    selectedModel.id === m.id
                                        ? 'bg-white dark:bg-[#1A2E22] text-purple-700 dark:text-purple-300 shadow-xs border border-gray-200 dark:border-gray-700'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <span>{m.icon}</span>
                                <span className="hidden sm:inline">{m.name.split(' ')[0]}</span>
                                {selectedModel.id === m.id && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right: Credits Wallet Badge & Actions */}
                    <div className="flex items-center gap-2.5">
                        <div
                            onClick={() => openDepositModal()}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 cursor-pointer hover:bg-purple-100 transition-colors"
                            title="Bấm để nạp thêm Credits"
                        >
                            <Zap className="w-4 h-4 text-purple-600 fill-purple-600 animate-pulse" />
                            <span className="text-xs font-mono font-black">
                                {userCredits} Credits
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => openDepositModal()}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-purple-500/20 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Nạp Credits</span>
                        </button>

                        <button
                            type="button"
                            onClick={clearMessages}
                            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                            title="Xóa đoạn chat làm mới"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Model Info Banner */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Mô hình đang chọn: <strong>{selectedModel.name}</strong>
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${selectedModel.badgeColor}`}>
                            {selectedModel.badge}
                        </span>
                        <span className="hidden md:inline text-gray-400">• {selectedModel.description}</span>
                    </div>
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-bold shrink-0">
                        ⚡ 5 Credits / câu hỏi
                    </span>
                </div>
            </div>

            {/* Chat Messages Feed Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3 scrollbar-thin">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role !== 'user' && (
                            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                                ⚡
                            </div>
                        )}

                        <div className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 ${
                            msg.role === 'user'
                                ? 'bg-purple-600 text-white rounded-br-none shadow-sm'
                                : 'bg-white dark:bg-[#111A15] border border-gray-200 dark:border-[#1E2E24] text-gray-800 dark:text-gray-200 rounded-bl-none shadow-xs'
                        }`}>
                            {/* Model tag for assistant */}
                            {msg.role !== 'user' && msg.model && (
                                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800 text-[11px] text-gray-400">
                                    <span className="font-bold text-purple-600 dark:text-purple-400">
                                        AI Hermes • {msg.model}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(msg.content, msg.id)}
                                        className="hover:text-purple-600 flex items-center gap-1 cursor-pointer"
                                    >
                                        {copiedField === msg.id ? (
                                            <Check className="w-3 h-3 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                        <span>Sao chép</span>
                                    </button>
                                </div>
                            )}

                            {/* Thinking Block (DeepSeek R1 / Reasoning chain) */}
                            {msg.thinkingContent && (
                                <div className="mb-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/70 dark:bg-purple-950/30 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleThinking(msg.id)}
                                        className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-purple-800 dark:text-purple-300 hover:bg-purple-100/50 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Brain className={`w-3.5 h-3.5 text-purple-600 ${msg.isThinking ? 'animate-spin' : ''}`} />
                                            <span>
                                                {msg.isThinking ? 'Đang suy luận logic bài toán...' : 'Quá trình suy luận (Chain-of-Thought)'}
                                            </span>
                                        </div>
                                        {expandedThinking[msg.id] ? (
                                            <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                    </button>

                                    {/* Collapsible Content */}
                                    {(expandedThinking[msg.id] || msg.isThinking) && (
                                        <div className="p-3 border-t border-purple-200 dark:border-purple-900/50 text-xs font-mono text-purple-900 dark:text-purple-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto bg-purple-50/40 dark:bg-black/30">
                                            {msg.thinkingContent}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Message Main Body */}
                            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                            </div>
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-xs shrink-0">
                                Bạn
                            </div>
                        )}
                    </div>
                ))}

                {/* Streaming Indicator */}
                {isStreaming && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 pl-11 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Hermes đang viết câu trả lời chuyên sâu...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Chips */}
            {messages.length <= 1 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                    {quickPrompts.map((q, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => {
                                setInputPrompt(q);
                                if (textareaRef.current) textareaRef.current.focus();
                            }}
                            className="px-3 py-1 rounded-xl bg-white dark:bg-[#111A15] border border-gray-200 dark:border-[#1E2E24] hover:border-purple-400 dark:hover:border-purple-600 text-[11px] font-medium text-gray-600 dark:text-gray-300 transition-colors text-left cursor-pointer"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Form Bar */}
            <div className="bg-white dark:bg-[#111A15] border border-gray-200 dark:border-[#1E2E24] rounded-2xl p-2.5 shadow-md">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={textareaRef}
                        rows={2}
                        value={inputPrompt}
                        onChange={(e) => setInputPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Dán đề bài khó, thuật toán hoặc code cần AI ${selectedModel.name} phân tích... (Shift+Enter để xuống dòng)`}
                        className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 max-h-32 p-1"
                    />

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!inputPrompt.trim() || isStreaming}
                        className="p-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white transition-all cursor-pointer disabled:cursor-not-allowed shadow-md shadow-purple-600/20 shrink-0"
                        title="Gửi câu hỏi (Enter)"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 pt-1.5 border-t border-gray-100 dark:border-gray-800 mt-1.5">
                    <span>
                        💡 Mẹo: Bấm <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono">Enter</kbd> để gửi
                    </span>
                    <span>
                        Số dư: <strong>{userCredits} Credits</strong> (Hao phí: 5 Credits)
                    </span>
                </div>
            </div>

            {/* =========================================================================
                DEPOSIT CREDITS MODAL (VIETQR VIETCOMBANK 1031174223)
            ========================================================================== */}
            {isDepositModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-xl bg-white dark:bg-[#111A15] border border-gray-200 dark:border-[#1E2E24] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                                    <Zap className="w-5 h-5 fill-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white">
                                        Nạp Hermes Credits • VietQR Vietcombank
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Tự động cộng Credits ngay sau khi chuyển khoản
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeDepositModal}
                                className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 overflow-y-auto space-y-4">
                            {/* Package Selection Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {packages.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        onClick={() => selectPackage(pkg)}
                                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative ${
                                            selectedPackage?.id === pkg.id
                                                ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 shadow-sm'
                                                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                                        }`}
                                    >
                                        {pkg.badge && (
                                            <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider">
                                                {pkg.badge}
                                            </span>
                                        )}
                                        <div className="text-xs font-bold text-gray-800 dark:text-white">
                                            {pkg.name}
                                        </div>
                                        <div className="text-base font-black text-purple-600 dark:text-purple-400 mt-1">
                                            {new Intl.NumberFormat('vi-VN').format(pkg.price_vnd)}đ
                                        </div>
                                        <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                                            +{pkg.credits + pkg.bonus_credits} Credits
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* QR Code & Banking Details (Vietcombank) */}
                            {depositOrder ? (
                                <div className="bg-gray-50 dark:bg-[#070D09] rounded-2xl p-4 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-5">
                                    {/* QR Code Image */}
                                    <div className="w-40 h-40 bg-white rounded-xl p-2 border border-gray-200 shrink-0 flex items-center justify-center shadow-xs">
                                        <img
                                            src={depositOrder.qrImageUrl}
                                            alt="VietQR Deposit Code"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    {/* Transfer Info */}
                                    <div className="flex-1 space-y-2 text-xs w-full">
                                        <div className="flex justify-between items-center pb-1.5 border-b border-gray-200 dark:border-gray-800">
                                            <span className="text-gray-500">Ngân hàng thụ hưởng:</span>
                                            <strong className="text-gray-900 dark:text-white font-bold">
                                                {depositOrder.bank.bankName}
                                            </strong>
                                        </div>

                                        <div className="flex justify-between items-center pb-1.5 border-b border-gray-200 dark:border-gray-800">
                                            <span className="text-gray-500">Số tài khoản:</span>
                                            <div className="flex items-center gap-1.5">
                                                <code className="font-mono font-black text-gray-900 dark:text-white">
                                                    {depositOrder.bank.accountNumber}
                                                </code>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(depositOrder.bank.accountNumber, 'stk')}
                                                    className="p-1 rounded bg-gray-200 dark:bg-gray-800 hover:text-purple-600 cursor-pointer"
                                                >
                                                    {copiedField === 'stk' ? (
                                                        <Check className="w-3 h-3 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="w-3 h-3" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pb-1.5 border-b border-gray-200 dark:border-gray-800">
                                            <span className="text-gray-500">Chủ tài khoản:</span>
                                            <strong className="text-gray-900 dark:text-white font-bold uppercase">
                                                {depositOrder.bank.accountName}
                                            </strong>
                                        </div>

                                        <div className="flex justify-between items-center pb-1.5 border-b border-gray-200 dark:border-gray-800">
                                            <span className="text-gray-500">Số tiền:</span>
                                            <strong className="text-purple-600 dark:text-purple-400 font-bold">
                                                {new Intl.NumberFormat('vi-VN').format(depositOrder.amount)}đ
                                            </strong>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Nội dung chuyển:</span>
                                            <div className="flex items-center gap-1.5">
                                                <code className="font-mono font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-1 rounded">
                                                    {depositOrder.description}
                                                </code>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(depositOrder.description, 'desc')}
                                                    className="p-1 rounded bg-gray-200 dark:bg-gray-800 hover:text-purple-600 cursor-pointer"
                                                >
                                                    {copiedField === 'desc' ? (
                                                        <Check className="w-3 h-3 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="w-3 h-3" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-xs text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
                                    <span>Đang sinh mã QR Vietcombank...</span>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-[#070D09]">
                            <span className="text-[11px] text-gray-500">
                                🔒 Giao dịch mã hóa an toàn qua VietQR
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={closeDepositModal}
                                    className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDepositPayment}
                                    disabled={isConfirmingDeposit || !depositOrder}
                                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {isConfirmingDeposit ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    )}
                                    <span>Tôi đã chuyển khoản thành công</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HermesStudioPage;
