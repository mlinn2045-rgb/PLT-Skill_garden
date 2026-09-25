// skill_garden-Frontend/src/stores/authStore.ts

import { create } from 'zustand';
import { authService, UserProfile } from '../services/authService';

const savedTheme = localStorage.getItem('skillgarden_theme');
const initialDarkMode = savedTheme === 'dark';

if (initialDarkMode) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    isDarkMode: boolean;

    checkAuth: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    updateUser: (updatedData: Partial<UserProfile>) => void;
    addXP: (amount: number) => void;
    toggleDarkMode: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
    isDarkMode: initialDarkMode,

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const user = await authService.getMe();
            if (user) {
                // Merge local avatar if set
                const localAvatar = localStorage.getItem('skillgarden_avatar_' + user.email);
                if (localAvatar) {
                    user.avatar_url = localAvatar;
                }
                set({ user, isAuthenticated: true, isInitialized: true, isLoading: false, error: null });
            } else {
                set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
            }
        } catch {
            set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
        }
    },

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await authService.login(email, password);
            if (res.data?.user) {
                const user = res.data.user;
                if ((res.data as any)?.token) {
                    localStorage.setItem('skill_garden_token', (res.data as any).token);
                }
                const localAvatar = localStorage.getItem('skillgarden_avatar_' + user.email);
                if (localAvatar) {
                    user.avatar_url = localAvatar;
                }
                set({ user, isAuthenticated: true, isLoading: false, error: null });
                return true;
            }
            set({ isLoading: false, error: res.message || 'Đăng nhập thất bại' });
            return false;
        } catch (err: any) {
            set({ isLoading: false, error: err.message || 'Đăng nhập thất bại' });
            return false;
        }
    },

    register: async (fullName: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await authService.register(fullName, email, password);
            set({ isLoading: false, error: null });
            return { success: true, message: res.message };
        } catch (err: any) {
            set({ isLoading: false, error: err.message });
            return { success: false, message: err.message };
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await authService.logout();
        } catch {
            // Ignore logout errors
        } finally {
            set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
    },

    updateUser: (updatedData: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const newUser = { ...currentUser, ...updatedData };
        set({ user: newUser });
        if (updatedData.avatar_url) {
            localStorage.setItem('skillgarden_avatar_' + currentUser.email, updatedData.avatar_url);
        }
    },

    addXP: (amount: number) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const currentXP = currentUser.total_xp ?? currentUser.xp ?? 0;
        const newXP = currentXP + amount;

        // Level calculation rule:
        // L1-5: +1000XP per level (L1: 0-999, L2: 1000-1999, L3: 2000-2999, L4: 3000-3999, L5: 4000-4999)
        // L6-10: +2000XP per level (L6: 5000-6999, L7: 7000-8999, etc.)
        let newLevel = 1;
        if (newXP >= 5000) {
            newLevel = 5 + Math.floor((newXP - 5000) / 2000) + 1;
        } else {
            newLevel = Math.floor(newXP / 1000) + 1;
        }

        const newUser = { ...currentUser, xp: newXP, total_xp: newXP, level: newLevel };
        set({ user: newUser });
    },

    toggleDarkMode: () => {
        const nextDark = !get().isDarkMode;
        set({ isDarkMode: nextDark });
        localStorage.setItem('skillgarden_theme', nextDark ? 'dark' : 'light');
        if (nextDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    clearError: () => set({ error: null }),
}));
