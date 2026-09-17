<?php
// api/superadmin/audit-logs.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Helpers\JWT;
use App\Services\AuditService;

$auditService = new AuditService();
$method = $_SERVER['REQUEST_METHOD'];

$config = require __DIR__ . '/../../config/config.php';
$token = $_COOKIE[$config['jwt']['cookie_name'] ?? 'skill_garden_token'] ?? null;
$userRole = 'GUEST';

if ($token) {
    $payload = JWT::decode($token, $config['jwt']['secret']);
    if ($payload && isset($payload['role'])) {
        $userRole = $payload['role'];
    }
}

if ($userRole !== 'SUPER_ADMIN') {
    Response::error("Chỉ Super Admin mới có quyền xem Audit Logs.", 403);
}

try {
    if ($method === 'GET') {
        $page = (int) ($_GET['page'] ?? 1);
        $perPage = (int) ($_GET['per_page'] ?? 20);
        $action = $_GET['action'] ?? null;
        $userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : null;

        $logs = $auditService->getLogs($page, $perPage, $action, $userId);
        Response::success($logs, "Lấy danh sách Audit Logs thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
