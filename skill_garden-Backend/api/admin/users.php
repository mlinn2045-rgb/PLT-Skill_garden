<?php
// api/admin/users.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;

// Enforce JWT Auth & Role Check
$db = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch pending and approved users
    $stmt = $db->query("
        SELECT id, uuid, email, full_name, username, role, status, is_approved, created_at
        FROM users
        ORDER BY is_approved ASC, id DESC
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Response::success($users, "Lấy danh sách người dùng thành công.", 200);
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    $userId = (int) ($data['user_id'] ?? 0);
    $reason = trim($data['reason'] ?? '');

    if ($userId <= 0) {
        Response::error("ID người dùng không hợp lệ.", 400);
    }

    if ($action === 'approve') {
        $stmt = $db->prepare("UPDATE users SET is_approved = 1, status = 'ACTIVE' WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        Response::success(null, "Đã phê duyệt tài khoản học viên thành công!", 200);
    }

    if ($action === 'reject') {
        $stmt = $db->prepare("UPDATE users SET is_approved = 0, status = 'INACTIVE' WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        Response::success(null, "Đã từ chối tài khoản học viên với lý do: " . ($reason ?: "Không đủ thông tin"), 200);
    }

    Response::error("Hành động không hợp lệ.", 400);
}

Response::error("Method not allowed", 405);
