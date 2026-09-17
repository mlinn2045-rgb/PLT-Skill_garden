<?php
// api/quizzes.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Services\QuizService;

$quizService = new QuizService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $quizId = (int) ($_GET['id'] ?? 0);
        if ($quizId <= 0) {
            Response::error("ID bài kiểm tra không hợp lệ.", 400);
        }

        $quiz = $quizService->getQuizDetail($quizId, false);
        Response::success($quiz, "Lấy bài kiểm tra thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
