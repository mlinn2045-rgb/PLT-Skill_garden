<?php
require_once __DIR__ . '/../config/bootstrap.php';

$db = Database::getConnection();

// Unlock and activate all existing users
$db->query("UPDATE users SET failed_login_attempts = 0, locked_until = NULL, status = 'ACTIVE', is_approved = 1");

$accountsToEnsure = [
    [
        'email' => 'admin@pltsolutions.com',
        'username' => 'superadmin_plt',
        'full_name' => 'Super Admin System',
        'password' => 'admin123',
        'role' => 'SUPER_ADMIN',
        'is_approved' => 1
    ],
    [
        'email' => 'admin@skillgarden.com',
        'username' => 'admin_master',
        'full_name' => 'Master Super Admin',
        'password' => 'admin123',
        'role' => 'SUPER_ADMIN',
        'is_approved' => 1
    ],
    [
        'email' => 'lms.admin@pltsolutions.com',
        'username' => 'lms_admin_plt',
        'full_name' => 'Quản Trị Viên LMS',
        'password' => 'admin123',
        'role' => 'ADMIN',
        'is_approved' => 1
    ],
    [
        'email' => 'user_khoa@pltsolutions.com',
        'username' => 'user_khoa_plt',
        'full_name' => 'Nguyễn Anh Khoa',
        'password' => '123456',
        'role' => 'USER',
        'is_approved' => 1
    ],
    [
        'email' => 'anhkhoa.user@gmail.com',
        'username' => 'anhkhoa_dev',
        'full_name' => 'Anh Khoa Dev',
        'password' => '123456',
        'role' => 'USER',
        'is_approved' => 1
    ]
];

foreach ($accountsToEnsure as $acc) {
    $hash = password_hash($acc['password'], PASSWORD_BCRYPT, ['cost' => 10]);
    $stmtCheck = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $stmtCheck->execute(['email' => $acc['email']]);
    $existing = $stmtCheck->fetch();

    if ($existing) {
        $stmtUp = $db->prepare("
            UPDATE users SET 
                full_name = :full_name,
                password_hash = :hash,
                role = :role,
                is_approved = :is_approved,
                status = 'ACTIVE',
                failed_login_attempts = 0,
                locked_until = NULL
            WHERE email = :email
        ");
        $stmtUp->execute([
            'full_name' => $acc['full_name'],
            'hash' => $hash,
            'role' => $acc['role'],
            'is_approved' => $acc['is_approved'],
            'email' => $acc['email']
        ]);
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
        $stmtIns = $db->prepare("
            INSERT INTO users (uuid, email, full_name, username, tag_id, password_hash, role, status, is_approved)
            VALUES (:uuid, :email, :full_name, :username, :tag_id, :hash, :role, 'ACTIVE', :is_approved)
        ");
        $stmtIns->execute([
            'uuid' => $uuid,
            'email' => $acc['email'],
            'full_name' => $acc['full_name'],
            'username' => $acc['username'],
            'tag_id' => $acc['username'] . '#' . rand(1000, 9999),
            'hash' => $hash,
            'role' => $acc['role'],
            'is_approved' => $acc['is_approved']
        ]);
    }
}

echo "=== TẤT CẢ TÀI KHOẢN TRONG SYSTEM CSDL HIỆN TẠI ===\n";
$usersAfter = $db->query("SELECT id, email, username, role, is_approved, status FROM users")->fetchAll(PDO::FETCH_ASSOC);
foreach ($usersAfter as $u) {
    echo "ID: {$u['id']} | Email: {$u['email']} | Role: {$u['role']} | Approved: {$u['is_approved']} | Status: {$u['status']}\n";
}
