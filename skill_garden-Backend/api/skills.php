<?php
// api/skills.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Helpers\JWT;
use App\Models\User;
use App\Services\SkillService;

$skillService = new SkillService();
$method = $_SERVER['REQUEST_METHOD'];

// Optional auth check for personalized user progress
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
        $slug = $_GET['slug'] ?? null;
        if ($slug) {
            $skill = $skillService->getSkillBySlug($slug, $userId);
            Response::success($skill, "Lấy thông tin kỹ năng thành công.");
        }

        $category = $_GET['category'] ?? null;
        $skills = $skillService->getSkills($category, false);
        Response::success($skills, "Lấy danh sách kỹ năng thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
