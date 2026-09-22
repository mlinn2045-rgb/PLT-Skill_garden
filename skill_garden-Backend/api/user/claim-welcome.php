<?php
// api/user/claim-welcome.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Services\AuthService;
use App\Models\User;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

try {
    $authService = new AuthService();
    $user = $authService->getAuthenticatedUser();

    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    // If token auth is present, use authenticated user
    $userId = null;
    if ($user && !empty($user['uuid'])) {
        $userModel = new User();
        $dbUser = $userModel->findByUuid($user['uuid']);
        if ($dbUser) {
            $userId = (int) $dbUser['id'];
        }
    }

    // Fallback: If sent with email in body
    if (!$userId && !empty($input['email'])) {
        $userModel = new User();
        $dbUser = $userModel->findByEmail(strtolower(trim($input['email'])));
        if ($dbUser) {
            $userId = (int) $dbUser['id'];
        }
    }

    if (!$userId) {
        Response::error("Vui lòng đăng nhập để nhận phần thưởng chào mừng.", 401);
    }

    $userModel = new User();
    $updatedUser = $userModel->claimWelcomeXp($userId);

    // Record audit log
    try {
        $db = Database::getConnection();
        $stmtAudit = $db->prepare("
            INSERT INTO audit_logs (user_id, action, target_entity, target_id, details, ip_address)
            VALUES (:user_id, 'CLAIM_WELCOME_XP', 'users', :target_id, 'Nhận thưởng 100 XP tân thủ chào mừng', :ip)
        ");
        $stmtAudit->execute([
            'user_id' => $userId,
            'target_id' => $userId,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
        ]);
    } catch (Exception $e) {
        // Log error silently, do not fail transaction
    }

    Response::success([
        'uuid' => $updatedUser['uuid'],
        'email' => $updatedUser['email'],
        'total_xp' => (int) ($updatedUser['total_xp'] ?? 100),
        'has_claimed_welcome_xp' => true,
    ], "Chúc mừng bạn đã nhận thành công 100 XP tân thủ!", 200);

} catch (Exception $e) {
    $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
    Response::error($e->getMessage(), $code);
}
