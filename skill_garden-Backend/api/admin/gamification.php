<?php
// api/admin/gamification.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Middleware\AuthMiddleware;
use App\Helpers\Response;
use App\Services\ConfigService;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$configService = new ConfigService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $configs = $configService->getAllConfigs();
        Response::success($configs, "Lấy danh sách cấu hình Gamification thành công.");
    }

    AuthMiddleware::requirePermission('MANAGE_GAMIFICATION');

    $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if ($method === 'POST' || $method === 'PUT') {
        $configService->updateConfigs($body);
        Response::success(null, "Cập nhật cấu hình Gamification thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
