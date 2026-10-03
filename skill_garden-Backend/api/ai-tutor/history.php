<?php
// api/ai-tutor/history.php
// AI Conversation History Endpoint

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$user = AuthMiddleware::authenticate();
$userId = (int)$user['id'];
$db = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $conversationId = isset($_GET['conversation_id']) ? (int)$_GET['conversation_id'] : null;

    if ($conversationId) {
        // Fetch specific conversation messages
        $stmt = $db->prepare("
            SELECT id, role, content, latency_ms, created_at 
            FROM ai_messages 
            WHERE conversation_id = :cid
            ORDER BY id ASC
        ");
        $stmt->execute(['cid' => $conversationId]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success($messages, "Lấy lịch sử hội thoại thành công");
    } else {
        // Fetch list of conversations for current user
        $stmt = $db->prepare("
            SELECT id, title, context_skill_id, context_lesson_id, model_used, updated_at 
            FROM ai_conversations 
            WHERE user_id = :uid 
            ORDER BY updated_at DESC LIMIT 20
        ");
        $stmt->execute(['uid' => $userId]);
        $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success($conversations, "Lấy danh sách phiên trò chuyện thành công");
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $conversationId = isset($_GET['conversation_id']) ? (int)$_GET['conversation_id'] : null;

    if ($conversationId) {
        $stmt = $db->prepare("DELETE FROM ai_conversations WHERE id = :id AND user_id = :uid");
        $stmt->execute(['id' => $conversationId, 'uid' => $userId]);
        Response::success(null, "Đã xóa phiên trò chuyện thành công");
    } else {
        $stmt = $db->prepare("DELETE FROM ai_conversations WHERE user_id = :uid");
        $stmt->execute(['uid' => $userId]);
        Response::success(null, "Đã xóa toàn bộ lịch sử trò chuyện");
    }
} else {
    Response::error("Method not allowed", 405);
}
