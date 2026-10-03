// skill_garden-Frontend/src/stores/aiChatStore.ts
import { create } from 'zustand';
import { AIMessage, AIMascotMood, AIChatContext, AIChatStreamEvent } from '../types/ai';
import { API_BASE_URL } from '../services/apiClient';

interface AIChatState {
    isOpen: boolean;
    isMinimized: boolean;
    mascotMood: AIMascotMood;
    messages: AIMessage[];
    conversationId: number | null;
    isLoading: boolean;
    isStreaming: boolean;
    unreadCount: number;
    floatingGreeting: string | null;
    context: AIChatContext;

    // Actions
    setOpen: (open: boolean) => void;
    toggleOpen: () => void;
    setMinimized: (minimized: boolean) => void;
    setMascotMood: (mood: AIMascotMood) => void;
    setGreeting: (greeting: string | null) => void;
    updateContext: (ctx: Partial<AIChatContext>) => void;
    clearMessages: () => void;
    sendMessage: (userText: string) => Promise<void>;
    sendQuickPrompt: (promptText: string) => Promise<void>;
}

const INITIAL_WELCOME_MESSAGE: AIMessage = {
    id: 'welcome-0',
    role: 'assistant',
    content: 'Chào bạn! Mình là **Trợ lý AI SkillGarden** 🌿. Mình đồng hành cùng bạn giải đáp thắc mắc bài học, phân tích code, ôn tập bài thi và hướng dẫn lộ trình học tập tối ưu nhất. Bạn đang cần hỗ trợ phần nào?',
    createdAt: new Date().toISOString(),
    quickPrompts: [
        'Tóm tắt bài học đang xem',
        'Giải thích cú pháp code này',
        'Kiểm tra tiến độ & điểm thi của tôi',
        'Gợi ý bài học tiếp theo'
    ]
};

export const useAIChatStore = create<AIChatState>((set, get) => ({
    isOpen: false,
    isMinimized: false,
    mascotMood: 'idle',
    messages: [INITIAL_WELCOME_MESSAGE],
    conversationId: null,
    isLoading: false,
    isStreaming: false,
    unreadCount: 0,
    floatingGreeting: 'Chào bạn! Cần trợ giúp bài học không?',
    context: {
        currentPath: window.location.pathname,
    },

    setOpen: (open) => {
        set({ 
            isOpen: open, 
            unreadCount: open ? 0 : get().unreadCount,
            floatingGreeting: open ? null : get().floatingGreeting,
            mascotMood: open ? 'happy' : 'idle'
        });
        if (open) {
            setTimeout(() => {
                if (get().mascotMood === 'happy') {
                    set({ mascotMood: 'idle' });
                }
            }, 2500);
        }
    },

    toggleOpen: () => {
        const nextState = !get().isOpen;
        get().setOpen(nextState);
    },

    setMinimized: (minimized) => set({ isMinimized: minimized }),

    setMascotMood: (mood) => set({ mascotMood: mood }),

    setGreeting: (greeting) => set({ floatingGreeting: greeting }),

    updateContext: (ctx) => {
        set((state) => ({
            context: { ...state.context, ...ctx }
        }));
    },

    clearMessages: () => {
        set({
            messages: [INITIAL_WELCOME_MESSAGE],
            conversationId: null,
            isLoading: false,
            isStreaming: false,
            mascotMood: 'idle'
        });
    },

    sendQuickPrompt: async (promptText: string) => {
        await get().sendMessage(promptText);
    },

    sendMessage: async (userText: string) => {
        const trimmed = userText.trim();
        if (!trimmed || get().isLoading || get().isStreaming) return;

        const userMsgId = 'usr-' + Date.now();
        const assistantMsgId = 'ast-' + (Date.now() + 1);

        const newUserMessage: AIMessage = {
            id: userMsgId,
            role: 'user',
            content: trimmed,
            createdAt: new Date().toISOString()
        };

        const initialAssistantMessage: AIMessage = {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
            isStreaming: true
        };

        // Append user message & placeholder assistant message
        set((state) => ({
            messages: [...state.messages, newUserMessage, initialAssistantMessage],
            isLoading: true,
            isStreaming: true,
            mascotMood: 'thinking'
        }));

        try {
            const token = localStorage.getItem('skill_garden_token') || localStorage.getItem('token') || '';
            const payload = {
                message: trimmed,
                conversationId: get().conversationId,
                context: get().context
            };

            const endpoint = `${API_BASE_URL}/ai-tutor/chat-stream.php`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok || !response.body) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let accumulatedContent = '';
            let streamBuffer = '';

            // Switch to speaking mood once stream begins
            set({ isLoading: false, mascotMood: 'speaking' });

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                streamBuffer += decoder.decode(value, { stream: true });
                const lines = streamBuffer.split('\n\n');
                streamBuffer = lines.pop() || '';

                for (const line of lines) {
                    const cleanLine = line.trim();
                    if (!cleanLine.startsWith('data:')) continue;

                    const jsonStr = cleanLine.substring(5).trim();
                    if (jsonStr === '[DONE]') {
                        break;
                    }

                    try {
                        const event: AIChatStreamEvent = JSON.parse(jsonStr);
                        if (event.type === 'delta' && event.delta) {
                            accumulatedContent += event.delta;
                            set((state) => ({
                                messages: state.messages.map((m) =>
                                    m.id === assistantMsgId
                                        ? { ...m, content: accumulatedContent }
                                        : m
                                )
                            }));
                        } else if (event.type === 'done') {
                            if (event.conversationId) {
                                set({ conversationId: event.conversationId });
                            }
                        } else if (event.type === 'error') {
                            accumulatedContent += `\n\n*(Lỗi: ${event.error || 'Không thể tạo phản hồi'})*`;
                        }
                    } catch {
                        // In case of non-json raw text chunk
                        accumulatedContent += jsonStr;
                        set((state) => ({
                            messages: state.messages.map((m) =>
                                m.id === assistantMsgId
                                    ? { ...m, content: accumulatedContent }
                                    : m
                            )
                        }));
                    }
                }
            }

            // Finish streaming
            set((state) => ({
                isStreaming: false,
                mascotMood: 'idle',
                messages: state.messages.map((m) =>
                    m.id === assistantMsgId
                        ? { ...m, isStreaming: false, content: accumulatedContent || m.content }
                        : m
                )
            }));

        } catch (err: any) {
            console.error('AI Chat Error:', err);
            // Fallback response for offline or server initializing
            const fallbackText = `Xin lỗi bạn, kết nối tới dịch vụ AI đang bận hoặc đang được khởi tạo. Bạn vui lòng thử lại sau giây lát nhé! (Chi tiết: ${err.message || 'Network issue'})`;

            set((state) => ({
                isLoading: false,
                isStreaming: false,
                mascotMood: 'idle',
                messages: state.messages.map((m) =>
                    m.id === assistantMsgId
                        ? { ...m, isStreaming: false, content: fallbackText }
                        : m
                )
            }));
        }
    }
}));
