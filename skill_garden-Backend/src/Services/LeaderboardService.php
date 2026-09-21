<?php
// src/Services/LeaderboardService.php

namespace App\Services;

use Database;
use PDO;

class LeaderboardService
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public static function calculateLevel(int $xp): int
    {
        if ($xp < 1000)
            return 1;
        if ($xp < 2000)
            return 2;
        if ($xp < 3000)
            return 3;
        if ($xp < 4000)
            return 4;
        if ($xp < 5000)
            return 5;
        if ($xp < 7000)
            return 6;
        if ($xp < 9000)
            return 7;
        if ($xp < 11000)
            return 8;
        if ($xp < 13000)
            return 9;
        return 10;
    }

    public function getLeaderboard(int $limit = 50, ?int $currentUserId = null): array
    {
        $sql = "
            SELECT 
                u.id, u.uuid, u.username, u.full_name, u.tag_id, u.avatar, 
                u.level, u.total_xp, u.streak_days,
                (SELECT COUNT(*) FROM user_garden_trees ugt WHERE ugt.user_id = u.id AND ugt.status = 'MATURE') as mature_trees_count
            FROM users u
            WHERE u.role = 'USER' AND u.status = 'ACTIVE'
            ORDER BY u.level DESC, u.total_xp DESC, u.streak_days DESC
            LIMIT :limit
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $rankings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $currentUserRank = null;
        foreach ($rankings as $index => &$rankUser) {
            $xp = (int) ($rankUser['total_xp'] ?? 0);
            $rankUser['level'] = self::calculateLevel($xp);
            $rankUser['rank'] = $index + 1;
            if ($currentUserId && (int) $rankUser['id'] === $currentUserId) {
                $currentUserRank = $rankUser;
            }
        }

        // If current user is not in top N, calculate their rank
        if ($currentUserId && !$currentUserRank) {
            $uStmt = $this->db->prepare("SELECT id, uuid, username, full_name, tag_id, avatar, level, total_xp, streak_days FROM users WHERE id = :id");
            $uStmt->execute(['id' => $currentUserId]);
            $currentUserRank = $uStmt->fetch(PDO::FETCH_ASSOC);

            if ($currentUserRank) {
                $rankStmt = $this->db->prepare("SELECT COUNT(*) + 1 FROM users WHERE role = 'USER' AND status = 'ACTIVE' AND total_xp > :xp");
                $rankStmt->execute(['xp' => $currentUserRank['total_xp']]);
                $currentUserRank['rank'] = (int) $rankStmt->fetchColumn();
            }
        }

        return [
            'rankings' => $rankings,
            'current_user_rank' => $currentUserRank,
        ];
    }
}
