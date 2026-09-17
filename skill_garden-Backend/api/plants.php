<?php
// api/plants.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Helpers\JWT;
use App\Services\PlantService;

$plantService = new PlantService();
$method = $_SERVER['REQUEST_METHOD'];

$config = require __DIR__ . '/../config/config.php';
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
        $plants = $plantService->getAllPlants();
        Response::success($plants, "Lấy danh sách loại cây thành công.");
    }

    // Require ADMIN or SUPER_ADMIN for mutations
    if (!in_array($userRole, ['ADMIN', 'SUPER_ADMIN'])) {
        Response::error("Bạn không có quyền thực hiện thao tác này.", 403);
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if ($method === 'POST') {
        if (isset($_GET['action']) && $_GET['action'] === 'stage') {
            $plantId = (int) ($body['plant_id'] ?? 0);
            $result = $plantService->savePlantStage($plantId, $body);
            Response::success($result, "Cập nhật giai đoạn sinh trưởng thành công.");
        }

        $plant = $plantService->createPlant($body);
        Response::success($plant, "Tạo loại cây mới thành công.", 201);
    }

    if ($method === 'PUT') {
        $plantId = (int) ($_GET['id'] ?? $body['id'] ?? 0);
        if ($plantId <= 0) {
            Response::error("ID loại cây không hợp lệ.", 400);
        }
        $updated = $plantService->updatePlant($plantId, $body);
        Response::success(['updated' => $updated], "Cập nhật loại cây thành công.");
    }

    if ($method === 'DELETE') {
        $plantId = (int) ($_GET['id'] ?? 0);
        if ($plantId <= 0) {
            Response::error("ID loại cây không hợp lệ.", 400);
        }
        $deleted = $plantService->deletePlant($plantId);
        Response::success(['deleted' => $deleted], "Xóa loại cây thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
