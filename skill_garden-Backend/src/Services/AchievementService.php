<?php
// src/Services/AchievementService.php

namespace App\Services;

use App\Models\Achievement;
use Database;
use Exception;
use PDO;

class AchievementService
{
    private Achievement $achievementModel;
    private PDO $db;

    public function __construct(?PDO $db = null, ?Achievement $achievementModel = null)
    {
        $this->db = $db ?? Database::getConnection();
        $this->achievementModel = $achievementModel ?? new Achievement($this->db);
    }

    public function getAchievements(?int $userId = null): array
    {
        if ($userId) {
            return $this->achievementModel->getUserAchievements($userId);
        }

        return $this->achievementModel->findAll([], 'id ASC');
    }

    public function createAchievement(array $data): array
    {
        $title = trim($data['title'] ?? '');
        $code = strtoupper(trim($data['code'] ?? ''));

        if (empty($title) || empty($code)) {
            throw new Exception("Tiêu đề và mã thành tích là bắt buộc.", 400);
        }

        return $this->achievementModel->create([
            'title' => $title,
            'code' => $code,
            'description' => $data['description'] ?? null,
            'badge_icon' => $data['badge_icon'] ?? null,
            'condition_type' => $data['condition_type'] ?? 'LESSON_COUNT',
            'condition_value' => (int) ($data['condition_value'] ?? 1),
            'xp_reward' => (int) ($data['xp_reward'] ?? 100),
        ]);
    }

    public function updateAchievement(int $id, array $data): bool
    {
        $achievement = $this->achievementModel->findById($id);
        if (!$achievement) {
            throw new Exception("Không tìm thấy thành tích.", 404);
        }

        $fields = ['title', 'code', 'description', 'badge_icon', 'condition_type', 'condition_value', 'xp_reward'];
        $update = [];
        foreach ($fields as $f) {
            if (isset($data[$f]))
                $update[$f] = $data[$f];
        }

        return $this->achievementModel->update($id, $update);
    }

    public function deleteAchievement(int $id): bool
    {
        $achievement = $this->achievementModel->findById($id);
        if (!$achievement) {
            throw new Exception("Không tìm thấy thành tích.", 404);
        }
        return $this->achievementModel->delete($id);
    }

    public function checkAndAwardAchievements(int $userId): array
    {
        $achievements = $this->achievementModel->findAll();
        $unlockedNew = [];

        // Fetch user stats
        $uStmt = $this->db->prepare("SELECT total_xp, level, streak_days FROM users WHERE id = :id");
        $uStmt->execute(['id' => $userId]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);

        // Fetch user lesson completed count
        $lStmt = $this->db->prepare("SELECT COUNT(*) FROM user_lessons WHERE user_id = :id AND is_completed = 1");
        $lStmt->execute(['id' => $userId]);
        $completedLessons = (int) $lStmt->fetchColumn();

        // Fetch user passed quiz count
        $qStmt = $this->db->prepare("SELECT COUNT(*) FROM user_quiz_attempts WHERE user_id = :id AND passed = 1");
        $qStmt->execute(['id' => $userId]);
        $passedQuizzes = (int) $qStmt->fetchColumn();

        foreach ($achievements as $ach) {
            $achId = (int) $ach['id'];

            // Check if already unlocked
            $checkStmt = $this->db->prepare("SELECT id FROM user_achievements WHERE user_id = :u_id AND achievement_id = :a_id");
            $checkStmt->execute(['u_id' => $userId, 'a_id' => $achId]);
            if ($checkStmt->fetchColumn()) {
                continue; // Already unlocked
            }

            $type = $ach['condition_type'];
            $reqValue = (int) $ach['condition_value'];
            $unlocked = false;

            if ($type === 'LESSON_COUNT' && $completedLessons >= $reqValue)
                $unlocked = true;
            if ($type === 'QUIZ_COUNT' && $passedQuizzes >= $reqValue)
                $unlocked = true;
            if ($type === 'LEVEL' && (int) $user['level'] >= $reqValue)
                $unlocked = true;
            if ($type === 'STREAK' && (int) $user['streak_days'] >= $reqValue)
                $unlocked = true;

            if ($unlocked) {
                $insStmt = $this->db->prepare("INSERT INTO user_achievements (user_id, achievement_id) VALUES (:u_id, :a_id)");
                $insStmt->execute(['u_id' => $userId, 'a_id' => $achId]);
                $unlockedNew[] = $ach;
            }
        }

        return $unlockedNew;
    }
}
