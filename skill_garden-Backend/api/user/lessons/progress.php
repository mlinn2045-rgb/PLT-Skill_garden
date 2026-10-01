<?php
// api/user/lessons/progress.php

require_once __DIR__ . '/../../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\LessonService;

$user = AuthMiddleware::requireRole(['USER', 'ADMIN', 'SUPER_ADMIN']);
$lessonService = new LessonService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $lessonId = (int) ($data['lesson_id'] ?? 0);
        $seconds = (int) ($data['watch_seconds'] ?? $data['seconds'] ?? 0);
        $duration = (int) ($data['duration_seconds'] ?? $data['duration'] ?? 0);
        $isCompleted = !empty($data['is_completed']);

        if ($lessonId <= 0) {
            Response::error("ID bài học không hợp lệ.", 400);
        }

        $result = $lessonService->updateWatchProgress($user['id'], $lessonId, $seconds, $isCompleted, $duration);
        Response::success(
            $result,
            !empty($result['is_completed'])
                ? "Hoàn thành bài học video 100%!"
                : "Cập nhật tiến độ xem video thành công."
        );
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
