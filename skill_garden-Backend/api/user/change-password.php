<?php
// api/user/change-password.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Models\User;

$user = AuthMiddleware::authenticate();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $currentPassword = $data['current_password'] ?? '';
        $newPassword = $data['new_password'] ?? '';

        if (empty($currentPassword) || empty($newPassword)) {
            Response::error("Mật khẩu hiện tại và mật khẩu mới là bắt buộc.", 400);
        }

        if (strlen($newPassword) < 6) {
            Response::error("Mật khẩu mới phải có ít nhất 6 ký tự.", 400);
        }

        $userModel = new User();
        $fullUser = $userModel->findById($user['id']);

        if (!password_verify($currentPassword, $fullUser['password_hash'])) {
            Response::error("Mật khẩu hiện tại không chính xác.", 400);
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 10]);
        $userModel->update($user['id'], ['password_hash' => $newHash]);

        Response::success(null, "Đổi mật khẩu thành công!");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
