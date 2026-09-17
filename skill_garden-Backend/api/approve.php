<?php
// api/approve.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Models\User;
use App\Services\AuthService;

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    Response::error("Method not allowed", 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$userId = $input['userId'] ?? $input['user_id'] ?? $_GET['userId'] ?? null;
$email = $input['email'] ?? $_GET['email'] ?? null;

if (!$userId && !$email) {
    Response::error("Vui lòng cung cấp userId hoặc email cần phê duyệt.", 400);
}

try {
    $userModel = new User();

    if ($userId) {
        $user = $userModel->findById((int) $userId);
    } else {
        $user = $userModel->findByEmail($email);
    }

    if (!$user) {
        Response::error("Không tìm thấy người dùng.", 404);
    }

    $userModel->setApproved((int) $user['id'], true);

    Response::success([
        'userId' => $user['id'],
        'email' => $user['email'],
        'is_approved' => true,
    ], "Tài khoản {$user['email']} đã được phê duyệt thành công!", 200);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}
