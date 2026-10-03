// skill_garden-Frontend/src/components/ai/AIAssistantWidget.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    MessageSquare,
    X,
    Minus,
    Send,
    RotateCcw,
    Sparkles,
    Copy,
    Check,
    Bot,
    User,
    ChevronDown,
    ExternalLink
} from 'lucide-react';
import { AIMascotViewer } from './AIMascotViewer';
import { useAIChatStore } from '../../stores/aiChatStore';
import { useAuthStore } from '../../stores/authStore';

export const AIAssistantWidget: React.FC = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const {
        isOpen,
        isMinimized,
        mascotMood,
        messages,
        isLoading,
        isStreaming,
        floatingGreeting,
        context,
        setOpen,
        toggleOpen,
        setMinimized,
        setGreeting,
        updateContext,
        clearMessages,
        sendMessage,
        sendQuickPrompt
    } = useAIChatStore();

    const [inputMessage, setInputMessage] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-update location context whenever the user navigates
    useEffect(() => {
        updateContext({
            currentPath: location.pathname + location.search,
            userLevel: user?.level || 1,
            userTotalXP: user?.total_xp ?? user?.xp ?? 0,
            userStreak: user?.streak_days || 1
        });

        // Trigger contextual mascot greeting based on route
        if (!isOpen) {
            if (location.pathname.includes('/video-learning')) {
                setGreeting('Bạn có thắc mắc gì về video bài giảng này không? 🎥');
            } else if (location.pathname.includes('/quiz-room')) {
                setGreeting('Cần mình gợi ý công thức hoặc giải thích quiz không? 🎯');
            } else if (location.pathname.includes('/garden')) {
                setGreeting('Vườn kỹ năng của bạn trông xanh tốt lắm! 🌸');
            } else {
                setGreeting('Xin chào! Mình là trợ lý AI SkillGarden 🌿');
            }

            const timer = setTimeout(() => {
                setGreeting(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [location.pathname, location.search, user, isOpen]);

    // Auto-scroll to latest message
    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isStreaming, isOpen, isMinimized]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const text = inputMessage.trim();
        if (!text || isLoading || isStreaming) return;

        setInputMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        await sendMessage(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    /** Simple and secure inline Markdown formatter */
    const renderFormattedText = (rawText: string) => {
        // Split code blocks
        const parts = rawText.split(/(```[\s\S]*?```)/g);

        return parts.map((part, idx) => {
            if (part.startsWith('```') && part.endsWith('```')) {
                const lines = part.slice(3, -3).trim().split('\n');
                const lang = lines[0].trim().match(/^[a-zA-Z0-9_-]+$/) ? lines[0].trim() : '';
                const codeBody = lang ? lines.slice(1).join('\n') : lines.join('\n');

                return (
                    <div key={idx} className="my-2 rounded-xl overflow-hidden border border-gray-700/60 bg-gray-950 text-gray-100 text-xs shadow-inner">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-gray-800 text-[10px] text-gray-400 font-mono">
                            <span>{lang || 'code'}</span>
                            <button
                                onClick={() => handleCopy(codeBody, idx)}
                                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                            >
                                {copiedIndex === idx ? (
                                    <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400 font-bold">Đã chép</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3" />
                                        <span>Sao chép</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed selection:bg-indigo-600">
                            <code>{codeBody}</code>
                        </pre>
                    </div>
                );
            }

            // Paragraphs and bold/code formatting
            return (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed text-xs space-y-1">
                    {part.split('\n\n').map((paragraph, pIdx) => {
                        // Replace bold and inline code
                        const formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                   .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[11px]">$1</code>');

                        return (
                            <p
                                key={pIdx}
                                dangerouslySetInnerHTML={{ __html: formatted }}
                            />
                        );
                    })}
                </div>
            );
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans select-none flex flex-col items-end pointer-events-auto">

            {/* COLLAPSED FLOATING MASCOT BUTTON */}
            {!isOpen && (
                <div className="relative group">
                    {/* Floating Speech Bubble Tooltip */}
                    {floatingGreeting && (
                        <div
                            onClick={toggleOpen}
                            className="absolute bottom-full right-0 mb-3 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-emerald-300 dark:border-emerald-700/60 text-xs font-semibold text-[#1A2E22] dark:text-gray-100 flex items-center justify-between gap-2 animate-bounce cursor-pointer group-hover:scale-105 transition-transform"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="line-clamp-2 leading-snug">{floatingGreeting}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setGreeting(null);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Circular Glassmorphism Mascot Button */}
                    <div
                        onClick={toggleOpen}
                        className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/30 to-indigo-500/30 backdrop-blur-lg border-2 border-emerald-400/80 dark:border-emerald-500/70 shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer group"
                    >
                        {/* Glowing pulse ring */}
                        <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />

                        {/* Interactive 3D Mascot */}
                        <AIMascotViewer
                            size={76}
                            mood={mascotMood}
                            interactive={true}
                            className="pointer-events-none"
                        />

                        {/* Status / Message Badge */}
                        <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-[10px] rounded-full shadow-md border-2 border-white dark:border-gray-900 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI</span>
                        </div>
                    </div>
                </div>
            )}

            {/* EXPANDED CHATBOX DIALOG */}
            {isOpen && (
                <div
                    className={`flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-emerald-300/80 dark:border-gray-800 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 ${
                        isMinimized
                            ? 'w-80 h-16'
                            : 'w-[420px] max-w-[94vw] h-[620px] max-h-[85vh]'
                    }`}
                >
                    {/* Header */}
                    <div className="p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between shadow-md shrink-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                            {/* Header 3D Mascot */}
                            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                                <AIMascotViewer
                                    size={40}
                                    mood={mascotMood}
                                    interactive={false}
                                />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-black text-sm tracking-tight truncate">SkillGarden AI</span>
                                    <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[9px] font-extrabold uppercase">Tutor</span>
                                </div>
                                <div className="text-[10px] text-emerald-100 flex items-center gap-1 truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                    <span>{mascotMood === 'thinking' ? 'Đang phân tích...' : mascotMood === 'speaking' ? 'Đang trả lời...' : 'Sẵn sàng giải đáp'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={clearMessages}
                                title="Làm mới cuộc trò chuyện"
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setMinimized(!isMinimized)}
                                title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                title="Đóng chat"
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Content Body (Visible when not minimized) */}
                    {!isMinimized && (
                        <>
                            {/* Current Learning Context Banner */}
                            <div className="px-3.5 py-2 bg-emerald-50/70 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-1.5 truncate">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span className="truncate">
                                        AI Tutor • <strong>100% Miễn phí</strong>
                                    </span>
                                </div>
                                <a
                                    href="/dashboard/hermes"
                                    className="text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-300 dark:border-purple-800 flex items-center gap-1 shrink-0 transition-all hover:scale-105"
                                    title="Chuyển sang AI Hermes để giải bài tập khó và suy luận sâu"
                                >
                                    <span>⚡ Giải bài khó (Hermes)</span>
                                </a>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 sidebar-scrollbar">
                                {messages.map((msg, index) => {
                                    const isUser = msg.role === 'user';
                                    return (
                                        <div
                                            key={msg.id || index}
                                            className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!isUser && (
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                                                    <Bot className="w-4 h-4" />
                                                </div>
                                            )}

                                            <div
                                                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs transition-all ${
                                                    isUser
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs'
                                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/80 rounded-tl-xs'
                                                }`}
                                            >
                                                {renderFormattedText(msg.content)}

                                                {/* Streaming indicator */}
                                                {msg.isStreaming && (
                                                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-500 animate-pulse align-middle" />
                                                )}

                                                {/* Quick Action Pills attached to message */}
                                                {msg.quickPrompts && msg.quickPrompts.length > 0 && (
                                                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex flex-wrap gap-1.5">
                                                        {msg.quickPrompts.map((prompt, pIdx) => (
                                                            <button
                                                                key={pIdx}
                                                                onClick={() => sendQuickPrompt(prompt)}
                                                                disabled={isLoading || isStreaming}
                                                                className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer disabled:opacity-50 text-left"
                                                            >
                                                                {prompt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {isUser && (
                                                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {isLoading && !isStreaming && (
                                    <div className="flex gap-2.5 items-center text-xs text-gray-500 dark:text-gray-400 italic">
                                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                            <Bot className="w-4 h-4 animate-spin" />
                                        </div>
                                        <span>AI đang tổng hợp dữ liệu bài học...</span>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Footer */}
                            <div className="p-3 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
                                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                                    <textarea
                                        ref={textareaRef}
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Đặt câu hỏi về bài học, code hoặc quiz..."
                                        rows={1}
                                        className="flex-1 max-h-24 py-2.5 pl-3.5 pr-10 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-emerald-500 resize-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputMessage.trim() || isLoading || isStreaming}
                                        className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 disabled:opacity-40 transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed shrink-0"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                                <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400 px-1">
                                    <span>Nhấn Enter để gửi, Shift+Enter xuống dòng</span>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">SkillGarden v1.0</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
