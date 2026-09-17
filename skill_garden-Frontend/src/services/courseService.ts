// skill_garden-Frontend/src/services/courseService.ts

import { request } from './apiClient';

export interface SkillItem {
    id: number;
    title: string;
    code: string;
    slug: string;
    description: string;
    category?: string;
    level?: string;
    total_lessons?: number;
    icon_url?: string;
    plant_name?: string;
}

export interface LeaderboardUser {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
    total_xp: number;
    level: number;
    streak_days: number;
    rank: number;
}

export interface AchievementItem {
    id: number;
    code: string;
    title: string;
    description: string;
    badge_icon_url?: string;
    xp_reward: number;
    unlocked?: boolean;
    unlocked_at?: string;
}

export const courseService = {
    async getSkills(category?: string): Promise<SkillItem[]> {
        const url = category ? `/skills.php?category=${encodeURIComponent(category)}` : '/skills.php';
        const response = await request<SkillItem[]>(url);
        return response.data || [];
    },

    async getLeaderboard(): Promise<LeaderboardUser[]> {
        const response = await request<LeaderboardUser[]>('/leaderboard.php');
        return response.data || [];
    },

    async getAchievements(): Promise<AchievementItem[]> {
        const response = await request<AchievementItem[]>('/achievements.php');
        return response.data || [];
    }
};
