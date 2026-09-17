<?php
// src/Models/Achievement.php

namespace App\Models;

class Achievement extends BaseModel
{
    protected string $table = 'achievements';

    public function getUserAchievements(int $userId): array
    {
        $sql = "
            SELECT 
                a.*,
                (ua.id IS NOT NULL) as is_unlocked,
                ua.unlocked_at
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = :user_id
            ORDER BY a.id ASC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
