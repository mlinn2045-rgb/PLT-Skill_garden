<?php
// api/achievements.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Helpers\JWT;
use App\Services\AchievementService;

$achieveService = new AchievementService();
$method = $_SERVER['REQUEST_METHOD'];

$config = require __DIR__ . '/../config/config.php';
$token = $_COOKIE[$config['jwt']['cookie_name'] ?? 'skill_garden_token'] ?? null;
$userId = null;

if ($token) {
    $payload = JWT::decode($token, $config['jwt']['secret']);
    if ($payload && isset($payload['id'])) {
        $userId = (int) $payload['id'];
    }
}

try {
    if ($method === 'GET') {
        $achievements = $achieveService->getAchievements($userId);
        Response::success($achievements, "Lấy danh sách thành tích thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
