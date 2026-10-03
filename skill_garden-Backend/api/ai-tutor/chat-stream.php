<?php
// api/ai-tutor/chat-stream.php
// Server-Sent Events (SSE) Real-Time AI Chat Stream Endpoint

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
    Response::error("Nội dung tin nhắn không được để trống.", 400);
}

$userMessage = trim($input['message']);
$conversationId = !empty($input['conversationId']) ? (int)$input['conversationId'] : null;
$context = is_array($input['context'] ?? null) ? $input['context'] : [];

$aiService = new AIService();

// 3. Layer 1: Rate Limiter Check
if (!$aiService->checkRateLimit($userId)) {
    Response::error("Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi 1 phút trước khi hỏi tiếp.", 429);
}

// 4. Initialize SSE Headers
header('Content-Type: text/event-stream; charset=utf-8');
header('Cache-Control: no-cache, no-transform');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Disable buffering for Nginx/FastCGI

// Flush existing output buffers
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

try {
    // 5. Get or create conversation record
    $convId = $aiService->getOrCreateConversation($userId, $conversationId, $context);

    // Save user message to database
    $aiService->saveMessage($convId, 'user', $userMessage);

    // 6. Layer 6: ReAct DB Tools check
    $toolResult = $aiService->executeReActTools($userId, $userMessage);
    if ($toolResult !== null) {
        $sendEvent(['type' => 'delta', 'delta' => $toolResult]);
        $durationMs = (int)((microtime(true) - $startTime) * 1000);
        $aiService->saveMessage($convId, 'assistant', $toolResult, $durationMs);
        $sendEvent(['type' => 'done', 'conversationId' => $convId]);
        echo "data: [DONE]\n\n";
        flush();
        exit;
    }

    // 7. Layer 2: Semantic Cache Check
    $cached = $aiService->getCachedResponse($userMessage);
    if ($cached !== null) {
        // Cache Hit: Stream cached text with quick interval
        $words = preg_split('/(\s+)/u', $cached, -1, PREG_SPLIT_DELIM_CAPTURE);
        foreach ($words as $w) {
            $sendEvent(['type' => 'delta', 'delta' => $w]);
            usleep(8000);
        }
        $durationMs = (int)((microtime(true) - $startTime) * 1000);
        $aiService->saveMessage($convId, 'assistant', $cached, $durationMs);
        $sendEvent(['type' => 'done', 'conversationId' => $convId]);
        echo "data: [DONE]\n\n";
        flush();
        exit;
    }

    // 8. Layer 4 & 5: Context Assembly & Memory History
    $systemPrompt = $aiService->buildSystemPrompt($userId, $context);
    $history = $aiService->getConversationHistory($convId, 8);

    $messagesPayload = [
        ['role' => 'system', 'content' => $systemPrompt]
    ];

    foreach ($history as $h) {
        $messagesPayload[] = [
            'role' => $h['role'] === 'user' ? 'user' : 'assistant',
            'content' => $h['content']
        ];
    }

    // Add current user prompt
    $messagesPayload[] = ['role' => 'user', 'content' => $userMessage];

    // 9. Layer 7: Call LLM Provider with Fallback Chain
    $accumulatedResponse = $aiService->callLLMStream($messagesPayload, function(string $chunk) use ($sendEvent) {
        $sendEvent(['type' => 'delta', 'delta' => $chunk]);
    });

    $durationMs = (int)((microtime(true) - $startTime) * 1000);

    // Save assistant message to DB
    if (!empty($accumulatedResponse)) {
        $aiService->saveMessage($convId, 'assistant', $accumulatedResponse, $durationMs);
        // Save to Semantic Cache
        $aiService->saveToCache($userMessage, $accumulatedResponse);
    }

    $sendEvent(['type' => 'done', 'conversationId' => $convId]);
    echo "data: [DONE]\n\n";
    flush();

} catch (Exception $e) {
    error_log("AI Chat Stream Error: " . $e->getMessage());
    $sendEvent([
        'type' => 'error',
        'error' => 'Hệ thống AI gặp sự cố: ' . $e->getMessage()
    ]);
    echo "data: [DONE]\n\n";
    flush();
}
