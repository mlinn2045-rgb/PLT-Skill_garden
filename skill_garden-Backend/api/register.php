<?php
// api/register.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Services\AuthService;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$fullName = $input['fullName'] ?? $input['full_name'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

try {
    $authService = new AuthService();
    $userData = $authService->register($fullName, $email, $password);
    Response::success($userData, "Đăng ký tài khoản thành công! Vui lòng chờ quản trị viên duyệt tài khoản.", 201);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
