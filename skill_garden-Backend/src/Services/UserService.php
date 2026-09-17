<?php
// src/Services/UserService.php

namespace App\Services;

use App\Models\User;
use Database;
use Exception;
use PDO;

class UserService
{
    private User $userModel;
    private PDO $db;

    public function __construct(?User $userModel = null, ?PDO $db = null)
    {
        $this->userModel = $userModel ?? new User();
        $this->db = $db ?? Database::getConnection();
    }

    public function getUsers(int $page = 1, int $perPage = 10, ?string $search = null, ?string $role = null, ?string $status = null): array
    {
        $page = max(1, $page);
        $perPage = max(1, min(100, $perPage));
        $offset = ($page - 1) * $perPage;

        $whereClauses = ["role != 'SUPER_ADMIN'"];
        $params = [];

        if (!empty($search)) {
            $whereClauses[] = "(username LIKE :search OR email LIKE :search OR full_name LIKE :search OR tag_id LIKE :search)";
            $params['search'] = "%{$search}%";
        }

        if (!empty($role)) {
            $whereClauses[] = "role = :role";
            $params['role'] = $role;
        }

        if (!empty($status)) {
            $whereClauses[] = "status = :status";
            $params['status'] = $status;
        }

        $whereSql = implode(' AND ', $whereClauses);

        // Count total
        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM users WHERE {$whereSql}");
        $countStmt->execute($params);
        $totalItems = (int) $countStmt->fetchColumn();

        // Fetch items
        $sql = "
            SELECT id, uuid, email, full_name, username, tag_id, avatar, bio, role, status, is_approved, level, total_xp, streak_days, last_active_at, created_at 
            FROM users 
            WHERE {$whereSql}
            ORDER BY id DESC 
            LIMIT {$perPage} OFFSET {$offset}
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'users' => $users,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_items' => $totalItems,
                'total_pages' => (int) ceil($totalItems / $perPage),
            ]
        ];
    }

    public function getUserDetail(int $userId): array
    {
        $user = $this->userModel->findById($userId);
        if (!$user) {
            throw new Exception("Không tìm thấy người dùng.", 404);
        }

        unset($user['password_hash']);

        // Fetch user active skills
        $stmt = $this->db->prepare("
            SELECT us.*, s.title as skill_title, s.slug as skill_slug, s.icon_url, p.name as plant_name
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            LEFT JOIN plants p ON s.plant_id = p.id
            WHERE us.user_id = :user_id
        ");
        $stmt->execute(['user_id' => $userId]);
        $user['skills'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch user achievements count
        $achieveStmt = $this->db->prepare("SELECT COUNT(*) FROM user_achievements WHERE user_id = :user_id");
        $achieveStmt->execute(['user_id' => $userId]);
        $user['achievements_count'] = (int) $achieveStmt->fetchColumn();

        return $user;
    }

    public function lockUser(int $userId, string $action = 'lock', ?string $reason = null): bool
    {
        $user = $this->userModel->findById($userId);
        if (!$user) {
            throw new Exception("Không tìm thấy người dùng.", 404);
        }

        if ($user['role'] === 'SUPER_ADMIN') {
            throw new Exception("Không thể khóa tài khoản Super Admin.", 400);
        }

        $newStatus = ($action === 'lock') ? 'LOCKED' : 'ACTIVE';
        $stmt = $this->db->prepare("UPDATE users SET status = :status WHERE id = :id");
        return $stmt->execute(['status' => $newStatus, 'id' => $userId]);
    }

    public function approveUser(int $userId, bool $approve, ?string $reason = null): bool
    {
        $user = $this->userModel->findById($userId);
        if (!$user) {
            throw new Exception("Không tìm thấy người dùng.", 404);
        }

        $newStatus = $approve ? 'ACTIVE' : 'INACTIVE';
        $stmt = $this->db->prepare("UPDATE users SET is_approved = :is_approved, status = :status WHERE id = :id");
        return $stmt->execute([
            'is_approved' => $approve ? 1 : 0,
            'status' => $newStatus,
            'id' => $userId
        ]);
    }

    public function deleteUser(int $userId): bool
    {
        $user = $this->userModel->findById($userId);
        if (!$user) {
            throw new Exception("Không tìm thấy người dùng.", 404);
        }

        if ($user['role'] === 'SUPER_ADMIN') {
            throw new Exception("Không thể xóa tài khoản Super Admin.", 400);
        }

        return $this->userModel->delete($userId);
    }
}
