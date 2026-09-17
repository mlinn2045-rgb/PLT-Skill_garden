<?php
// api/superadmin/system-config.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\ConfigService;

$configService = new ConfigService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $isSuperAdmin = false;
        try {
            AuthMiddleware::requireRole('SUPER_ADMIN');
            $isSuperAdmin = true;
        } catch (Exception $e) {
            // Not super admin, return public configs only
        }

        if ($isSuperAdmin) {
            $configs = $configService->getAllConfigs();
            Response::success($configs, "Lấy tất cả cấu hình hệ thống thành công.");
        } else {
            $configs = $configService->getPublicConfigs();
            Response::success($configs, "Lấy cấu hình công khai thành công.");
        }
    }

    if ($method === 'POST' || $method === 'PUT') {
        AuthMiddleware::requireRole('SUPER_ADMIN');
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data)) {
            Response::error("Dữ liệu cấu hình không hợp lệ.", 400);
        }

        $configService->updateConfigs($data);
        Response::success(null, "Cập nhật cấu hình hệ thống thành công!");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
