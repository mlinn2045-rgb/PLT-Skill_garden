<?php
// api/admin/gamification.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Helpers\JWT;
use App\Services\ConfigService;

$configService = new ConfigService();
$method = $_SERVER['REQUEST_METHOD'];

$config = require __DIR__ . '/../../config/config.php';
$token = $_COOKIE[$config['jwt']['cookie_name'] ?? 'skill_garden_token'] ?? null;
$userRole = 'GUEST';

if ($token) {
    $payload = JWT::decode($token, $config['jwt']['secret']);
    if ($payload && isset($payload['role'])) {
        $userRole = $payload['role'];
    }
}

try {
    if ($method === 'GET') {
        $configs = $configService->getAllConfigs();
        Response::success($configs, "Lấy danh sách cấu hình Gamification thành công.");
    }

    if (!in_array($userRole, ['ADMIN', 'SUPER_ADMIN'])) {
        Response::error("Bạn không có quyền truy cập.", 403);
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if ($method === 'POST' || $method === 'PUT') {
        $configService->updateConfigs($body);
        Response::success(null, "Cập nhật cấu hình Gamification thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
