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

export interface SkillItem {
    id: number;
    title: string;
    slug: string;
    category: string;
    description?: string;
    icon_url?: string;
    status: string;
}

export interface PdfMaterial {
    id: number;
    lesson_id?: number;
    lesson_title?: string;
    skill_id?: number;
    skill_title?: string;
    title: string;
    file_url: string;
    file_type: string;
    file_size_bytes: number;
    created_at: string;
}

export interface QuizOption {
    id?: number;
    option_text: string;
    is_correct: boolean | number;
    order_index?: number;
}

export interface QuizQuestion {
    id: number;
    quiz_id?: number;
    skill_id?: number;
    skill_title?: string;
    question_text: string;
    question_type: string;
    difficulty: string;
    explanation?: string;
    options: QuizOption[];
    created_at?: string;
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

    // Skills
    async getSkills(): Promise<SkillItem[]> {
        const response = await request<SkillItem[]>('/skills.php');
        return response.data || [];
    },

    async createSkill(data: {
        title: string;
        slug?: string;
        category?: string;
        description?: string;
        icon_url?: string;
        plant_id?: number;
        status?: string;
    }): Promise<SkillItem> {
        const response = await request<SkillItem>('/admin/skills.php', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data!;
    },

    async updateSkill(id: number, data: Partial<SkillItem>): Promise<ApiResponse> {
        return request('/admin/skills.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data }),
        });
    },

    async deleteSkill(id: number): Promise<ApiResponse> {
        return request(`/admin/skills.php?id=${id}`, {
            method: 'DELETE',
            body: JSON.stringify({ skill_id: id }),
        });
    },

    async getCourseSyncStatus(courseId?: number): Promise<{ version_timestamp: number; sync_status: any }> {
        const url = courseId ? `/user/course-sync.php?course_id=${courseId}` : '/user/course-sync.php';
        const response = await request<{ version_timestamp: number; sync_status: any }>(url);
        return response.data!;
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
    async getMaterials(lessonId?: number, skillId?: number): Promise<PdfMaterial[]> {
        let url = '/admin/pdf-materials.php';
        const params: string[] = [];
        if (lessonId) params.push(`lesson_id=${lessonId}`);
        if (skillId) params.push(`skill_id=${skillId}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const response = await request<PdfMaterial[]>(url);
        return response.data || [];
    },

    async createMaterial(data: { lesson_id?: number; skill_id?: number; title: string; file_url: string; file_type?: string; file_size_bytes?: number }): Promise<ApiResponse> {
        return request('/admin/pdf-materials.php', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateMaterial(id: number, data: { lesson_id?: number; skill_id?: number; title: string; file_url: string; file_type?: string; file_size_bytes?: number }): Promise<ApiResponse> {
        return request(`/admin/pdf-materials.php?id=${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ id, ...data }),
        });
    },

    async deleteMaterial(id: number): Promise<ApiResponse> {
        return request(`/admin/pdf-materials.php?id=${id}`, {
            method: 'DELETE',
        });
    },

    // Question Bank API
    async getQuestions(skillId?: number, quizId?: number, difficulty?: string): Promise<QuizQuestion[]> {
        let url = '/admin/questions.php';
        const params: string[] = [];
        if (skillId) params.push(`skill_id=${skillId}`);
        if (quizId) params.push(`quiz_id=${quizId}`);
        if (difficulty) params.push(`difficulty=${difficulty}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const response = await request<QuizQuestion[]>(url);
        return response.data || [];
    },

    async createQuestion(data: {
        skill_id?: number;
        quiz_id?: number;
        question_text: string;
        question_type?: string;
        difficulty?: string;
        explanation?: string;
        options: { option_text: string; is_correct: boolean; order_index?: number }[];
    }): Promise<QuizQuestion> {
        const response = await request<QuizQuestion>('/admin/questions.php', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data!;
    },

    async updateQuestion(id: number, data: {
        skill_id?: number;
        quiz_id?: number;
        question_text?: string;
        question_type?: string;
        difficulty?: string;
        explanation?: string;
        options?: { option_text: string; is_correct: boolean; order_index?: number }[];
    }): Promise<ApiResponse> {
        return request('/admin/questions.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data }),
        });
    },

    async deleteQuestion(id: number): Promise<ApiResponse> {
        return request(`/admin/questions.php?id=${id}`, {
            method: 'DELETE',
        });
    }
};
