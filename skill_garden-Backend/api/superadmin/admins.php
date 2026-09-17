<?php
// api/superadmin/admins.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\AdminService;

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

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $newAdmin = $adminService->createAdmin($data);
        Response::success($newAdmin, "Tạo tài khoản Admin thành công!", 201);
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $adminId = (int) ($data['admin_id'] ?? $data['id'] ?? 0);

        if ($adminId <= 0) {
            Response::error("ID Admin không hợp lệ.", 400);
        }

        $adminService->updateAdmin($adminId, $data);
        Response::success(null, "Cập nhật tài khoản Admin thành công!");
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $adminId = (int) ($data['admin_id'] ?? $_GET['id'] ?? 0);

        if ($adminId <= 0) {
            Response::error("ID Admin không hợp lệ.", 400);
        }

        $adminService->deleteAdmin($adminId);
        Response::success(null, "Xóa tài khoản Admin thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
