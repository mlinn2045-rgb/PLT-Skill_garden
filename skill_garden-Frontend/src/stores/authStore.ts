// skill_garden-Frontend/src/stores/authStore.ts

import { create } from 'zustand';
import { authService, UserProfile } from '../services/authService';

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    checkAuth: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const user = await authService.getMe();
            if (user) {
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
                set({ user: res.data.user, isAuthenticated: true, isLoading: false, error: null });
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

    clearError: () => set({ error: null }),
}));
