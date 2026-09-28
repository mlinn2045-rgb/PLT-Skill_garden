<?php
// api/superadmin/config.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Middleware\AuthMiddleware;
use App\Helpers\Response;
use App\Services\ConfigService;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

AuthMiddleware::requireRole('SUPER_ADMIN');

$configService = new ConfigService();
$method = $_SERVER['REQUEST_METHOD'];

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
