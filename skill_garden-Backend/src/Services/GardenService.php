<?php
// src/Services/GardenService.php

namespace App\Services;

use App\Models\Garden;
use Database;
use PDO;

class GardenService
{
    private Garden $gardenModel;
    private PDO $db;

    public function __construct(?Garden $gardenModel = null, ?PDO $db = null)
    {
        $this->gardenModel = $gardenModel ?? new Garden();
        $this->db = $db ?? Database::getConnection();
    }

    public function getUserGarden(int $userId): array
    {
        $trees = $this->gardenModel->getUserGardenTrees($userId);

        // Fetch user stats
        $stmt = $this->db->prepare("SELECT level, total_xp, streak_days FROM users WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Calculate garden totals
        $totalTrees = count($trees);
        $matureTrees = 0;
        foreach ($trees as $tree) {
            if ($tree['status'] === 'MATURE') {
                $matureTrees++;
            }
        }

        return [
            'stats' => [
                'level' => (int) ($stats['level'] ?? 1),
                'total_xp' => (int) ($stats['total_xp'] ?? 0),
                'streak_days' => (int) ($stats['streak_days'] ?? 0),
                'total_trees' => $totalTrees,
                'mature_trees' => $matureTrees,
            ],
            'trees' => $trees,
        ];
    }

    public function waterTree(int $userId, int $skillId): array
    {
        $xpService = new XPService($this->db);
        $result = $xpService->awardXP($userId, 10, 'WATERING', 'Tưới nước chăm sóc mầm cây');

        // Increase tree accumulated XP
        $stmt = $this->db->prepare("
            UPDATE user_garden_trees 
            SET xp_accumulated = xp_accumulated + 10, updated_at = NOW() 
            WHERE user_id = :user_id AND skill_id = :skill_id
        ");
        $stmt->execute(['user_id' => $userId, 'skill_id' => $skillId]);

        return array_merge($result, [
            'message' => 'Đã tưới nước thành công! (+10 XP)'
        ]);
    }

    public function plantSeed(int $userId, int $skillId, int $plantId): array
    {
        // Get initial stage
        $stageStmt = $this->db->prepare("
            SELECT id FROM plant_stages WHERE plant_id = :plant_id ORDER BY stage_level ASC LIMIT 1
        ");
        $stageStmt->execute(['plant_id' => $plantId]);
        $stageId = (int) $stageStmt->fetchColumn();

        $stmt = $this->db->prepare("
            INSERT INTO user_garden_trees (user_id, skill_id, plant_id, current_stage_id, level, status)
            VALUES (:user_id, :skill_id, :plant_id, :stage_id, 1, 'GROWING')
            ON DUPLICATE KEY UPDATE 
                plant_id = VALUES(plant_id),
                updated_at = NOW()
        ");
        $stmt->execute([
            'user_id' => $userId,
            'skill_id' => $skillId,
            'plant_id' => $plantId,
            'stage_id' => $stageId > 0 ? $stageId : null,
        ]);

        return ['message' => 'Đã bắt đầu trồng cây kỹ năng mới thành công!'];
    }
}
