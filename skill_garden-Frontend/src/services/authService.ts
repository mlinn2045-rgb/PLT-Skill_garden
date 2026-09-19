// skill_garden-Frontend/src/services/authService.ts

export const API_BASE_URL = import.meta.env.VITE_API_URL
    || `${window.location.origin}/api`;

export interface UserProfile {
    uuid: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
    is_approved: boolean;
    level?: number;
    total_xp?: number;
    streak_days?: number;
    created_at?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
}

export const authService = {
    async register(fullName: string, email: string, password: string): Promise<ApiResponse<UserProfile>> {
        const response = await fetch(`${API_BASE_URL}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ fullName, email, password }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Đăng ký thất bại.');
        }
        return data;
    },

    async login(email: string, password: string): Promise<ApiResponse<{ user: UserProfile }>> {
        const response = await fetch(`${API_BASE_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            const error = new Error(data.message || 'Đăng nhập thất bại.') as any;
            error.status = response.status;
            throw error;
        }
        return data;
    },

    async logout(): Promise<ApiResponse> {
        const response = await fetch(`${API_BASE_URL}/logout.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        return data;
    },

    async getMe(): Promise<UserProfile | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/me.php`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                return null;
            }
            const data: ApiResponse<UserProfile> = await response.json();
            return data.data || null;
        } catch {
            return null;
        }
    },

    async forgotPassword(email: string): Promise<ApiResponse> {
        const response = await fetch(`${API_BASE_URL}/forgot-password.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Gửi yêu cầu khôi phục thất bại.');
        }
        return data;
    },

    async approveAccount(emailOrUserId: string | number): Promise<ApiResponse> {
        const payload = typeof emailOrUserId === 'number'
            ? { userId: emailOrUserId }
            : { email: emailOrUserId };

        const response = await fetch(`${API_BASE_URL}/approve.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Phê duyệt tài khoản thất bại.');
        }
        return data;
    }
};
