<?php
// api/superadmin/users.php

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
        $search = $_GET['search'] ?? null;
        $status = $_GET['status'] ?? null;
        $admins = $adminService->getAdmins($search, $status);
        Response::success($admins, "Lấy danh sách Admin thành công.");
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if ($method === 'POST') {
        $admin = $adminService->createAdmin($body);
        Response::success($admin, "Tạo tài khoản Admin mới thành công.", 201);
    }

    if ($method === 'PUT') {
        $adminId = (int) ($_GET['id'] ?? $body['id'] ?? 0);
        if ($adminId <= 0) {
            Response::error("ID Admin không hợp lệ.", 400);
        }
        $updated = $adminService->updateAdmin($adminId, $body);
        Response::success(['updated' => $updated], "Cập nhật tài khoản Admin thành công.");
    }

    if ($method === 'DELETE') {
        $adminId = (int) ($_GET['id'] ?? 0);
        if ($adminId <= 0) {
            Response::error("ID Admin không hợp lệ.", 400);
        }
        $deleted = $adminService->deleteAdmin($adminId);
        Response::success(['deleted' => $deleted], "Đã xóa tài khoản Admin.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
