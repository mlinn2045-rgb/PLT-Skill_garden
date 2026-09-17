<?php
// src/Middleware/AuthMiddleware.php

namespace App\Middleware;

use App\Helpers\JWT;
use App\Helpers\Response;
use App\Models\User;
use Database;
use PDO;

class AuthMiddleware
{
    private static ?array $cachedUser = null;

    /**
     * Authenticate request via JWT Cookie or Authorization Bearer header.
     * Exits with 401 if unauthenticated.
     */
    public static function authenticate(): array
    {
        if (self::$cachedUser !== null) {
            return self::$cachedUser;
        }

        $config = require __DIR__ . '/../../config/config.php';
        $token = $_COOKIE[$config['jwt']['cookie_name'] ?? 'skill_garden_token'] ?? null;

        if (!$token) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
            if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            Response::error("Vui lòng đăng nhập để thực hiện thao tác này.", 401);
        }

        $jwtConfig = $config['jwt'];
        $payload = JWT::decode($token, $jwtConfig['secret']);

        if (!$payload || !isset($payload['sub'])) {
            Response::error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.", 401);
        }

        $userModel = new User();
        $tokenHash = JWT::getHash($token);
        if ($userModel->isTokenBlacklisted($tokenHash)) {
            Response::error("Phiên đăng nhập đã bị vô hiệu hóa.", 401);
        }

        $user = $userModel->findByUuid($payload['sub']);
        if (!$user) {
            Response::error("Tài khoản người dùng không tồn tại.", 401);
        }

        if ($user['status'] !== 'ACTIVE') {
            Response::error("Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.", 403);
        }

        if ((int) $user['is_approved'] !== 1) {
            Response::error("Tài khoản của bạn đang chờ quản trị viên phê duyệt.", 403);
        }

        // Fetch permissions if ADMIN
        $permissions = [];
        if ($user['role'] === 'ADMIN') {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT permission_key FROM admin_permissions WHERE admin_id = :admin_id");
            $stmt->execute(['admin_id' => $user['id']]);
            $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }

        $user['permissions'] = $permissions;
        self::$cachedUser = $user;

        return self::$cachedUser;
    }

    /**
     * Require one or more roles (e.g. 'ADMIN', 'SUPER_ADMIN')
     */
    public static function requireRole(string|array $roles): array
    {
        $user = self::authenticate();
        $allowedRoles = is_array($roles) ? $roles : [$roles];

        if (!in_array($user['role'], $allowedRoles, true)) {
            Response::error("Bạn không có quyền thực hiện thao tác này.", 403);
        }

        return $user;
    }

    /**
     * Require a specific permission for ADMIN role (SUPER_ADMIN gets bypass)
     */
    public static function requirePermission(string $permissionKey): array
    {
        $user = self::authenticate();

        if ($user['role'] === 'SUPER_ADMIN') {
            return $user;
        }

        if ($user['role'] !== 'ADMIN') {
            Response::error("Chỉ quản trị viên mới có quyền truy cập.", 403);
        }

        $permissions = $user['permissions'] ?? [];
        if (!in_array($permissionKey, $permissions, true)) {
            Response::error("Tài khoản Admin của bạn chưa được cấp quyền '{$permissionKey}'.", 403);
        }

        return $user;
    }

    public static function getCurrentUser(): ?array
    {
        return self::$cachedUser;
    }
}
