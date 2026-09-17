// skill_garden-Frontend/src/services/adminService.ts

import { request, ApiResponse } from './apiClient';

export interface PendingUser {
    id: number;
    uuid: string;
    email: string;
    full_name: string;
    username: string;
    role: string;
    status: string;
    is_approved: boolean;
    created_at: string;
}

export interface PlantStage {
    id: number;
    plant_id: number;
    stage_level: number;
    stage_name: string;
    required_progress_percent: number;
    image_url?: string;
}

export interface PlantType {
    id: number;
    name: string;
    code: string;
    description?: string;
    icon_url?: string;
    stages?: PlantStage[];
}

export interface PdfMaterial {
    id: number;
    lesson_id?: number;
    lesson_title?: string;
    title: string;
    file_url: string;
    file_type: string;
    file_size_bytes: number;
    created_at: string;
}

export const adminService = {
    // User Approvals
    async getPendingUsers(): Promise<PendingUser[]> {
        const response = await request<PendingUser[]>('/admin/users.php?status=PENDING');
        return response.data || [];
    },

    async approveUser(userIdOrEmail: number | string): Promise<ApiResponse> {
        const payload = typeof userIdOrEmail === 'number'
            ? { userId: userIdOrEmail }
            : { email: userIdOrEmail };
        return request('/approve.php', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    async rejectUser(userId: number): Promise<ApiResponse> {
        return request('/admin/users.php', {
            method: 'PUT',
            body: JSON.stringify({ id: userId, status: 'INACTIVE' }),
        });
    },

    // Plant Management
    async getPlants(): Promise<PlantType[]> {
        const response = await request<PlantType[]>('/plants.php');
        return response.data || [];
    },

    async createPlant(data: { name: string; code: string; description?: string; icon_url?: string }): Promise<PlantType> {
        const response = await request<PlantType>('/plants.php', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data!;
    },

    async updatePlant(id: number, data: Partial<PlantType>): Promise<ApiResponse> {
        return request(`/plants.php?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deletePlant(id: number): Promise<ApiResponse> {
        return request(`/plants.php?id=${id}`, {
            method: 'DELETE',
        });
    },

    async savePlantStage(plantId: number, stageData: Partial<PlantStage>): Promise<PlantType> {
        const response = await request<PlantType>(`/plants.php?action=stage`, {
            method: 'POST',
            body: JSON.stringify({ plant_id: plantId, ...stageData }),
        });
        return response.data!;
    },

    // Gamification Configs
    async getGamificationConfigs(): Promise<any[]> {
        const response = await request<any[]>('/admin/gamification.php');
        return response.data || [];
    },

    async updateGamificationConfigs(configs: Record<string, any>): Promise<ApiResponse> {
        return request('/admin/gamification.php', {
            method: 'POST',
            body: JSON.stringify(configs),
        });
    },

    // PDF Materials
    async getMaterials(lessonId?: number): Promise<PdfMaterial[]> {
        const url = lessonId ? `/admin/pdf-materials.php?lesson_id=${lessonId}` : '/admin/pdf-materials.php';
        const response = await request<PdfMaterial[]>(url);
        return response.data || [];
    },

    async createMaterial(data: { lesson_id?: number; title: string; file_url: string; file_type?: string; file_size_bytes?: number }): Promise<ApiResponse> {
        return request('/admin/pdf-materials.php', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async deleteMaterial(id: number): Promise<ApiResponse> {
        return request(`/admin/pdf-materials.php?id=${id}`, {
            method: 'DELETE',
        });
    }
};
