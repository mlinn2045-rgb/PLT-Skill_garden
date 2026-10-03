<?php
// api/ai-admin/generate-quiz.php
// AI-Powered Quiz Question Generator from Documents for LMS Admin

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\AIService;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

// 1. Authenticate Admin or Super Admin
$user = AuthMiddleware::authenticate();
$role = strtoupper($user['role'] ?? 'USER');
if ($role !== 'ADMIN' && $role !== 'SUPER_ADMIN') {
    Response::error("Bạn không có quyền truy cập chức năng tạo đề trắc nghiệm AI.", 403);
}

// 2. Parse payload
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);

$content = trim($input['content'] ?? '');
$numQuestions = !empty($input['numQuestions']) ? (int)$input['numQuestions'] : 5;
$difficulty = !empty($input['difficulty']) ? trim($input['difficulty']) : 'MEDIUM';

if (empty($content)) {
    Response::error("Nội dung tài liệu không được để trống.", 400);
}

if ($numQuestions < 1 || $numQuestions > 20) {
    $numQuestions = 5;
}

$aiService = new AIService();
$questions = $aiService->generateQuizFromText($content, $numQuestions, $difficulty);

Response::success([
    'totalGenerated' => count($questions),
    'difficulty' => $difficulty,
    'questions' => $questions
], "AI đã tạo thành công " . count($questions) . " câu hỏi trắc nghiệm từ tài liệu.");
