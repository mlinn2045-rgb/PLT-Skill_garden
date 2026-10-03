// skill_garden-Frontend/src/types/ai.ts
// AI Assistant, Tutor & Hermes Multi-Agent Types

export type AIMascotMood = 'idle' | 'thinking' | 'speaking' | 'happy' | 'waving';

export type AIModuleMode = 'TUTOR' | 'HERMES';

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    thinkingContent?: string; // Content extracted from <think>...</think>
    isThinking?: boolean;
    createdAt?: string;
    isStreaming?: boolean;
    model?: string;
    latencyMs?: number;
    quickPrompts?: string[];
}

export interface AIConversation {
    id: number;
    title: string;
    contextSkillId?: number | null;
    contextLessonId?: number | null;
    modelUsed?: string;
    mode?: AIModuleMode;
    creditsSpent?: number;
    updatedAt: string;
    messages?: AIMessage[];
}

export interface AIChatContext {
    skillId?: number | null;
    skillTitle?: string;
    lessonId?: number | null;
    lessonTitle?: string;
    currentPath: string;
    userLevel?: number;
    userTotalXP?: number;
    userStreak?: number;
}

export interface AIChatRequestPayload {
    message: string;
    conversationId?: number | null;
    model?: string;
    context?: AIChatContext;
    stream?: boolean;
}

export interface AIChatStreamEvent {
    type: 'start' | 'delta' | 'tool_call' | 'done' | 'error';
    delta?: string;
    tool?: string;
    conversationId?: number;
    messageId?: string;
    model?: string;
    creditsDeducted?: number;
    remainingCredits?: number;
    durationMs?: number;
    error?: string;
    message?: string;
    refunded?: boolean;
}

// =============================================================================
// AI HERMES STUDIO & CREDITS WALLET TYPES
// =============================================================================

export interface AIHermesModel {
    id: string;
    name: string;
    provider: string;
    badge: string;
    badgeColor: string;
    description: string;
    costCredits: number;
    supportsThinking: boolean;
    icon: string;
}

export interface AICreditPackage {
    id: string;
    name: string;
    price_vnd: number;
    credits: number;
    bonus_credits: number;
    badge?: string;
    description?: string;
}

export interface AICreditTransaction {
    id: number;
    order_code?: number | null;
    type: 'DEPOSIT' | 'HERMES_USAGE' | 'BONUS_GRANT' | 'REFUND';
    amount: number;
    balance_after: number;
    description: string;
    model_used?: string | null;
    created_at: string;
}

export interface AICreditWalletInfo {
    credits: number;
    packages: AICreditPackage[];
    transactions: AICreditTransaction[];
    merchantBank: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    };
}

export interface AIDepositOrder {
    orderCode: number;
    description: string;
    amount: number;
    package: {
        id: string;
        name: string;
        credits: number;
        bonusCredits: number;
        totalCredits: number;
    };
    bank: {
        bankName: string;
        bankBin: string;
        accountNumber: string;
        accountName: string;
    };
    qrImageUrl: string;
    expiresAt: number;
}

// =============================================================================
// AI QUIZ GENERATION TYPES (ADMIN LMS)
// =============================================================================

export interface GeneratedQuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    difficulty: string;
}

export interface GenerateQuizResponse {
    totalGenerated: number;
    difficulty: string;
    questions: GeneratedQuizQuestion[];
}
