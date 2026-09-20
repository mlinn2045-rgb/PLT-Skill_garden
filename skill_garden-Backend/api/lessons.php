<?php
// api/lessons.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Helpers\JWT;
use App\Services\LessonService;

$lessonService = new LessonService();
$method = $_SERVER['REQUEST_METHOD'];

// Optional user context
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
        $lessonId = (int) ($_GET['id'] ?? 0);

        if ($lessonId <= 0 && isset($_GET['skill_id'])) {
            $skillId = (int) $_GET['skill_id'];
            if ($skillId <= 0) {
                Response::error("ID kỹ năng không hợp lệ.", 400);
            }

            Response::success(
                $lessonService->getPublishedLessonsBySkillId($skillId),
                "Lấy danh sách bài học thành công."
            );
        }

        if ($lessonId <= 0) {
            Response::error("ID bài học không hợp lệ.", 400);
        }

        $lesson = $lessonService->getLessonDetail($lessonId, $userId);
        Response::success($lesson, "Lấy thông tin chi tiết bài học thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
