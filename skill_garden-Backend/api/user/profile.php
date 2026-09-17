<?php
// api/user/profile.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $email = strtolower(trim($data['email'] ?? ''));
    $fullName = trim($data['full_name'] ?? '');
    $avatarUrl = trim($data['avatar_url'] ?? '');
    $bio = trim($data['bio'] ?? '');

    if (empty($email)) {
        Response::error("Email không được để trống.", 400);
    }

    $stmt = $db->prepare("
        UPDATE users 
        SET full_name = COALESCE(NULLIF(:full_name, ''), full_name),
            avatar_url = COALESCE(NULLIF(:avatar_url, ''), avatar_url),
            bio = COALESCE(NULLIF(:bio, ''), bio)
        WHERE email = :email
    ");

    $stmt->execute([
        'full_name' => $fullName,
        'avatar_url' => $avatarUrl,
        'bio' => $bio,
        'email' => $email
    ]);

    Response::success([
        'email' => $email,
        'full_name' => $fullName,
        'avatar_url' => $avatarUrl,
        'bio' => $bio
    ], "Cập nhật hồ sơ cá nhân và ảnh đại diện thành công!", 200);
}

Response::error("Method not allowed", 405);
