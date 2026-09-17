<?php
// api/admin/questions.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\QuizService;

AuthMiddleware::requirePermission('MANAGE_QUIZZES');

$quizService = new QuizService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $skillId = isset($_GET['skill_id']) ? (int) $_GET['skill_id'] : null;
        $quizId = isset($_GET['quiz_id']) ? (int) $_GET['quiz_id'] : null;
        $difficulty = $_GET['difficulty'] ?? null;

        $questions = $quizService->getQuestions($skillId, $quizId, $difficulty);
        Response::success($questions, "Lấy ngân hàng câu hỏi thành công.");
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $question = $quizService->createQuestion($data);
        Response::success($question, "Tạo câu hỏi mới thành công!", 201);
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $questionId = (int) ($data['id'] ?? $data['question_id'] ?? 0);

        if ($questionId <= 0) {
            Response::error("ID câu hỏi không hợp lệ.", 400);
        }

        $quizService->updateQuestion($questionId, $data);
        Response::success(null, "Cập nhật câu hỏi thành công!");
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $questionId = (int) ($data['question_id'] ?? $_GET['id'] ?? 0);

        if ($questionId <= 0) {
            Response::error("ID câu hỏi không hợp lệ.", 400);
        }

        $quizService->deleteQuestion($questionId);
        Response::success(null, "Xóa câu hỏi thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
