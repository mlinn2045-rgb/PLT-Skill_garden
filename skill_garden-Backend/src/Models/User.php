<?php
// src/Models/User.php

namespace App\Models;

use Database;
use PDO;

class User
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function findByUuid(string $uuid): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE uuid = :uuid LIMIT 1");
        $stmt->execute(['uuid' => $uuid]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare("
            INSERT INTO users (uuid, email, full_name, password_hash, role, is_approved, total_xp)
            VALUES (:uuid, :email, :full_name, :password_hash, :role, :is_approved, :total_xp)
        ");
        $stmt->execute([
            'uuid' => $data['uuid'],
            'email' => $data['email'],
            'full_name' => $data['full_name'],
            'password_hash' => $data['password_hash'],
            'role' => $data['role'] ?? 'USER',
            'is_approved' => $data['is_approved'] ?? 0,
            'total_xp' => $data['total_xp'] ?? 100,
        ]);

        $id = (int) $this->db->lastInsertId();
        return $this->findById($id);
    }

    public function incrementFailedAttempts(int $id): int
    {
        $stmt = $this->db->prepare("
            UPDATE users 
            SET failed_login_attempts = failed_login_attempts + 1 
            WHERE id = :id
        ");
        $stmt->execute(['id' => $id]);

        $user = $this->findById($id);
        return $user ? (int) $user['failed_login_attempts'] : 0;
    }

    public function lockAccount(int $id, string $lockedUntil): bool
    {
        $stmt = $this->db->prepare("
            UPDATE users 
            SET locked_until = :locked_until 
            WHERE id = :id
        ");
        return $stmt->execute([
            'id' => $id,
            'locked_until' => $lockedUntil,
        ]);
    }

    public function resetFailedAttempts(int $id): bool
    {
        $stmt = $this->db->prepare("
            UPDATE users 
            SET failed_login_attempts = 0, locked_until = NULL 
            WHERE id = :id
        ");
        return $stmt->execute(['id' => $id]);
    }

    public function setApproved(int $id, bool $approved = true): bool
    {
        $stmt = $this->db->prepare("
            UPDATE users 
            SET is_approved = :is_approved 
            WHERE id = :id
        ");
        return $stmt->execute([
            'id' => $id,
            'is_approved' => $approved ? 1 : 0,
        ]);
    }

    public function isTokenBlacklisted(string $tokenHash): bool
    {
        $stmt = $this->db->prepare("
            SELECT id FROM token_blacklist 
            WHERE token_hash = :token_hash AND expires_at > NOW() 
            LIMIT 1
        ");
        $stmt->execute(['token_hash' => $tokenHash]);
        return (bool) $stmt->fetch();
    }

    public function blacklistToken(string $tokenHash, string $expiresAt): bool
    {
        $stmt = $this->db->prepare("
            INSERT IGNORE INTO token_blacklist (token_hash, expires_at)
            VALUES (:token_hash, :expires_at)
        ");
        return $stmt->execute([
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt,
        ]);
    }

    public function cleanupExpiredTokens(): int
    {
        $stmt = $this->db->prepare("DELETE FROM token_blacklist WHERE expires_at < NOW()");
        $stmt->execute();
        return $stmt->rowCount();
    }
}
