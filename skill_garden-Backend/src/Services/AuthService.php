<?php
// src/Services/AuthService.php

namespace App\Services;

use App\Helpers\JWT;
use App\Helpers\Validator;
use App\Models\User;
use Exception;

class AuthService
{
    private User $userModel;
    private array $config;

    public function __construct(?User $userModel = null, ?array $config = null)
    {
        $this->userModel = $userModel ?? new User();
        $this->config = $config ?? (require __DIR__ . '/../../config/config.php');
    }

    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    public function register(string $fullName, string $email, string $password): array
    {
        $fullName = trim($fullName);
        $email = strtolower(trim($email));

        if (empty($fullName) || empty($email) || empty($password)) {
            throw new Exception("Vui lòng điền đầy đủ các trường bắt buộc.", 400);
        }

        if (!Validator::isEmail($email)) {
            throw new Exception("Địa chỉ email không hợp lệ.", 400);
        }

        // Validate Password Policy
        $policyCheck = PasswordPolicyService::validate($password);
        if (!$policyCheck['isValid']) {
            $e = new Exception("Mật khẩu không đáp ứng chính sách bảo mật.", 400);
            (new \ReflectionProperty($e, 'message'));
            throw new Exception(implode(" ", $policyCheck['errors']), 400);
        }

        // Check if user exists
        if ($this->userModel->findByEmail($email)) {
            throw new Exception("Email này đã được sử dụng.", 409);
        }

        // Create User record
        $uuid = $this->generateUuidV4();
        $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

        $user = $this->userModel->create([
            'uuid' => $uuid,
            'email' => $email,
            'full_name' => $fullName,
            'password_hash' => $passwordHash,
            'role' => 'USER',
            'is_approved' => 0, // Requires Admin Approval by default
        ]);

        return [
            'uuid' => $user['uuid'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'is_approved' => (bool) $user['is_approved'],
            'created_at' => $user['created_at'],
        ];
    }

    public function login(string $email, string $password): array
    {
        $email = strtolower(trim($email));

        if (empty($email) || empty($password)) {
            throw new Exception("Vui lòng nhập đầy đủ email và mật khẩu.", 400);
        }

        $user = $this->userModel->findByEmail($email);
        if (!$user) {
            throw new Exception("Email hoặc mật khẩu không chính xác.", 401);
        }

        $userId = (int) $user['id'];
        $now = time();

        // 1. Check Brute-force Lockout Persistence
        if (!empty($user['locked_until'])) {
            $lockedUntilTimestamp = strtotime($user['locked_until']);
            if ($lockedUntilTimestamp > $now) {
                $remainingSeconds = $lockedUntilTimestamp - $now;
                $remainingMinutes = ceil($remainingSeconds / 60);
                throw new Exception("Tài khoản đang tạm khóa do nhập sai quá 5 lần. Vui lòng thử lại sau {$remainingMinutes} phút.", 423);
            } else {
                // Lockout period passed, reset counter
                $this->userModel->resetFailedAttempts($userId);
                $user['failed_login_attempts'] = 0;
            }
        }

        // 2. Verify Password
        if (!password_verify($password, $user['password_hash'])) {
            $failedAttempts = $this->userModel->incrementFailedAttempts($userId);
            $maxAttempts = $this->config['auth']['max_login_attempts'] ?? 5;

            if ($failedAttempts >= $maxAttempts) {
                $lockoutSeconds = $this->config['auth']['lockout_duration_seconds'] ?? 900;
                $lockedUntilDate = date('Y-m-d H:i:s', $now + $lockoutSeconds);
                $this->userModel->lockAccount($userId, $lockedUntilDate);

                throw new Exception("Bạn đã nhập sai quá {$maxAttempts} lần. Tài khoản bị tạm khóa 15 phút.", 423);
            }

            $remaining = $maxAttempts - $failedAttempts;
            throw new Exception("Email hoặc mật khẩu không chính xác. Bạn còn {$remaining} lần thử.", 401);
        }

        // 3. Check Account Approval Status
        if ((int) $user['is_approved'] !== 1) {
            throw new Exception("Tài khoản của bạn chưa được quản trị viên phê duyệt. Vui lòng liên hệ Admin.", 403);
        }

        // Success - Reset failure counters
        $this->userModel->resetFailedAttempts($userId);

        // Issue JWT Token
        $payload = [
            'sub' => $user['uuid'],
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
        ];

        $jwtConfig = $this->config['jwt'];
        $token = JWT::encode($payload, $jwtConfig['secret'], $jwtConfig['expires_in']);

        // Set HttpOnly Cookie
        $this->setAuthCookie($token);

        return [
            'token' => $token,
            'user' => [
                'uuid' => $user['uuid'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'avatar_url' => $user['avatar_url'] ?? $user['avatar'] ?? null,
                'role' => $user['role'],
                'is_approved' => true,
                'level' => (int) ($user['level'] ?? 1),
                'total_xp' => (int) ($user['total_xp'] ?? 0),
                'streak_days' => (int) ($user['streak_days'] ?? 0),
            ],
            'expires_in' => $jwtConfig['expires_in'],
        ];
    }

    public function logout(): void
    {
        $token = $this->getTokenFromCookie();
        if ($token) {
            $jwtConfig = $this->config['jwt'];
            $payload = JWT::decode($token, $jwtConfig['secret']);
            $tokenHash = JWT::getHash($token);
            $expiresAt = isset($payload['exp']) ? date('Y-m-d H:i:s', $payload['exp']) : date('Y-m-d H:i:s', time() + 86400);

            $this->userModel->blacklistToken($tokenHash, $expiresAt);
        }

        $this->clearAuthCookie();
    }

    public function getAuthenticatedUser(): ?array
    {
        $token = $this->getTokenFromCookie();
        if (!$token) {
            return null;
        }

        $jwtConfig = $this->config['jwt'];
        $payload = JWT::decode($token, $jwtConfig['secret']);
        if (!$payload || !isset($payload['sub'])) {
            return null;
        }

        // Check if token is blacklisted
        $tokenHash = JWT::getHash($token);
        if ($this->userModel->isTokenBlacklisted($tokenHash)) {
            return null;
        }

        $user = $this->userModel->findByUuid($payload['sub']);
        if (!$user) {
            return null;
        }

        return [
            'uuid' => $user['uuid'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'avatar_url' => $user['avatar_url'] ?? $user['avatar'] ?? null,
            'role' => $user['role'],
            'is_approved' => (bool) $user['is_approved'],
            'level' => (int) ($user['level'] ?? 1),
            'total_xp' => (int) ($user['total_xp'] ?? 0),
            'streak_days' => (int) ($user['streak_days'] ?? 0),
            'created_at' => $user['created_at'],
        ];
    }

    public function approveUser(int $userId): bool
    {
        return $this->userModel->setApproved($userId, true);
    }

    public function getTokenFromCookie(): ?string
    {
        $cookieName = $this->config['jwt']['cookie_name'] ?? 'skill_garden_token';
        return $_COOKIE[$cookieName] ?? null;
    }

    public function setAuthCookie(string $token): void
    {
        $jwtConfig = $this->config['jwt'];
        $cookieName = $jwtConfig['cookie_name'];
        $expires = time() + $jwtConfig['expires_in'];

        if (PHP_VERSION_ID >= 70300) {
            setcookie($cookieName, $token, [
                'expires' => $expires,
                'path' => $jwtConfig['cookie_path'],
                'secure' => $jwtConfig['cookie_secure'],
                'httponly' => $jwtConfig['cookie_httponly'],
                'samesite' => $jwtConfig['cookie_samesite'],
            ]);
        } else {
            setcookie($cookieName, $token, $expires, $jwtConfig['cookie_path'], '', $jwtConfig['cookie_secure'], $jwtConfig['cookie_httponly']);
        }
    }

    public function clearAuthCookie(): void
    {
        $jwtConfig = $this->config['jwt'];
        $cookieName = $jwtConfig['cookie_name'];
        setcookie($cookieName, '', time() - 3600, $jwtConfig['cookie_path']);
    }
}
