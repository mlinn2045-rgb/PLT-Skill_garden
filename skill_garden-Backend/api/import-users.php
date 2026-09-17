<?php
// api/import-users.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Models\User;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input)) {
    // Check if JSON file was uploaded
    if (isset($_FILES['json_file']['tmp_name'])) {
        $fileContent = file_get_contents($_FILES['json_file']['tmp_name']);
        $input = json_decode($fileContent, true);
    }
}

if (!is_array($input)) {
    Response::error("Dữ liệu JSON không hợp lệ hoặc thiếu dữ liệu tài khoản.", 400);
}

$db = Database::getConnection();
$insertedCount = 0;
$updatedCount = 0;

foreach ($input as $u) {
    $email = strtolower(trim($u['email'] ?? ''));
    if (empty($email))
        continue;

    $fullName = $u['fullName'] ?? 'N/A';
    $username = $u['username'] ?? explode('@', $email)[0];
    $password = $u['password'] ?? 'Password123!';
    $role = strtoupper($u['role'] ?? 'USER');
    $isApproved = !empty($u['isApproved']) ? 1 : 0;
    $level = (int) ($u['level'] ?? 1);
    $totalXp = (int) ($u['totalXp'] ?? 0);
    $streakDays = (int) ($u['streakDays'] ?? 0);
    $bio = $u['bio'] ?? null;
    $tagId = ucfirst($username) . '#' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

    $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

    $stmtCheck = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $stmtCheck->execute(['email' => $email]);
    $existing = $stmtCheck->fetch();

    if ($existing) {
        $stmtUpdate = $db->prepare("
            UPDATE users SET
                full_name = :full_name,
                username = :username,
                password_hash = :password_hash,
                role = :role,
                is_approved = :is_approved,
                level = :level,
                total_xp = :total_xp,
                streak_days = :streak_days,
                bio = :bio
            WHERE email = :email
        ");
        $stmtUpdate->execute([
            'full_name' => $fullName,
            'username' => $username,
            'password_hash' => $passwordHash,
            'role' => $role,
            'is_approved' => $isApproved,
            'level' => $level,
            'total_xp' => $totalXp,
            'streak_days' => $streakDays,
            'bio' => $bio,
            'email' => $email
        ]);
        $updatedCount++;
    } else {
        $uuid = sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
        );

        $stmtInsert = $db->prepare("
            INSERT INTO users (uuid, email, full_name, username, tag_id, password_hash, role, status, is_approved, level, total_xp, streak_days, bio)
            VALUES (:uuid, :email, :full_name, :username, :tag_id, :password_hash, :role, 'ACTIVE', :is_approved, :level, :total_xp, :streak_days, :bio)
        ");
        $stmtInsert->execute([
            'uuid' => $uuid,
            'email' => $email,
            'full_name' => $fullName,
            'username' => $username,
            'tag_id' => $tagId,
            'password_hash' => $passwordHash,
            'role' => $role,
            'is_approved' => $isApproved,
            'level' => $level,
            'total_xp' => $totalXp,
            'streak_days' => $streakDays,
            'bio' => $bio
        ]);
        $insertedCount++;
    }
}

Response::success([
    'inserted' => $insertedCount,
    'updated' => $updatedCount
], "Import danh sách tài khoản từ file JSON thành công!", 200);
