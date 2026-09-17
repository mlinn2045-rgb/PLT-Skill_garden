<?php
// api/me.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Services\AuthService;

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error("Method not allowed", 405);
}

try {
    $authService = new AuthService();
    $user = $authService->getAuthenticatedUser();

    if (!$user) {
        Response::error("Chưa xác thực hoặc phiên đăng nhập đã hết hạn.", 401);
    }

    Response::success($user, "Lấy thông tin người dùng thành công", 200);
} catch (Exception $e) {
    Response::error($e->getMessage(), 401);
}
