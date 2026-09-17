<?php
// api/superadmin/config.php

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

if ($userRole !== 'SUPER_ADMIN') {
    Response::error("Chỉ Super Admin mới có quyền truy cập System Config.", 403);
}

try {
    if ($method === 'GET') {
        $configs = $configService->getAllConfigs();
        Response::success($configs, "Lấy cấu hình hệ thống thành công.");
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if ($method === 'POST' || $method === 'PUT') {
        $configService->updateConfigs($body);
        Response::success(null, "Cập nhật cấu hình hệ thống thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
