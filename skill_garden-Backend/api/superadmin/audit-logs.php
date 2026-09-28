<?php
// api/superadmin/audit-logs.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Middleware\AuthMiddleware;
use App\Helpers\Response;
use App\Services\AuditService;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

AuthMiddleware::requireRole('SUPER_ADMIN');

$auditService = new AuditService();
$method = $_SERVER['REQUEST_METHOD'];

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
