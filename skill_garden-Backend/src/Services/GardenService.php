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

    public function plantSeed(int $userId, int $skillId, int $plantId = 0, ?string $treeName = null): array
    {
        if ($plantId <= 0) {
            $skillStmt = $this->db->prepare("SELECT plant_id FROM skills WHERE id = :skill_id");
            $skillStmt->execute(['skill_id' => $skillId]);
            $resolvedPlantId = (int) $skillStmt->fetchColumn();
            $plantId = $resolvedPlantId > 0 ? $resolvedPlantId : 1;
        }

        // Get initial stage
        $stageStmt = $this->db->prepare("
            SELECT id FROM plant_stages WHERE plant_id = :plant_id ORDER BY stage_level ASC LIMIT 1
        ");
        $stageStmt->execute(['plant_id' => $plantId]);
        $stageId = (int) $stageStmt->fetchColumn();

        $stmt = $this->db->prepare("
            INSERT INTO user_garden_trees (user_id, skill_id, plant_id, current_stage_id, tree_name, level, status)
            VALUES (:user_id, :skill_id, :plant_id, :stage_id, :tree_name, 1, 'GROWING')
            ON DUPLICATE KEY UPDATE 
                plant_id = VALUES(plant_id),
                tree_name = COALESCE(VALUES(tree_name), user_garden_trees.tree_name),
                current_stage_id = COALESCE(user_garden_trees.current_stage_id, VALUES(current_stage_id)),
                updated_at = NOW()
        ");
        $stmt->execute([
            'user_id' => $userId,
            'skill_id' => $skillId,
            'plant_id' => $plantId,
            'stage_id' => $stageId > 0 ? $stageId : null,
            'tree_name' => $treeName,
        ]);

        return ['message' => 'Đã bắt đầu trồng cây kỹ năng mới thành công!'];
    }

    public function addGrowth(int $userId, int $skillId, float $growthPercent, int $xpAmount): array
    {
        $xpResult = [];
        if ($xpAmount > 0) {
            $xpService = new XPService($this->db);
            $xpResult = $xpService->awardXP($userId, $xpAmount, 'QUIZ_REWARD', "Thưởng Quiz (+{$xpAmount} XP, +{$growthPercent}% sinh trưởng)");
        }

        if ($growthPercent > 0 || $xpAmount > 0) {
            // Update user_skills progress_percent
            $uSkillStmt = $this->db->prepare("
                UPDATE user_skills 
                SET progress_percent = LEAST(100.0, progress_percent + :growth)
                WHERE user_id = :user_id AND skill_id = :skill_id
            ");
            $uSkillStmt->execute([
                'growth' => $growthPercent,
                'user_id' => $userId,
                'skill_id' => $skillId
            ]);

            // Update user_garden_trees
            $treeStmt = $this->db->prepare("
                UPDATE user_garden_trees 
                SET xp_accumulated = xp_accumulated + :xp,
                    updated_at = NOW()
                WHERE user_id = :user_id AND skill_id = :skill_id
            ");
            $treeStmt->execute([
                'xp' => $xpAmount,
                'user_id' => $userId,
                'skill_id' => $skillId
            ]);
        }

        return [
            'xp_awarded' => $xpAmount,
            'growth_percent' => $growthPercent,
            'xp_result' => $xpResult
        ];
    }
}
