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

if (!$token) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        $token = $matches[1];
    }
}

$userId = null;
if ($token) {
    $payload = JWT::decode($token, $config['jwt']['secret']);
    if ($payload) {
        if (isset($payload['id'])) {
            $userId = (int) $payload['id'];
        } elseif (isset($payload['sub'])) {
            $uModel = new \App\Models\User();
            $currUser = $uModel->findByUuid($payload['sub']);
            if ($currUser) {
                $userId = (int) $currUser['id'];
            }
        }
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
            $plantId = (int) ($body['plant_id'] ?? 0);
            $treeName = !empty($body['tree_name']) ? trim($body['tree_name']) : null;
            $result = $gardenService->plantSeed($userId, $skillId, $plantId, $treeName);
            Response::success($result, $result['message']);
        }

        if ($action === 'add_growth') {
            $growthPercent = (float) ($body['growth_percent'] ?? 0);
            $xpAmount = (int) ($body['xp'] ?? 0);
            $result = $gardenService->addGrowth($userId, $skillId, $growthPercent, $xpAmount);
            Response::success($result, "Đã cập nhật tiến độ sinh trưởng cây và XP thành công!");
        }
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
