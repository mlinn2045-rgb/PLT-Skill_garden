<?php
// api/logout.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Services\AuthService;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

try {
    $authService = new AuthService();
    $authService->logout();
    Response::success([], "Đăng xuất thành công!", 200);
} catch (Exception $e) {
    Response::error($e->getMessage(), 400);
}
