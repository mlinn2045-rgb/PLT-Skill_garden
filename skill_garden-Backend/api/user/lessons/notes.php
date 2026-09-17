<?php
// api/user/lessons/notes.php

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
        $noteText = $data['note_text'] ?? '';
        $timestampSeconds = (int) ($data['timestamp_seconds'] ?? 0);

        if ($lessonId <= 0 || empty(trim($noteText))) {
            Response::error("ID bài học và nội dung ghi chú không được để trống.", 400);
        }

        $note = $lessonService->addNote($user['id'], $lessonId, $noteText, $timestampSeconds);
        Response::success($note, "Thêm ghi chú thành công!", 201);
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $noteId = (int) ($data['note_id'] ?? $_GET['id'] ?? 0);

        if ($noteId <= 0) {
            Response::error("ID ghi chú không hợp lệ.", 400);
        }

        $lessonService->deleteNote($user['id'], $noteId);
        Response::success(null, "Xóa ghi chú thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
