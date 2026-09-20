// skill_garden-Frontend/src/services/apiClient.ts

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
    url?: string;
    filename?: string;
}

export async function parseApiResponse<T = any>(
    response: Response,
    fallbackMessage = 'Thao tac khong thanh cong.'
): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return await response.json();
    }

    const text = await response.text();
    const trimmedText = text.trimStart();
    const isHtml = trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html');

    if (isHtml) {
        throw new Error(
            response.status === 404
                ? 'Khong tim thay API Backend. Vui long kiem tra cau hinh proxy hoac VITE_API_URL.'
                : 'Backend tra ve HTML thay vi JSON. Vui long kiem tra Backend/proxy dang chay dung chua.'
        );
    }

    throw new Error(text || fallbackMessage);
}

export async function request<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers as Record<string, string> || {}),
    };

    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
    };

    try {
        const response = await fetch(url, config);
        const data = await parseApiResponse<T>(response);

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Thao tác không thành công.');
        }

        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể kết nối tới máy chủ Backend.');
    }
}

export const apiClient = {
    get: <T = any>(endpoint: string, options?: RequestInit) =>
        request<T>(endpoint, { method: 'GET', ...options }),

    post: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
        const isFormData = body instanceof FormData;
        return request<T>(endpoint, {
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body),
            ...options
        });
    },

    patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
        request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
            ...options,
        }),

    delete: <T = any>(endpoint: string, options?: RequestInit) =>
        request<T>(endpoint, { method: 'DELETE', ...options }),
};
