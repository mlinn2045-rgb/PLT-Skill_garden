<?php
// api/superadmin/permissions.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Helpers\JWT;
use App\Services\AdminService;

$adminService = new AdminService();
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
    Response::error("Chỉ Super Admin mới có quyền truy cập endpoint này.", 403);
}

try {
    if ($method === 'GET') {
        $adminId = (int) ($_GET['admin_id'] ?? 0);
        if ($adminId <= 0) {
            Response::error("Admin ID không hợp lệ.", 400);
        }
        $perms = $adminService->getAdminPermissions($adminId);
        Response::success(['admin_id' => $adminId, 'permissions' => $perms], "Lấy quyền Admin thành công.");
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if ($method === 'POST' || $method === 'PUT') {
        $adminId = (int) ($body['admin_id'] ?? $_GET['admin_id'] ?? 0);
        $permissions = $body['permissions'] ?? [];

        if ($adminId <= 0 || !is_array($permissions)) {
            Response::error("Thông tin phân quyền không hợp lệ.", 400);
        }

        $adminService->setAdminPermissions($adminId, $permissions);
        Response::success(['admin_id' => $adminId, 'permissions' => $permissions], "Cập nhật ma trận phân quyền thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
