<?php
// src/Services/AuditService.php

namespace App\Services;

use Database;
use PDO;

class AuditService
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function log(int $userId, string $action, ?string $targetType = null, ?int $targetId = null, ?string $details = null, ?string $ipAddress = null): void
    {
        $ip = $ipAddress ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $stmt = $this->db->prepare("
            INSERT INTO audit_logs (user_id, action, target_entity, target_id, details, ip_address)
            VALUES (:user_id, :action, :target_type, :target_id, :details, :ip)
        ");
        $stmt->execute([
            'user_id' => $userId,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'details' => $details,
            'ip' => $ip,
        ]);
    }

    public function getLogs(int $page = 1, int $perPage = 20, ?string $action = null, ?int $userId = null): array
    {
        $page = max(1, $page);
        $perPage = max(1, min(100, $perPage));
        $offset = ($page - 1) * $perPage;

        $where = [];
        $params = [];

        if ($action) {
            $where[] = "l.action = :action";
            $params['action'] = $action;
        }
        if ($userId) {
            $where[] = "l.user_id = :user_id";
            $params['user_id'] = $userId;
        }

        $whereSql = !empty($where) ? "WHERE " . implode(' AND ', $where) : "";

        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM audit_logs l {$whereSql}");
        $countStmt->execute($params);
        $totalItems = (int) $countStmt->fetchColumn();

        $sql = "
            SELECT l.*, u.username, u.full_name, u.role
            FROM audit_logs l
            LEFT JOIN users u ON l.user_id = u.id
            {$whereSql}
            ORDER BY l.created_at DESC
            LIMIT {$perPage} OFFSET {$offset}
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'items' => $items,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_items' => $totalItems,
                'total_pages' => (int) ceil($totalItems / $perPage),
            ]
        ];
    }
}
