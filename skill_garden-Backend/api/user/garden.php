<?php
// api/user/garden.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Helpers\JWT;
use App\Services\GardenService;

$gardenService = new GardenService();
$method = $_SERVER['REQUEST_METHOD'];

$config = require __DIR__ . '/../../config/config.php';
$token = $_COOKIE[$config['jwt']['cookie_name'] ?? 'skill_garden_token'] ?? null;
$userId = null;

if ($token) {
    $payload = JWT::decode($token, $config['jwt']['secret']);
    if ($payload && isset($payload['id'])) {
        $userId = (int) $payload['id'];
    }
}

if (!$userId) {
    Response::error("Bạn chưa đăng nhập.", 401);
}

try {
    if ($method === 'GET') {
        $garden = $gardenService->getUserGarden($userId);
        Response::success($garden, "Lấy thông tin khu vườn thành công.");
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if ($method === 'POST') {
        $action = $_GET['action'] ?? $body['action'] ?? 'water';
        $skillId = (int) ($body['skill_id'] ?? 0);

        if ($skillId <= 0) {
            Response::error("Skill ID không hợp lệ.", 400);
        }

        if ($action === 'water') {
            $result = $gardenService->waterTree($userId, $skillId);
            Response::success($result, $result['message']);
        }

        if ($action === 'plant') {
            $plantId = (int) ($body['plant_id'] ?? 1);
            $result = $gardenService->plantSeed($userId, $skillId, $plantId);
            Response::success($result, $result['message']);
        }
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
