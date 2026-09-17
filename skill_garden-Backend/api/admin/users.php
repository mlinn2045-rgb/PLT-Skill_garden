<?php
// api/admin/users.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\UserService;

AuthMiddleware::requireRole(['ADMIN', 'SUPER_ADMIN']);

$userService = new UserService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $userId = isset($_GET['id']) ? (int) $_GET['id'] : null;
        if ($userId) {
            $user = $userService->getUserDetail($userId);
            Response::success($user, "Lấy thông tin người dùng thành công.");
        }

        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int) $_GET['per_page'] : 10;
        $search = $_GET['search'] ?? null;
        $role = $_GET['role'] ?? null;
        $status = $_GET['status'] ?? null;

        $result = $userService->getUsers($page, $perPage, $search, $role, $status);
        Response::success($result, "Lấy danh sách người dùng thành công.");
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $data['action'] ?? '';
        $userId = (int) ($data['user_id'] ?? 0);
        $reason = trim($data['reason'] ?? '');

        if ($userId <= 0) {
            Response::error("ID người dùng không hợp lệ.", 400);
        }

        if ($action === 'approve') {
            $userService->approveUser($userId, true, $reason);
            Response::success(null, "Đã phê duyệt tài khoản học viên thành công!");
        }

        if ($action === 'reject') {
            $userService->approveUser($userId, false, $reason);
            Response::success(null, "Đã từ chối tài khoản học viên!");
        }

        if ($action === 'lock') {
            $userService->lockUser($userId, 'lock', $reason);
            Response::success(null, "Đã khóa tài khoản người dùng!");
        }

        if ($action === 'unlock') {
            $userService->lockUser($userId, 'unlock');
            Response::success(null, "Đã mở khóa tài khoản người dùng!");
        }

        Response::error("Hành động không hợp lệ.", 400);
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $userId = (int) ($data['user_id'] ?? $_GET['id'] ?? 0);

        if ($userId <= 0) {
            Response::error("ID người dùng không hợp lệ.", 400);
        }

        $userService->deleteUser($userId);
        Response::success(null, "Đã xóa tài khoản người dùng.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
