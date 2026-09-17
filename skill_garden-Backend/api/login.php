<?php
// api/login.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Services\AuthService;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

try {
    $authService = new AuthService();
    $result = $authService->login($email, $password);
    Response::success($result, "Đăng nhập thành công!", 200);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
