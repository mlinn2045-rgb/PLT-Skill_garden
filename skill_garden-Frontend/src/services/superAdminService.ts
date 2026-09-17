// skill_garden-Frontend/src/services/superAdminService.ts

import { request, ApiResponse } from './apiClient';

export interface AdminUser {
    id: number;
    uuid: string;
    email: string;
    full_name: string;
    username: string;
    role: string;
    status: 'ACTIVE' | 'LOCKED' | 'INACTIVE';
    is_approved: boolean;
    created_at: string;
    permissions?: string[];
}

export interface SystemReportData {
    users: {
        total: number;
        active: number;
        pending: number;
        admins: number;
    };
    learning: {
        total_skills: number;
        total_lessons: number;
        completed_lessons: number;
    };
    quizzes: {
        total_attempts: number;
        passed_attempts: number;
        pass_rate_percent: number;
    };
    garden: {
        total_trees: number;
        mature_trees: number;
    };
}

export interface AuditLogItem {
    id: number;
    user_id?: number;
    username?: string;
    full_name?: string;
    role?: string;
    action: string;
    target_entity?: string;
    target_id?: number;
    details?: string;
    ip_address?: string;
    created_at: string;
}

export const superAdminService = {
    // Admin Accounts Management
    async getAdminUsers(search?: string, status?: string): Promise<AdminUser[]> {
        let url = '/superadmin/users.php';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await request<AdminUser[]>(url);
        return response.data || [];
    },

    async createAdminUser(data: { full_name: string; email: string; username?: string; password: string; permissions?: string[] }): Promise<AdminUser> {
        const response = await request<AdminUser>('/superadmin/users.php', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data!;
    },

    async updateAdminUser(id: number, data: Partial<AdminUser> & { permissions?: string[] }): Promise<ApiResponse> {
        return request(`/superadmin/users.php?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteAdminUser(id: number): Promise<ApiResponse> {
        return request(`/superadmin/users.php?id=${id}`, {
            method: 'DELETE',
        });
    },

    // Admin Granular Permissions
    async getAdminPermissions(adminId: number): Promise<string[]> {
        const response = await request<{ admin_id: number; permissions: string[] }>(`/superadmin/permissions.php?admin_id=${adminId}`);
        return response.data?.permissions || [];
    },

    async setAdminPermissions(adminId: number, permissions: string[]): Promise<ApiResponse> {
        return request('/superadmin/permissions.php', {
            method: 'POST',
            body: JSON.stringify({ admin_id: adminId, permissions }),
        });
    },

    // System Reports & Analytics
    async getSystemReports(): Promise<SystemReportData> {
        const response = await request<SystemReportData>('/superadmin/reports.php');
        return response.data!;
    },

    // Audit Logs
    async getAuditLogs(page: number = 1, perPage: number = 20): Promise<{ items: AuditLogItem[]; pagination: any }> {
        const response = await request<{ items: AuditLogItem[]; pagination: any }>(`/superadmin/audit-logs.php?page=${page}&per_page=${perPage}`);
        return response.data || { items: [], pagination: {} };
    },

    // Global Configs
    async getSystemConfigs(): Promise<any[]> {
        const response = await request<any[]>('/superadmin/config.php');
        return response.data || [];
    },

    async updateSystemConfigs(configs: Record<string, any>): Promise<ApiResponse> {
        return request('/superadmin/config.php', {
            method: 'POST',
            body: JSON.stringify(configs),
        });
    }
};
