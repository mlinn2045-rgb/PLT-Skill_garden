<?php
// src/Services/XPService.php

namespace App\Services;

use Database;
use PDO;

class XPService
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function awardXP(int $userId, int $amount, string $source = 'GENERAL', ?string $description = null): array
    {
        if ($amount <= 0) {
            return ['awarded' => 0, 'level_up' => false];
        }

        // Add XP to user
        $stmt = $this->db->prepare("UPDATE users SET total_xp = total_xp + :amount WHERE id = :id");
        $stmt->execute(['amount' => $amount, 'id' => $userId]);

        // Check for level up
        $levelUpData = $this->checkLevelUp($userId);

        // Check achievements unlock
        $achieveService = new AchievementService($this->db);
        $achieveService->checkAndAwardAchievements($userId);

        return [
            'awarded' => $amount,
            'new_total_xp' => $levelUpData['total_xp'],
            'current_level' => $levelUpData['current_level'],
            'level_up' => $levelUpData['leveled_up'],
        ];
    }

    public function checkLevelUp(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT level, total_xp FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['current_level' => 1, 'total_xp' => 0, 'leveled_up' => false];
        }

        $currentLevel = (int) $user['level'];
        $totalXp = (int) $user['total_xp'];

        // Formula: XP required for Level N = (N - 1) * 200 XP
        // Level 1: 0-199 XP, Level 2: 200 XP, Level 3: 400 XP, Level 4: 600 XP...
        $newLevel = max(1, (int) floor($totalXp / 200) + 1);

        $leveledUp = false;
        if ($newLevel > $currentLevel) {
            $updateStmt = $this->db->prepare("UPDATE users SET level = :level WHERE id = :id");
            $updateStmt->execute(['level' => $newLevel, 'id' => $userId]);
            $leveledUp = true;
        }

        return [
            'current_level' => $newLevel,
            'total_xp' => $totalXp,
            'leveled_up' => $leveledUp,
        ];
    }

    public function updateSkillProgress(int $userId, int $skillId): float
    {
        // 1. Calculate total lessons in skill
        $totalStmt = $this->db->prepare("
            SELECT COUNT(l.id) 
            FROM lessons l
            JOIN modules m ON l.module_id = m.id
            JOIN learning_paths lp ON m.learning_path_id = lp.id
            WHERE lp.skill_id = :skill_id AND l.is_published = 1
        ");
        $totalStmt->execute(['skill_id' => $skillId]);
        $totalLessons = (int) $totalStmt->fetchColumn();

        if ($totalLessons === 0) {
            return 0.0;
        }

        // 2. Calculate completed lessons by user in skill
        $completedStmt = $this->db->prepare("
            SELECT COUNT(ul.id) 
            FROM user_lessons ul
            JOIN lessons l ON ul.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            JOIN learning_paths lp ON m.learning_path_id = lp.id
            WHERE lp.skill_id = :skill_id AND ul.user_id = :user_id AND ul.is_completed = 1
        ");
        $completedStmt->execute(['skill_id' => $skillId, 'user_id' => $userId]);
        $completedLessons = (int) $completedStmt->fetchColumn();

        $progressPercent = round(($completedLessons / $totalLessons) * 100, 1);
        $status = ($progressPercent >= 100.0) ? 'COMPLETED' : 'IN_PROGRESS';

        // Update user_skills record
        $stmt = $this->db->prepare("
            INSERT INTO user_skills (user_id, skill_id, progress_percent, status, completed_at)
            VALUES (:user_id, :skill_id, :progress, :status, IF(:status = 'COMPLETED', NOW(), NULL))
            ON DUPLICATE KEY UPDATE 
                progress_percent = VALUES(progress_percent),
                status = VALUES(status),
                completed_at = IF(VALUES(status) = 'COMPLETED' AND completed_at IS NULL, NOW(), completed_at)
        ");
        $stmt->execute([
            'user_id' => $userId,
            'skill_id' => $skillId,
            'progress' => $progressPercent,
            'status' => $status
        ]);

        // 3. Update Digital Garden Tree growth
        $this->updateTreeGrowth($userId, $skillId, $progressPercent);

        return $progressPercent;
    }

    public function updateTreeGrowth(int $userId, int $skillId, float $progressPercent): void
    {
        // Find plant_id for this skill
        $skillStmt = $this->db->prepare("SELECT plant_id FROM skills WHERE id = :skill_id LIMIT 1");
        $skillStmt->execute(['skill_id' => $skillId]);
        $plantId = (int) $skillStmt->fetchColumn();

        if ($plantId <= 0) {
            return;
        }

        // Find stage matching progress percent
        $stageStmt = $this->db->prepare("
            SELECT id, stage_level 
            FROM plant_stages 
            WHERE plant_id = :plant_id AND required_progress_percent <= :progress 
            ORDER BY required_progress_percent DESC 
            LIMIT 1
        ");
        $stageStmt->execute(['plant_id' => $plantId, 'progress' => $progressPercent]);
        $stage = $stageStmt->fetch(PDO::FETCH_ASSOC);

        $stageId = $stage ? (int) $stage['id'] : null;
        $treeLevel = $stage ? (int) $stage['stage_level'] : 1;
        $status = ($progressPercent >= 100.0) ? 'MATURE' : 'GROWING';

        $stmt = $this->db->prepare("
            INSERT INTO user_garden_trees (user_id, skill_id, plant_id, current_stage_id, level, status)
            VALUES (:user_id, :skill_id, :plant_id, :stage_id, :level, :status)
            ON DUPLICATE KEY UPDATE 
                current_stage_id = VALUES(current_stage_id),
                level = VALUES(level),
                status = VALUES(status)
        ");
        $stmt->execute([
            'user_id' => $userId,
            'skill_id' => $skillId,
            'plant_id' => $plantId,
            'stage_id' => $stageId,
            'level' => $treeLevel,
            'status' => $status
        ]);
    }
}
