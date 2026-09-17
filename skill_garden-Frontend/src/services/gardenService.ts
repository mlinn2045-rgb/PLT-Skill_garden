// skill_garden-Frontend/src/services/gardenService.ts

import { request, ApiResponse } from './apiClient';

export interface GardenTree {
    id: number;
    user_id: number;
    skill_id: number;
    skill_name?: string;
    plant_id: number;
    plant_name?: string;
    current_stage_id?: number;
    stage_name?: string;
    stage_image_url?: string;
    required_progress_percent?: number;
    level: number;
    status: 'GROWING' | 'MATURE' | 'WILTED';
    xp_accumulated: number;
    last_watered_at?: string;
}

export interface UserGardenResponse {
    stats: {
        level: number;
        total_xp: number;
        streak_days: number;
        total_trees: number;
        mature_trees: number;
    };
    trees: GardenTree[];
}

export const gardenService = {
    async getUserGarden(): Promise<UserGardenResponse> {
        const response = await request<UserGardenResponse>('/user/garden.php');
        return response.data || {
            stats: { level: 1, total_xp: 0, streak_days: 0, total_trees: 0, mature_trees: 0 },
            trees: []
        };
    },

    async waterTree(skillId: number): Promise<ApiResponse> {
        return request('/user/garden.php?action=water', {
            method: 'POST',
            body: JSON.stringify({ skill_id: skillId }),
        });
    },

    async plantSeed(skillId: number, plantId: number): Promise<ApiResponse> {
        return request('/user/garden.php?action=plant', {
            method: 'POST',
            body: JSON.stringify({ skill_id: skillId, plant_id: plantId }),
        });
    }
};
