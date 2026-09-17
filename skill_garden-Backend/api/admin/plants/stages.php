<?php
// api/admin/plants/stages.php

require_once __DIR__ . '/../../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\PlantService;

AuthMiddleware::requirePermission('MANAGE_PLANTS');

$plantService = new PlantService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $plantId = (int) ($data['plant_id'] ?? 0);

        if ($plantId <= 0) {
            Response::error("ID loại cây không hợp lệ.", 400);
        }

        $plant = $plantService->savePlantStage($plantId, $data);
        Response::success($plant, "Lưu thông tin giai đoạn cây thành công!");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
