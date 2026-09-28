<?php
// api/superadmin/users.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Middleware\AuthMiddleware;
use App\Helpers\Response;
use App\Services\AdminService;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

AuthMiddleware::requireRole('SUPER_ADMIN');

$adminService = new AdminService();
$method = $_SERVER['REQUEST_METHOD'];

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
