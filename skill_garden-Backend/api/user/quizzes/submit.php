<?php
// api/user/quizzes/submit.php

require_once __DIR__ . '/../../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\QuizService;

$user = AuthMiddleware::requireRole('USER');
$quizService = new QuizService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $quizId = (int) ($data['quiz_id'] ?? 0);
        $userAnswers = $data['answers'] ?? [];
        $durationSeconds = (int) ($data['duration_seconds'] ?? 0);

        if ($quizId <= 0 || empty($userAnswers)) {
            Response::error("ID bài kiểm tra và câu trả lời là bắt buộc.", 400);
        }

        $result = $quizService->submitQuiz($user['id'], $quizId, $userAnswers, $durationSeconds);
        Response::success($result, $result['passed'] ? "Chúc mừng! Bạn đã đạt bài kiểm tra." : "Bạn chưa đạt bài kiểm tra. Vui lòng ôn tập và thử lại.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
