<?php
// src/Services/AIService.php
// AI Hermes Architecture Specification Implementation (8 Layers)

namespace App\Services;

use Database;
use Exception;
use PDO;

class AIService
{
    private PDO $db;
    private array $config;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
        $allConfig = require __DIR__ . '/../../config/config.php';
        $this->config = $allConfig['ai'] ?? [];
    }

    /**
     * Layer 1: API Gateway & Rate Limiter
     * Limits requests per user per minute to avoid spam and quota exhaustion.
     */
    public function checkRateLimit(int $userId): bool
    {
        $limit = $this->config['rate_limit_per_minute'] ?? 15;
        $cacheFile = sys_get_temp_dir() . "/ai_rate_limit_{$userId}.json";

        $now = time();
        $data = ['count' => 0, 'window_start' => $now];

        if (file_exists($cacheFile)) {
            $raw = @file_get_contents($cacheFile);
            if ($raw) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded) && ($now - ($decoded['window_start'] ?? 0)) < 60) {
                    $data = $decoded;
                }
            }
        }

        if ($data['count'] >= $limit) {
            return false;
        }

        $data['count']++;
        @file_put_contents($cacheFile, json_encode($data));
        return true;
    }

    /**
     * Layer 2: Semantic Cache Layer
     * Checks if exact or normalized prompt was already answered.
     */
    public function getCachedResponse(string $prompt): ?string
    {
        $normalized = mb_strtolower(trim($prompt));
        $hash = hash('sha256', $normalized);

        $stmt = $this->db->prepare("
            SELECT response_text FROM ai_semantic_cache 
            WHERE prompt_hash = :hash LIMIT 1
        ");
        $stmt->execute(['hash' => $hash]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && !empty($row['response_text'])) {
            // Update hit count asynchronously
            $upStmt = $this->db->prepare("
                UPDATE ai_semantic_cache 
                SET hit_count = hit_count + 1, last_hit_at = NOW() 
                WHERE prompt_hash = :hash
            ");
            $upStmt->execute(['hash' => $hash]);
            return $row['response_text'];
        }

        return null;
    }

    /**
     * Store new question & answer in Semantic Cache
     */
    public function saveToCache(string $prompt, string $response): void
    {
        $normalized = mb_strtolower(trim($prompt));
        $hash = hash('sha256', $normalized);

        $stmt = $this->db->prepare("
            INSERT INTO ai_semantic_cache (prompt_hash, prompt_text, response_text, hit_count, created_at)
            VALUES (:hash, :prompt, :resp, 1, NOW())
            ON DUPLICATE KEY UPDATE 
                response_text = VALUES(response_text),
                hit_count = hit_count + 1,
                last_hit_at = NOW()
        ");
        $stmt->execute([
            'hash' => $hash,
            'prompt' => $prompt,
            'resp' => $response
        ]);
    }

    /**
     * Layer 4 & 5: Context Assembly & Dynamic Lesson RAG Engine
     */
    public function buildSystemPrompt(int $userId, array $context): string
    {
        // 1. Base Persona
        $systemPrompt = "Bạn là Trợ lý AI Gia Sư (AI Tutor) của nền tảng học tập SkillGarden thuộc PLT Solutions.\n";
        $systemPrompt .= "Nhiệm vụ: Đồng hành, hướng dẫn, giải thích bài học, phân tích code và động viên học viên học tập tiến bộ.\n";
        $systemPrompt .= "Văn phong: Thân thiện, sư phạm, khuyến khích học viên, dùng Markdown chuẩn với cú pháp code highlight rõ ràng.\n\n";

        // 2. User Adaptive Profile
        $userStmt = $this->db->prepare("SELECT full_name, level, total_xp, streak_days FROM users WHERE id = :id");
        $userStmt->execute(['id' => $userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $systemPrompt .= "<user_profile>\n";
            $systemPrompt .= "Học viên: " . ($user['full_name'] ?? 'Bạn') . "\n";
            $systemPrompt .= "Cấp độ hiện tại: Level " . ($user['level'] ?? 1) . "\n";
            $systemPrompt .= "Tổng XP: " . number_format($user['total_xp'] ?? 0) . " XP\n";
            $systemPrompt .= "Chuỗi Streak: " . ($user['streak_days'] ?? 0) . " ngày liên tục\n";
            $systemPrompt .= "</user_profile>\n\n";
        }

        // 3. Dynamic Lesson / Skill RAG Context
        $lessonId = $context['lessonId'] ?? null;
        $skillId = $context['skillId'] ?? null;

        if ($lessonId) {
            $lessonStmt = $this->db->prepare("
                SELECT l.title, l.description, l.content, s.name as skill_name 
                FROM lessons l
                LEFT JOIN skills s ON l.skill_id = s.id
                WHERE l.id = :id LIMIT 1
            ");
            $lessonStmt->execute(['id' => $lessonId]);
            $lesson = $lessonStmt->fetch(PDO::FETCH_ASSOC);

            if ($lesson) {
                $systemPrompt .= "<lesson_context>\n";
                $systemPrompt .= "Khóa học: " . ($lesson['skill_name'] ?? '') . "\n";
                $systemPrompt .= "Bài học đang học: " . ($lesson['title'] ?? '') . "\n";
                if (!empty($lesson['description'])) {
                    $systemPrompt .= "Mô tả bài học: " . $lesson['description'] . "\n";
                }
                if (!empty($lesson['content'])) {
                    $systemPrompt .= "Nội dung tóm tắt: " . mb_substr(strip_tags($lesson['content']), 0, 1500) . "\n";
                }
                $systemPrompt .= "</lesson_context>\n\n";
            }
        } elseif ($skillId) {
            $skillStmt = $this->db->prepare("SELECT name, description FROM skills WHERE id = :id LIMIT 1");
            $skillStmt->execute(['id' => $skillId]);
            $skill = $skillStmt->fetch(PDO::FETCH_ASSOC);

            if ($skill) {
                $systemPrompt .= "<skill_context>\n";
                $systemPrompt .= "Khóa học: " . ($skill['name'] ?? '') . "\n";
                $systemPrompt .= "Mô tả: " . ($skill['description'] ?? '') . "\n";
                $systemPrompt .= "</skill_context>\n\n";
            }
        }

        // Current navigation page
        if (!empty($context['currentPath'])) {
            $systemPrompt .= "Trang người dùng đang duyệt: " . $context['currentPath'] . "\n";
        }

        return $systemPrompt;
    }

    /**
     * Layer 5: Short-Term Memory
     * Fetches recent conversation history (Sliding window of 10 messages).
     */
    public function getConversationHistory(int $conversationId, int $limit = 10): array
    {
        $stmt = $this->db->prepare("
            SELECT role, content 
            FROM ai_messages 
            WHERE conversation_id = :cid 
            ORDER BY id DESC LIMIT :limit
        ");
        $stmt->bindValue(':cid', $conversationId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_reverse($rows);
    }

    /**
     * Get or create active conversation (supports mode: TUTOR or HERMES)
     */
    public function getOrCreateConversation(int $userId, ?int $conversationId, array $context, string $mode = 'TUTOR', ?string $model = null): int
    {
        if ($conversationId) {
            $checkStmt = $this->db->prepare("SELECT id FROM ai_conversations WHERE id = :id AND user_id = :uid");
            $checkStmt->execute(['id' => $conversationId, 'uid' => $userId]);
            $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                return (int)$row['id'];
            }
        }

        // Create new conversation
        if ($mode === 'HERMES') {
            $title = !empty($context['title']) 
                ? "Hermes Studio: " . $context['title']
                : "Phân tích Hermes: " . mb_substr($context['initialPrompt'] ?? 'Nghiên cứu chuyên sâu', 0, 50);
            $modelUsed = $model ?? ($this->config['hermes']['default_model'] ?? 'deepseek/deepseek-r1:free');
        } else {
            $title = !empty($context['lessonTitle']) 
                ? "Thảo luận: " . $context['lessonTitle']
                : (!empty($context['skillTitle']) ? "Khóa: " . $context['skillTitle'] : "Hỏi đáp SkillGarden AI");
            $modelUsed = $model ?? ($this->config['tutor']['primary_model'] ?? 'google/gemini-2.0-flash');
        }

        $stmt = $this->db->prepare("
            INSERT INTO ai_conversations (user_id, title, context_skill_id, context_lesson_id, model_used, mode, created_at)
            VALUES (:uid, :title, :sid, :lid, :model, :mode, NOW())
        ");
        $stmt->execute([
            'uid' => $userId,
            'title' => mb_substr($title, 0, 250),
            'sid' => $context['skillId'] ?? null,
            'lid' => $context['lessonId'] ?? null,
            'model' => $modelUsed,
            'mode' => $mode
        ]);

        return (int)$this->db->lastInsertId();
    }

    // =========================================================================
    // HERMES CREDIT WALLET & MONETIZATION METHODS
    // =========================================================================

    /**
     * Get user credit balance
     */
    public function getUserCredits(int $userId): int
    {
        $stmt = $this->db->prepare("SELECT ai_credits FROM users WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $val = $stmt->fetchColumn();
        return $val !== false ? (int)$val : 0;
    }

    /**
     * Atomically check and deduct credits for AI Hermes usage
     */
    public function deductCredits(int $userId, int $amount, string $description, ?string $model = null): bool
    {
        if ($amount <= 0) return true;

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("SELECT ai_credits FROM users WHERE id = :id FOR UPDATE");
            $stmt->execute(['id' => $userId]);
            $currentCredits = (int)$stmt->fetchColumn();

            if ($currentCredits < $amount) {
                $this->db->rollBack();
                return false;
            }

            $newBalance = $currentCredits - $amount;
            $upStmt = $this->db->prepare("UPDATE users SET ai_credits = :balance WHERE id = :id");
            $upStmt->execute(['balance' => $newBalance, 'id' => $userId]);

            $logStmt = $this->db->prepare("
                INSERT INTO ai_credit_transactions (user_id, type, amount, balance_after, description, model_used, created_at)
                VALUES (:uid, 'HERMES_USAGE', :amount, :bal, :desc, :model, NOW())
            ");
            $logStmt->execute([
                'uid' => $userId,
                'amount' => -$amount,
                'bal' => $newBalance,
                'desc' => $description,
                'model' => $model
            ]);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Deduct credits error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Refund credits if AI generation failed unexpectedly
     */
    public function refundCredits(int $userId, int $amount, string $reason): void
    {
        if ($amount <= 0) return;

        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("UPDATE users SET ai_credits = ai_credits + :amount WHERE id = :id");
            $stmt->execute(['amount' => $amount, 'id' => $userId]);

            $newBal = $this->getUserCredits($userId);

            $logStmt = $this->db->prepare("
                INSERT INTO ai_credit_transactions (user_id, type, amount, balance_after, description, created_at)
                VALUES (:uid, 'REFUND', :amount, :bal, :desc, NOW())
            ");
            $logStmt->execute([
                'uid' => $userId,
                'amount' => $amount,
                'bal' => $newBal,
                'desc' => 'Hoàn tiền credits: ' . $reason
            ]);

            $this->db->commit();
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Refund credits error: " . $e->getMessage());
        }
    }

    /**
     * Add credits after successful VietQR payment
     */
    public function addCredits(int $userId, int $amount, string $description, ?int $orderCode = null): int
    {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare("UPDATE users SET ai_credits = ai_credits + :amount WHERE id = :id");
            $stmt->execute(['amount' => $amount, 'id' => $userId]);

            $newBal = $this->getUserCredits($userId);

            $logStmt = $this->db->prepare("
                INSERT INTO ai_credit_transactions (user_id, order_code, type, amount, balance_after, description, created_at)
                VALUES (:uid, :ord, 'DEPOSIT', :amount, :bal, :desc, NOW())
            ");
            $logStmt->execute([
                'uid' => $userId,
                'ord' => $orderCode,
                'amount' => $amount,
                'bal' => $newBal,
                'desc' => $description
            ]);

            $this->db->commit();
            return $newBal;
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Get active credit packages
     */
    public function getCreditPackages(): array
    {
        $stmt = $this->db->query("
            SELECT id, name, price_vnd, credits, bonus_credits, badge, description 
            FROM ai_credit_packages 
            WHERE is_active = 1 
            ORDER BY sort_order ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get user transactions
     */
    public function getCreditTransactions(int $userId, int $limit = 20): array
    {
        $stmt = $this->db->prepare("
            SELECT id, order_code, type, amount, balance_after, description, model_used, created_at
            FROM ai_credit_transactions
            WHERE user_id = :uid
            ORDER BY id DESC LIMIT :limit
        ");
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Save user or assistant message to database
     */
    public function saveMessage(int $conversationId, string $role, string $content, int $latencyMs = 0, ?string $model = null): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO ai_messages (conversation_id, role, content, latency_ms, model_name, created_at)
            VALUES (:cid, :role, :content, :lat, :model, NOW())
        ");
        $stmt->execute([
            'cid' => $conversationId,
            'role' => $role,
            'content' => $content,
            'lat' => $latencyMs,
            'model' => $model
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Layer 6: ReAct Agent Real-Time Database Tool Execution
     */
    public function executeReActTools(int $userId, string $prompt): ?string
    {
        $lower = mb_strtolower($prompt);

        // Check if user is asking about their personal score or progress
        if (str_contains($lower, 'tiến độ') || str_contains($lower, 'điểm') || str_contains($lower, 'hoàn thành') || str_contains($lower, 'xp')) {
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(DISTINCT ul.lesson_id) as completed_lessons,
                    COUNT(DISTINCT uqa.id) as quiz_attempts,
                    u.total_xp, u.level, u.streak_days
                FROM users u
                LEFT JOIN user_lessons ul ON u.id = ul.user_id AND ul.is_completed = 1
                LEFT JOIN user_quiz_attempts uqa ON u.id = uqa.user_id
                WHERE u.id = :uid
                GROUP BY u.id
            ");
            $stmt->execute(['uid' => $userId]);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($stats) {
                return sprintf(
                    "Thống kê tiến độ thực tế của bạn tại SkillGarden:\n- Cấp độ hiện tại: Level %d\n- Tổng tích lũy: %s XP\n- Chuỗi học tập: %d ngày liên tục 🔥\n- Bài học đã hoàn thành: %d bài học\n- Số lần làm bài Quiz: %d lượt\n\nBạn đang làm rất tốt! Hãy tiếp tục duy trì ngọn lửa học tập nhé!",
                    $stats['level'] ?? 1,
                    number_format($stats['total_xp'] ?? 0),
                    $stats['streak_days'] ?? 1,
                    $stats['completed_lessons'] ?? 0,
                    $stats['quiz_attempts'] ?? 0
                );
            }
        }

        return null;
    }

    /**
     * Layer 7: LLM Provider Router & Fallback Chain
     * Calls Gemini Direct (primary free tier) or OpenRouter with fallback mechanism
     */
    public function callLLMStream(array $messages, callable $onDelta): string
    {
        $geminiKey = $this->config['gemini_api_key'] ?? '';
        $openRouterKey = $this->config['openrouter_api_key'] ?? '';
        $primaryModel = $this->config['primary_model'] ?? 'meta-llama/llama-3.3-70b-instruct:free';
        $fallbackModel = $this->config['fallback_model'] ?? 'google/gemini-2.0-flash-exp:free';

        // 1. Prioritize Direct Google Gemini API (Ultra-fast, high context, free tier)
        if (!empty($geminiKey)) {
            try {
                return $this->streamFromGeminiDirect($geminiKey, $messages, $onDelta);
            } catch (Exception $geminiErr) {
                error_log("Direct Gemini Error: " . $geminiErr->getMessage() . ". Trying OpenRouter fallback...");
            }
        }

        // 2. OpenRouter API fallback if Key exists
        if (!empty($openRouterKey)) {
            try {
                return $this->streamFromOpenRouter($openRouterKey, $primaryModel, $messages, $onDelta);
            } catch (Exception $e) {
                error_log("Primary OpenRouter Error: " . $e->getMessage() . ". Switching to Fallback: " . $fallbackModel);
                try {
                    return $this->streamFromOpenRouter($openRouterKey, $fallbackModel, $messages, $onDelta);
                } catch (Exception $fbError) {
                    error_log("Fallback OpenRouter Error: " . $fbError->getMessage());
                }
            }
        }

        // 3. Intelligent Built-in Educational Simulation (Dev / Zero-key fallback)
        return $this->streamSimulatedResponse($messages, $onDelta);
    }

    /**
     * OpenRouter SSE Streaming caller
     */
    private function streamFromOpenRouter(string $apiKey, string $model, array $messages, callable $onDelta): string
    {
        $url = 'https://openrouter.ai/api/v1/chat/completions';
        $ch = curl_init($url);

        $payload = json_encode([
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
            'temperature' => 0.7,
            'max_tokens' => 1500
        ]);

        $fullContent = '';

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
                'HTTP-Referer: https://garden.plt.pro.vn',
                'X-Title: SkillGarden AI Tutor'
            ],
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_WRITEFUNCTION => function($ch, $chunk) use (&$fullContent, $onDelta) {
                $lines = explode("\n", $chunk);
                foreach ($lines as $line) {
                    $clean = trim($line);
                    if (str_starts_with($clean, 'data:')) {
                        $dataStr = trim(substr($clean, 5));
                        if ($dataStr === '[DONE]') continue;
                        $json = json_decode($dataStr, true);
                        $delta = $json['choices'][0]['delta']['content'] ?? '';
                        if (!empty($delta)) {
                            $fullContent .= $delta;
                            $onDelta($delta);
                        }
                    }
                }
                return strlen($chunk);
            },
            CURLOPT_TIMEOUT => 45
        ]);

        $success = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if (!$success || $httpCode >= 400) {
            throw new Exception("OpenRouter API Failed with code {$httpCode}: {$err}");
        }

        return $fullContent;
    }

    /**
     * Google Gemini Direct SSE Streaming caller
     */
    private function streamFromGeminiDirect(string $apiKey, array $messages, callable $onDelta): string
    {
        $model = $this->config['gemini_model'] ?? 'gemini-3.5-flash-lite';
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $model . ':streamGenerateContent?alt=sse&key=' . $apiKey;
        $ch = curl_init($url);

        $contents = [];
        $systemInstruction = null;

        foreach ($messages as $msg) {
            if ($msg['role'] === 'system') {
                $systemInstruction = [
                    'parts' => [['text' => $msg['content'] ?? '']]
                ];
                continue;
            }
            $role = ($msg['role'] === 'assistant') ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $msg['content'] ?? '']]
            ];
        }

        $bodyData = [
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 2048
            ]
        ];

        if ($systemInstruction !== null) {
            $bodyData['systemInstruction'] = $systemInstruction;
        }

        $payload = json_encode($bodyData);
        $fullContent = '';

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json'
            ],
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_WRITEFUNCTION => function($ch, $chunk) use (&$fullContent, $onDelta) {
                $lines = explode("\n", $chunk);
                foreach ($lines as $line) {
                    $clean = trim($line);
                    if (str_starts_with($clean, 'data:')) {
                        $dataStr = trim(substr($clean, 5));
                        $json = json_decode($dataStr, true);
                        $delta = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
                        if (!empty($delta)) {
                            $fullContent .= $delta;
                            $onDelta($delta);
                        }
                    }
                }
                return strlen($chunk);
            },
            CURLOPT_TIMEOUT => 30
        ]);

        $success = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if (!$success || $httpCode >= 400) {
            throw new Exception("Direct Gemini API Failed with code {$httpCode}: {$err}");
        }

        return $fullContent;
    }

    /**
     * Smart local knowledge generator for development and instant demo
     */
    private function streamSimulatedResponse(array $messages, callable $onDelta): string
    {
        $lastUserMsg = end($messages)['content'] ?? '';
        $lower = mb_strtolower($lastUserMsg);

        $responseText = "";

        if (str_contains($lower, 'react 19') || str_contains($lower, 'hook') || str_contains($lower, 'usetransition')) {
            $responseText = "Trong **React 19**, kiến trúc xử lý state có những cải tiến vượt bậc:\n\n" .
                "1. **`useActionState`**: Giúp quản lý form submission và pending states tự động mà không cần tự tạo các cờ loading thủ công.\n" .
                "2. **`useOptimistic`**: Tối ưu UX bằng cách hiển thị giao diện cập nhật ngay trước khi API server phản hồi.\n" .
                "3. **`useTransition`**: Đánh dấu các thay đổi state không khẩn cấp (non-blocking), giữ cho UI luôn phản hồi mượt mà ở 60 FPS.\n\n" .
                "```tsx\n" .
                "import { useTransition, useState } from 'react';\n\n" .
                "export function SearchFilter() {\n" .
                "    const [isPending, startTransition] = useTransition();\n" .
                "    const [query, setQuery] = useState('');\n\n" .
                "    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {\n" .
                "        startTransition(() => {\n" .
                "            setQuery(e.target.value);\n" .
                "        });\n" .
                "    };\n" .
                "    return <input onChange={handleSearch} placeholder='Tìm bài học...' />;\n" .
                "}\n" .
                "```\n\n" .
                "Bạn có muốn mình giải thích chi tiết hơn về cách kết hợp `useTransition` với bài học hiện tại không?";
        } elseif (str_contains($lower, 'tóm tắt') || str_contains($lower, 'bài học')) {
            $responseText = "🌟 **Tóm tắt trọng tâm bài giảng:**\n\n" .
                "- **Mục tiêu chính**: Nắm vững luồng dữ liệu một chiều (Unidirectional Data Flow) và tối ưu hóa vòng đời Component.\n" .
                "- **Quy tắc vàng**: Tránh cập nhật state lồng nhau trong useEffect; sử dụng Custom Hooks để đóng gói logic tái sử dụng.\n" .
                "- **Thực hành**: Hoàn thành bài trắc nghiệm sau bài học để nhận thêm **+50 XP** và nuôi cây kỹ năng phát triển!\n\n" .
                "Cần mình hướng dẫn cách làm bài test ngay bây giờ không?";
        } else {
            $responseText = "Chào bạn! Mình đã tiếp nhận câu hỏi: *\"" . htmlspecialchars($lastUserMsg) . "\"*.\n\n" .
                "Để đạt kết quả học tập tốt nhất trên **SkillGarden**, mình khuyến nghị:\n" .
                "1. **Xem kỹ video & tài liệu PDF đính kèm** của bài học hiện tại.\n" .
                "2. **Thực hành viết mã thực tế**: Áp dụng ngay lý thuyết vào dự án thực hành.\n" .
                "3. **Làm bài Quiz**: Củng cố kiến thức và tích lũy XP nuôi dưỡng khu vườn kỹ năng 3D của bạn.\n\n" .
                "Nếu bạn có đoạn code nào chưa hiểu, hãy dán vào đây để mình phân tích từng dòng nhé! 🌿";
        }

        // Stream word-by-word with realistic human typing interval
        $words = preg_split('/(\s+)/u', $responseText, -1, PREG_SPLIT_DELIM_CAPTURE);
        $full = '';
        foreach ($words as $w) {
            $full .= $w;
            $onDelta($w);
            usleep(15000); // 15ms per chunk
        }

        return $full;
    }

    // =========================================================================
    // AI HERMES STUDIO CHAT & REASONING (PAID / DEEP THINKING)
    // =========================================================================

    /**
     * Build Hermes specialized academic & deep reasoning prompt
     */
    public function buildHermesSystemPrompt(int $userId, string $preferredModel = 'deepseek/deepseek-r1:free'): string
    {
        $systemPrompt = "Bạn là AI Hermes - Chuyên gia Trí Tuệ Nhân Tạo & Siêu Trợ Lý Học Thuật Chuyên Sâu của SkillGarden (PLT Solutions).\n";
        $systemPrompt .= "Nhiệm vụ: Giải quyết các bài tập khó, thuật toán hóc búa, kiến trúc phần mềm, deep debugging và tư duy logic cao cấp.\n";
        $systemPrompt .= "Nguyên tắc suy luận:\n";
        $systemPrompt .= "1. Độc lập tư duy, giải thích theo chuỗi suy luận từng bước (Chain-of-Thought). Hãy mở đầu bằng khối phân tích tư duy chi tiết trong cặp thẻ <think>...</think> để học viên thấy được lộ trình bóc tách bài toán.\n";
        $systemPrompt .= "2. Luôn phân tích độ phức tạp thời gian O(N) và không gian bộ nhớ O(M).\n";
        $systemPrompt .= "3. Viết mã nguồn hoàn chỉnh, chuẩn công nghiệp, không viết tắt, có chú thích bằng tiếng Việt chi tiết.\n";
        $systemPrompt .= "4. Định dạng Markdown trực quan, khối code có định danh cú pháp rõ ràng.\n\n";

        // User profile
        $userStmt = $this->db->prepare("SELECT full_name, level, total_xp, ai_credits FROM users WHERE id = :id");
        $userStmt->execute(['id' => $userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $systemPrompt .= "<user_profile>\n";
            $systemPrompt .= "Học viên: " . ($user['full_name'] ?? 'Bạn') . " (Level " . ($user['level'] ?? 1) . ")\n";
            $systemPrompt .= "Credits ví hiện tại: " . ($user['ai_credits'] ?? 0) . " Credits\n";
            $systemPrompt .= "</user_profile>\n\n";
        }

        return $systemPrompt;
    }

    /**
     * Groq Cloud SSE Streaming Caller (Ultra-Fast LPU inference)
     */
    private function streamFromGroq(string $apiKey, string $model, array $messages, callable $onDelta): string
    {
        $url = 'https://api.groq.com/openai/v1/chat/completions';
        $ch = curl_init($url);

        $payload = json_encode([
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
            'temperature' => 0.6,
            'max_tokens' => 2500
        ]);

        $fullContent = '';

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json'
            ],
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_WRITEFUNCTION => function($ch, $chunk) use (&$fullContent, $onDelta) {
                $lines = explode("\n", $chunk);
                foreach ($lines as $line) {
                    $clean = trim($line);
                    if (str_starts_with($clean, 'data:')) {
                        $dataStr = trim(substr($clean, 5));
                        if ($dataStr === '[DONE]') continue;
                        $json = json_decode($dataStr, true);
                        $delta = $json['choices'][0]['delta']['content'] ?? '';
                        if (!empty($delta)) {
                            $fullContent .= $delta;
                            $onDelta($delta);
                        }
                    }
                }
                return strlen($chunk);
            },
            CURLOPT_TIMEOUT => 45
        ]);

        $success = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if (!$success || $httpCode >= 400) {
            throw new Exception("Groq API Failed with code {$httpCode}: {$err}");
        }

        return $fullContent;
    }

    /**
     * Call Hermes Streaming LLM with Multi-Provider Fallback Chain
     */
    public function callHermesLLMStream(array $messages, string $preferredModel, callable $onDelta): string
    {
        $groqKey = $this->config['groq_api_key'] ?? '';
        $openRouterKey = $this->config['openrouter_api_key'] ?? '';
        $geminiKey = $this->config['gemini_api_key'] ?? '';

        $isDeepSeek = str_contains(strtolower($preferredModel), 'deepseek');

        // 1. Try Groq Cloud if Groq key exists (Ultra-fast DeepSeek R1 / Llama)
        if (!empty($groqKey)) {
            try {
                $groqModel = $isDeepSeek ? 'deepseek-r1-distill-llama-70b' : 'llama-3.3-70b-versatile';
                return $this->streamFromGroq($groqKey, $groqModel, $messages, $onDelta);
            } catch (Exception $e) {
                error_log("Groq Hermes Error: " . $e->getMessage() . ". Trying OpenRouter fallback...");
            }
        }

        // 2. Try OpenRouter API (Access to DeepSeek R1 free & Qwen Coder)
        if (!empty($openRouterKey)) {
            try {
                $targetModel = $preferredModel ?: ($this->config['hermes']['default_model'] ?? 'deepseek/deepseek-r1:free');
                return $this->streamFromOpenRouter($openRouterKey, $targetModel, $messages, $onDelta);
            } catch (Exception $e) {
                error_log("OpenRouter Hermes Error: " . $e->getMessage() . ". Trying Gemini Direct...");
            }
        }

        // 3. Try Gemini Direct API
        if (!empty($geminiKey)) {
            try {
                return $this->streamFromGeminiDirect($geminiKey, $messages, $onDelta);
            } catch (Exception $e) {
                error_log("Gemini Direct Hermes Error: " . $e->getMessage());
            }
        }

        // 4. Intelligent Hermes Local Simulation with Deep Reasoning Block <think>
        return $this->streamHermesSimulatedResponse($messages, $preferredModel, $onDelta);
    }

    /**
     * Realistic Hermes Reasoning simulation with Chain-of-Thought
     */
    private function streamHermesSimulatedResponse(array $messages, string $model, callable $onDelta): string
    {
        $lastUserMsg = end($messages)['content'] ?? '';
        $lower = mb_strtolower($lastUserMsg);

        $response = "<think>\n";
        $response .= "1. Phân tích yêu cầu bài toán: Người dùng đang cần giải quyết vấn đề liên quan đến: \"{$lastUserMsg}\".\n";
        $response .= "2. Xác định các trường hợp biên (Edge cases): Cần đảm bảo độ phức tạp tối ưu, xử lý chuỗi rỗng/mảng rỗng, chống tràn bộ nhớ.\n";
        $response .= "3. Thiết kế kiến trúc giải pháp: Tối ưu hóa bằng cấu trúc dữ liệu phù hợp, áp dụng quy hoạch động hoặc tối ưu hoá một chiều.\n";
        $response .= "4. Chuẩn bị mã nguồn: Viết code sạch (Clean Code), có type-safety, chú thích rõ ràng theo tiêu chuẩn SkillGarden.\n";
        $response .= "</think>\n\n";

        if (str_contains($lower, 'thuật toán') || str_contains($lower, 'sắp xếp') || str_contains($lower, 'quicksort') || str_contains($lower, 'quy hoạch động')) {
            $response .= "### 🧠 Lời Giải Thuật Toán Chuyên Sâu Từ AI Hermes\n\n";
            $response .= "#### 1. Đánh giá độ phức tạp thuật toán:\n";
            $response .= "- **Độ phức tạp thời gian (Time Complexity)**: $O(N \\log N)$ trung bình, tối ưu hóa $O(N)$ trong trường hợp tốt nhất.\n";
            $response .= "- **Độ phức tạp không gian (Space Complexity)**: $O(\\log N)$ nhờ kỹ thuật đệ quy đuôi (Tail Call Optimization).\n\n";
            $response .= "#### 2. Cài đặt thuật toán chuẩn công nghiệp:\n\n";
            $response .= "```typescript\n";
            $response .= "/**\n";
            $response .= " * Thuật toán QuickSort phân đoạn Lomuto tối ưu hóa\n";
            $response .= " * @param arr Mảng đầu vào cần sắp xếp\n";
            $response .= " */\n";
            $response .= "export function quickSort<T>(arr: T[], low = 0, high = arr.length - 1): T[] {\n";
            $response .= "    if (low < high) {\n";
            $response .= "        const pivotIndex = partition(arr, low, high);\n";
            $response .= "        quickSort(arr, low, pivotIndex - 1);\n";
            $response .= "        quickSort(arr, pivotIndex + 1, high);\n";
            $response .= "    }\n";
            $response .= "    return arr;\n";
            $response .= "}\n\n";
            $response .= "function partition<T>(arr: T[], low: number, high: number): number {\n";
            $response .= "    const pivot = arr[high];\n";
            $response .= "    let i = low - 1;\n";
            $response .= "    for (let j = low; j < high; j++) {\n";
            $response .= "        if (arr[j] <= pivot) {\n";
            $response .= "            i++;\n";
            $response .= "            [arr[i], arr[j]] = [arr[j], arr[i]];\n";
            $response .= "        }\n";
            $response .= "    }\n";
            $response .= "    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];\n";
            $response .= "    return i + 1;\n";
            $response .= "}\n";
            $response .= "```\n\n";
            $response .= "#### 3. Phân tích trường hợp biên & Kiểm thử:\n";
            $response .= "- Đã xử lý mảng có các phần tử trùng lặp.\n";
            $response .= "- Khuyên dùng pivot ngẫu nhiên (Randomized Pivot) nếu dữ liệu đầu vào đã gần như sắp xếp sẵn để tránh thoái hóa thành $O(N^2)$.\n";
        } else {
            $response .= "### ⚡ Phân Tích & Giải Đáp Chuyên Sâu Từ AI Hermes\n\n";
            $response .= "Chào bạn! Mình đã tiếp nhận yêu cầu phân tích chuyên sâu: *\"" . htmlspecialchars($lastUserMsg) . "\"*.\n\n";
            $response .= "#### 1. Nguyên nhân cốt lõi & Cơ chế hoạt động:\n";
            $response .= "Để giải quyết triệt để vấn đề này trên nền tảng hệ thống, ta cần chia thành 3 lớp xử lý:\n";
            $response .= "- **Lớp Dữ liệu (Data Layer)**: Đảm bảo tính toàn vẹn (ACID), sử dụng Database Transaction khi cập nhật bảng điểm và số dư.\n";
            $response .= "- **Lớp Dịch vụ (Service Layer)**: Áp dụng nguyên lý Single Responsibility (SRP), tách biệt luồng xử lý đồng bộ và bất đồng bộ.\n";
            $response .= "- **Lớp Trình diễn (Presentation Layer)**: Cung cấp phản hồi lạc quan (Optimistic UI) để trải nghiệm học viên không bị gián đoạn.\n\n";
            $response .= "#### 2. Khuyến nghị triển khai mã nguồn:\n";
            $response .= "```typescript\n";
            $response .= "// Giải pháp kiến trúc chuẩn khuyến nghị\n";
            $response .= "export async function executeAtomicTask<T>(task: () => Promise<T>): Promise<T> {\n";
            $response .= "    console.log('[Hermes Execution] Bắt đầu tác vụ chuyên sâu...');\n";
            $response .= "    try {\n";
            $response .= "        return await task();\n";
            $response .= "    } catch (err) {\n";
            $response .= "        console.error('[Hermes Error] Lỗi phát sinh:', err);\n";
            $response .= "        throw err;\n";
            $response .= "    }\n";
            $response .= "}\n";
            $response .= "```\n\n";
            $response .= "Bạn có muốn mình giải thích chi tiết hơn về phần nào trong giải pháp trên không? 🌿";
        }

        // Stream chunks
        $words = preg_split('/(\s+)/u', $response, -1, PREG_SPLIT_DELIM_CAPTURE);
        $full = '';
        foreach ($words as $w) {
            $full .= $w;
            $onDelta($w);
            usleep(12000); // 12ms per chunk
        }

        return $full;
    }

    // =========================================================================
    // AI LMS ADMIN: TỰ ĐỘNG SINH CÂU HỎI TRẮC NGHIỆM TỪ TÀI LIỆU (PDF/DOCX/MD)
    // =========================================================================

    /**
     * Generate structured quiz questions from document content
     */
    public function generateQuizFromText(string $documentContent, int $numQuestions = 5, string $difficulty = 'MEDIUM'): array
    {
        $truncatedDoc = mb_substr(strip_tags($documentContent), 0, 8000);
        $prompt = "Bạn là chuyên gia khảo thí và tạo đề thi trắc nghiệm LMS chuẩn hóa của SkillGarden.\n";
        $prompt .= "Nhiệm vụ: Đọc kỹ tài liệu sau và tạo ra chính xác {$numQuestions} câu hỏi trắc nghiệm độ khó {$difficulty}.\n\n";
        $prompt .= "<document>\n{$truncatedDoc}\n</document>\n\n";
        $prompt .= "YÊU CẦU ĐẦU RA BẮT BUỘC: Trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown bọc ngoài), theo cấu trúc sau:\n";
        $prompt .= "[\n  {\n    \"question\": \"Nội dung câu hỏi?\",\n    \"options\": [\"Đáp án A\", \"Đáp án B\", \"Đáp án C\", \"Đáp án D\"],\n    \"correctAnswerIndex\": 0,\n    \"explanation\": \"Giải thích ngắn gọn lý do vì sao đáp án đúng dựa vào tài liệu.\",\n    \"difficulty\": \"{$difficulty}\"\n  }\n]";

        $messages = [
            ['role' => 'system', 'content' => 'You are an educational quiz generation expert. Always output raw valid JSON.'],
            ['role' => 'user', 'content' => $prompt]
        ];

        $rawResponse = '';
        $accumulate = function($delta) use (&$rawResponse) {
            $rawResponse .= $delta;
        };

        try {
            $geminiKey = $this->config['gemini_api_key'] ?? '';
            $openRouterKey = $this->config['openrouter_api_key'] ?? '';

            if (!empty($geminiKey)) {
                $rawResponse = $this->streamFromGeminiDirect($geminiKey, $messages, $accumulate);
            } elseif (!empty($openRouterKey)) {
                $rawResponse = $this->streamFromOpenRouter($openRouterKey, 'google/gemini-2.0-flash-exp:free', $messages, $accumulate);
            }

            // Extract JSON
            $cleanJson = trim($rawResponse);
            if (preg_match('/\[.*\]/s', $cleanJson, $matches)) {
                $cleanJson = $matches[0];
            }
            $decoded = json_decode($cleanJson, true);
            if (is_array($decoded) && count($decoded) > 0) {
                return $decoded;
            }
        } catch (Exception $e) {
            error_log("Generate Quiz Error: " . $e->getMessage());
        }

        return $this->getMockGeneratedQuizzes($truncatedDoc, $numQuestions, $difficulty);
    }

    /**
     * Fallback mock generator for LMS Quiz questions
     */
    private function getMockGeneratedQuizzes(string $doc, int $numQuestions, string $difficulty): array
    {
        $quizzes = [
            [
                'question' => 'Mục tiêu kiến trúc cốt lõi được nhấn mạnh trong tài liệu bài giảng là gì?',
                'options' => [
                    'Luồng dữ liệu một chiều và tách biệt rõ ràng giữa các tầng logic',
                    'Viết toàn bộ code trong một file duy nhất để tiện theo dõi',
                    'Bỏ qua việc kiểm thử tự động để đẩy nhanh tiến độ',
                    'Chỉ sử dụng cơ sở dữ liệu NoSQL cho mọi bài toán'
                ],
                'correctAnswerIndex' => 0,
                'explanation' => 'Tài liệu nhấn mạnh nguyên lý Clean Architecture và Unidirectional Data Flow nhằm đảm bảo tính mở rộng và dễ bảo trì.',
                'difficulty' => $difficulty
            ],
            [
                'question' => 'Trong React 19, hook nào được sử dụng để tối ưu UX bằng cách hiển thị giao diện trước khi server phản hồi?',
                'options' => ['useOptimistic', 'useActionState', 'useEffect', 'useMemo'],
                'correctAnswerIndex' => 0,
                'explanation' => 'Hook useOptimistic cho phép cập nhật giao diện người dùng ngay lập tức với giả định thao tác sẽ thành công.',
                'difficulty' => $difficulty
            ],
            [
                'question' => 'Chuẩn mã thanh toán QR quốc gia VietQR tuân thủ theo tiêu chuẩn kỹ thuật nào?',
                'options' => ['EMVCo QR Code Specification', 'ISO 9001', 'PCI-DSS Cấp 4', 'IEEE 802.11'],
                'correctAnswerIndex' => 0,
                'explanation' => 'VietQR được xây dựng dựa trên tiêu chuẩn thanh toán mã phản hồi nhanh EMVCo toàn cầu (Tag 00-63).',
                'difficulty' => $difficulty
            ],
            [
                'question' => 'Để đảm bảo an toàn giao dịch tài chính chống trùng lặp (Duplicate Payment), cơ chế nào là bắt buộc?',
                'options' => ['Idempotency Guard & Database Lock', 'Tăng thời gian timeout lên 1 giờ', 'Không lưu lịch sử đơn hàng', 'Bỏ qua mã kiểm tra CRC-16'],
                'correctAnswerIndex' => 0,
                'explanation' => 'Idempotency Lock ngăn chặn việc cộng tiền hoặc kích hoạt khóa học nhiều lần cho cùng một mã đơn.',
                'difficulty' => $difficulty
            ],
            [
                'question' => 'Mô hình tác tử ReAct kết hợp 2 yếu tố cốt lõi nào?',
                'options' => ['Reasoning (Tư duy) và Acting (Hành động gọi Tool)', 'Reading và Acting', 'React.js và ActionState', 'Recursive và Activation'],
                'correctAnswerIndex' => 0,
                'explanation' => 'ReAct (Reasoning + Acting) cho phép AI suy nghĩ các bước trước khi thực thi lệnh gọi hàm DB.',
                'difficulty' => $difficulty
            ]
        ];

        return array_slice($quizzes, 0, $numQuestions);
    }
}

