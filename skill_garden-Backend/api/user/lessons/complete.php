<?php
// api/user/lessons/complete.php

require_once __DIR__ . '/../../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\LessonService;

$user = AuthMiddleware::requireRole('USER');
$lessonService = new LessonService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $lessonId = (int) ($data['lesson_id'] ?? 0);

        if ($lessonId <= 0) {
            Response::error("ID bài học không hợp lệ.", 400);
        }

        $result = $lessonService->completeLesson($user['id'], $lessonId);
        Response::success($result, $result['already_completed'] ? "Bài học đã được hoàn thành trước đó." : "Hoàn thành bài học thành công!");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
