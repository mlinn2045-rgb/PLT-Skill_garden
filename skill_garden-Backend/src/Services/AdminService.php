<?php
// src/Services/AdminService.php

namespace App\Services;

use App\Helpers\Validator;
use App\Models\User;
use Database;
use Exception;
use PDO;

class AdminService
{
    private User $userModel;
    private PDO $db;

    public function __construct(?User $userModel = null, ?PDO $db = null)
    {
        $this->userModel = $userModel ?? new User();
        $this->db = $db ?? Database::getConnection();
    }

    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    public function getAdmins(?string $search = null, ?string $status = null): array
    {
        $whereClauses = ["role = 'ADMIN'"];
        $params = [];

        if (!empty($search)) {
            $whereClauses[] = "(username LIKE :search OR email LIKE :search OR full_name LIKE :search)";
            $params['search'] = "%{$search}%";
        }

        if (!empty($status)) {
            $whereClauses[] = "status = :status";
            $params['status'] = $status;
        }

        $whereSql = implode(' AND ', $whereClauses);
        $sql = "
            SELECT id, uuid, email, full_name, username, tag_id, avatar, role, status, is_approved, last_active_at, created_at 
            FROM users 
            WHERE {$whereSql}
            ORDER BY id DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Attach permissions to each admin
        foreach ($admins as &$admin) {
            $permStmt = $this->db->prepare("SELECT permission_key FROM admin_permissions WHERE admin_id = :admin_id");
            $permStmt->execute(['admin_id' => $admin['id']]);
            $admin['permissions'] = $permStmt->fetchAll(PDO::FETCH_COLUMN);
        }

        return $admins;
    }

    public function createAdmin(array $data): array
    {
        $fullName = trim($data['full_name'] ?? $data['fullName'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';
        $permissions = $data['permissions'] ?? [];

        if (empty($fullName) || empty($email) || empty($password)) {
            throw new Exception("Họ tên, email và mật khẩu là bắt buộc.", 400);
        }

        if (!Validator::isEmail($email)) {
            throw new Exception("Email không hợp lệ.", 400);
        }

        if ($this->userModel->findByEmail($email)) {
            throw new Exception("Email này đã được sử dụng.", 409);
        }

        $uuid = $this->generateUuidV4();
        $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
        $tagId = 'Admin#' . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $stmt = $this->db->prepare("
            INSERT INTO users (uuid, email, full_name, username, tag_id, password_hash, role, status, is_approved)
            VALUES (:uuid, :email, :full_name, :username, :tag_id, :password_hash, 'ADMIN', 'ACTIVE', 1)
        ");
        $stmt->execute([
            'uuid' => $uuid,
            'email' => $email,
            'full_name' => $fullName,
            'username' => !empty($username) ? $username : explode('@', $email)[0],
            'tag_id' => $tagId,
            'password_hash' => $passwordHash,
        ]);

        $adminId = (int) $this->db->lastInsertId();

        // Assign permissions
        if (!empty($permissions) && is_array($permissions)) {
            $this->setAdminPermissions($adminId, $permissions);
        }

        return $this->userModel->findById($adminId);
    }

    public function updateAdmin(int $adminId, array $data): bool
    {
        $admin = $this->userModel->findById($adminId);
        if (!$admin || $admin['role'] !== 'ADMIN') {
            throw new Exception("Không tìm thấy tài khoản Admin.", 404);
        }

        $updateFields = [];
        $params = ['id' => $adminId];

        if (isset($data['full_name'])) {
            $updateFields[] = "full_name = :full_name";
            $params['full_name'] = trim($data['full_name']);
        }
        if (isset($data['username'])) {
            $updateFields[] = "username = :username";
            $params['username'] = trim($data['username']);
        }
        if (isset($data['status'])) {
            $updateFields[] = "status = :status";
            $params['status'] = $data['status'];
        }

        if (!empty($updateFields)) {
            $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }

        if (isset($data['permissions']) && is_array($data['permissions'])) {
            $this->setAdminPermissions($adminId, $data['permissions']);
        }

        return true;
    }

    public function deleteAdmin(int $adminId): bool
    {
        $admin = $this->userModel->findById($adminId);
        if (!$admin || $admin['role'] !== 'ADMIN') {
            throw new Exception("Không tìm thấy tài khoản Admin.", 404);
        }

        return $this->userModel->delete($adminId);
    }

    public function setAdminPermissions(int $adminId, array $permissions): void
    {
        // Clear existing permissions
        $delStmt = $this->db->prepare("DELETE FROM admin_permissions WHERE admin_id = :admin_id");
        $delStmt->execute(['admin_id' => $adminId]);

        // Insert new permissions
        if (!empty($permissions)) {
            $insStmt = $this->db->prepare("INSERT INTO admin_permissions (admin_id, permission_key) VALUES (:admin_id, :permission_key)");
            foreach ($permissions as $permKey) {
                $insStmt->execute([
                    'admin_id' => $adminId,
                    'permission_key' => trim($permKey)
                ]);
            }
        }
    }

    public function getAdminPermissions(int $adminId): array
    {
        $stmt = $this->db->prepare("SELECT permission_key FROM admin_permissions WHERE admin_id = :admin_id");
        $stmt->execute(['admin_id' => $adminId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
