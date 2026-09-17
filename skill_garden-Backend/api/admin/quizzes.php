<?php
// api/admin/quizzes.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\QuizService;

AuthMiddleware::requirePermission('MANAGE_QUIZZES');

$quizService = new QuizService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $quizId = (int) ($_GET['id'] ?? 0);
        if ($quizId > 0) {
            $quiz = $quizService->getQuizDetail($quizId, true);
            Response::success($quiz, "Lấy chi tiết bài kiểm tra (Admin) thành công.");
        }
        Response::error("Vui lòng cung cấp ID bài kiểm tra.", 400);
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $quiz = $quizService->createQuiz($data);
        Response::success($quiz, "Tạo bài kiểm tra mới thành công!", 201);
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $quizId = (int) ($data['id'] ?? $data['quiz_id'] ?? 0);

        if ($quizId <= 0) {
            Response::error("ID bài kiểm tra không hợp lệ.", 400);
        }

        $quizService->updateQuiz($quizId, $data);
        Response::success(null, "Cập nhật bài kiểm tra thành công!");
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $quizId = (int) ($data['quiz_id'] ?? $_GET['id'] ?? 0);

        if ($quizId <= 0) {
            Response::error("ID bài kiểm tra không hợp lệ.", 400);
        }

        $quizService->deleteQuiz($quizId);
        Response::success(null, "Xóa bài kiểm tra thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
