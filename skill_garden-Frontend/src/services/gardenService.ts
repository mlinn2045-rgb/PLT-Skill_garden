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

const repairMojibake = (value?: string): string | undefined => {
    if (!value || !/[ÃÂÄ]/.test(value)) return value

    try {
        const bytes = Uint8Array.from(Array.from(value), (character) => character.charCodeAt(0))
        return new TextDecoder('utf-8').decode(bytes)
    } catch {
        return value
    }
}

const normalizeGardenResponse = (data: UserGardenResponse): UserGardenResponse => ({
    ...data,
    trees: (data.trees || []).map((tree) => ({
        ...tree,
        plant_name: repairMojibake(tree.plant_name),
        skill_name: repairMojibake(tree.skill_name),
        stage_name: repairMojibake(tree.stage_name),
    })),
})

export const gardenService = {
    async getUserGarden(): Promise<UserGardenResponse> {
        const response = await request<UserGardenResponse>('/user/garden.php');
        return response.data ? normalizeGardenResponse(response.data) : {
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
