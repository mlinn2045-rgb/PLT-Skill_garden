<?php
// api/forgot-password.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Models\User;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$email = $input['email'] ?? '';

if (empty($email) || !Validator::isEmail($email)) {
    Response::error("Vui lòng nhập địa chỉ email hợp lệ.", 400);
}

try {
    $userModel = new User();
    $user = $userModel->findByEmail($email);

    // For security reasons, don't leak whether email exists or not
    Response::success([
        'email' => $email,
        'sent' => true
    ], "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi tới hộp thư của bạn.", 200);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}
