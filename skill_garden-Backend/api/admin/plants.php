<?php
// api/admin/plants.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\PlantService;

AuthMiddleware::requirePermission('MANAGE_PLANTS');

$plantService = new PlantService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $plants = $plantService->getAllPlants();
        Response::success($plants, "Lấy danh sách loại cây thành công.");
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $plant = $plantService->createPlant($data);
        Response::success($plant, "Tạo loại cây mới thành công!", 201);
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $plantId = (int) ($data['id'] ?? $data['plant_id'] ?? 0);

        if ($plantId <= 0) {
            Response::error("ID loại cây không hợp lệ.", 400);
        }

        $plantService->updatePlant($plantId, $data);
        Response::success(null, "Cập nhật loại cây thành công!");
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $plantId = (int) ($data['plant_id'] ?? $_GET['id'] ?? 0);

        if ($plantId <= 0) {
            Response::error("ID loại cây không hợp lệ.", 400);
        }

        $plantService->deletePlant($plantId);
        Response::success(null, "Xóa loại cây thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
