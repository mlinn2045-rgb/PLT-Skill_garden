<?php
// api/admin/lessons.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\LessonService;

AuthMiddleware::requirePermission('MANAGE_LESSONS');

$lessonService = new LessonService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $lesson = $lessonService->createLesson($data);
        Response::success($lesson, "Tạo bài học mới thành công!", 201);
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $lessonId = (int) ($data['id'] ?? $data['lesson_id'] ?? 0);

        if ($lessonId <= 0) {
            Response::error("ID bài học không hợp lệ.", 400);
        }

        $lessonService->updateLesson($lessonId, $data);
        Response::success(null, "Cập nhật bài học thành công!");
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $lessonId = (int) ($data['lesson_id'] ?? $_GET['id'] ?? 0);

        if ($lessonId <= 0) {
            Response::error("ID bài học không hợp lệ.", 400);
        }

        $lessonService->deleteLesson($lessonId);
        Response::success(null, "Xóa bài học thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
