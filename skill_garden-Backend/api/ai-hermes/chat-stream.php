<?php
// api/ai-hermes/chat-stream.php
// Server-Sent Events (SSE) AI Hermes Studio Deep Reasoning Endpoint

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

// 1. Authenticate user
$user = AuthMiddleware::authenticate();
$userId = (int)$user['id'];

// 2. Parse request payload
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);

if (!is_array($input) || empty(trim($input['message'] ?? ''))) {
    Response::error("Nội dung câu hỏi không được để trống.", 400);
}

$userMessage = trim($input['message']);
$conversationId = !empty($input['conversationId']) ? (int)$input['conversationId'] : null;
$preferredModel = !empty($input['model']) ? trim($input['model']) : 'deepseek/deepseek-r1:free';
$context = is_array($input['context'] ?? null) ? $input['context'] : [];
$context['initialPrompt'] = $userMessage;

$aiService = new AIService();

// 3. Rate limiter check (Protects server from spam)
if (!$aiService->checkRateLimit($userId)) {
    Response::error("Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi 1 phút trước khi hỏi tiếp.", 429);
}

// 4. Check Credit Balance: Hermes costs 5 credits
$creditCost = 5;
$currentBalance = $aiService->getUserCredits($userId);

if ($currentBalance < $creditCost) {
    http_response_code(402);
    echo json_encode([
        'success' => false,
        'code' => 'INSUFFICIENT_CREDITS',
        'message' => "Số dư Credits không đủ ({$currentBalance} Credits). Mỗi câu hỏi chuyên sâu tiêu tốn {$creditCost} Credits. Vui lòng nạp thêm gói Credits để tiếp tục.",
        'currentCredits' => $currentBalance,
        'requiredCredits' => $creditCost
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 5. Deduct Credits Atomically
$deducted = $aiService->deductCredits(
    $userId,
    $creditCost,
    "Hỏi đáp chuyên sâu AI Hermes: " . mb_substr($userMessage, 0, 40),
    $preferredModel
);

if (!$deducted) {
    http_response_code(402);
    echo json_encode([
        'success' => false,
        'code' => 'DEDUCTION_FAILED',
        'message' => "Không thể trừ credits hoặc số dư vừa thay đổi. Vui lòng kiểm tra lại ví của bạn."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 6. Initialize SSE Headers
header('Content-Type: text/event-stream; charset=utf-8');
header('Cache-Control: no-cache, no-transform');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');

while (ob_get_level() > 0) {
    ob_end_flush();
}

$sendEvent = function(array $data) {
    echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
    if (ob_get_level() > 0) {
        ob_flush();
    }
    flush();
};

$startTime = microtime(true);
$fullContent = '';

try {
    // 7. Get or create Hermes conversation record
    $convId = $aiService->getOrCreateConversation($userId, $conversationId, $context, 'HERMES', $preferredModel);

    // Save user prompt
    $aiService->saveMessage($convId, 'user', $userMessage, 0, $preferredModel);

    // Send initial metadata event with remaining credits
    $remainingCredits = $aiService->getUserCredits($userId);
    $sendEvent([
        'type' => 'start',
        'conversationId' => $convId,
        'model' => $preferredModel,
        'creditsDeducted' => $creditCost,
        'remainingCredits' => $remainingCredits
    ]);

    // 8. Build System Prompt & History
    $systemPrompt = $aiService->buildHermesSystemPrompt($userId, $preferredModel);
    $history = $aiService->getConversationHistory($convId, 8);

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt]
    ];

    foreach ($history as $h) {
        $messages[] = [
            'role' => $h['role'] === 'assistant' ? 'assistant' : 'user',
            'content' => $h['content']
        ];
    }

    // 9. Call Hermes LLM with Multi-Provider Streaming
    $fullContent = $aiService->callHermesLLMStream(
        $messages,
        $preferredModel,
        function(string $delta) use ($sendEvent) {
            $sendEvent(['type' => 'delta', 'delta' => $delta]);
        }
    );

    $durationMs = (int)((microtime(true) - $startTime) * 1000);

    // 10. Save assistant response
    $aiService->saveMessage($convId, 'assistant', $fullContent, $durationMs, $preferredModel);

    // Done event
    $sendEvent([
        'type' => 'done',
        'conversationId' => $convId,
        'durationMs' => $durationMs,
        'remainingCredits' => $remainingCredits
    ]);

    echo "data: [DONE]\n\n";
    flush();

} catch (Exception $ex) {
    // 11. Atomic Refund if calling LLM failed
    $aiService->refundCredits($userId, $creditCost, "Lỗi kết nối AI: " . $ex->getMessage());

    $sendEvent([
        'type' => 'error',
        'message' => "Đã xảy ra lỗi khi tạo phản hồi từ mô hình AI. Hệ thống đã hoàn lại {$creditCost} Credits vào tài khoản của bạn.",
        'refunded' => true,
        'remainingCredits' => $aiService->getUserCredits($userId)
    ]);
    echo "data: [DONE]\n\n";
    flush();
}
