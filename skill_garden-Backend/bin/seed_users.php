<?php
// bin/seed_users.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Models\User;

$jsonFile = __DIR__ . '/../database/users.json';

if (!file_exists($jsonFile)) {
    die("File users.json không tồn tại tại: $jsonFile\n");
}

$jsonData = file_get_contents($jsonFile);
$usersData = json_decode($jsonData, true);

if (!is_array($usersData)) {
    die("Dữ liệu JSON không hợp lệ!\n");
}

$db = Database::getConnection();
$insertedCount = 0;
$updatedCount = 0;

foreach ($usersData as $u) {
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
    $tagId = substr(ucfirst($username), 0, 44) . '#' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

    $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

    // Check if user exists
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
                status = 'ACTIVE',
                is_approved = :is_approved,
                failed_login_attempts = 0,
                locked_until = NULL,
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

echo "=== IMPORT TÀI KHOẢN JSON THÀNH CÔNG ===" . PHP_EOL;
echo "Thêm mới: $insertedCount tài khoản" . PHP_EOL;
echo "Cập nhật: $updatedCount tài khoản" . PHP_EOL;
