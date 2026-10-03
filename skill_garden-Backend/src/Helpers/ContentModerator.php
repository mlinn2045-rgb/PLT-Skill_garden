<?php
// skill_garden-Backend/src/Helpers/ContentModerator.php
// Vietnamese & Multi-lingual Content Moderation and Safety Guardrail for SkillGarden AI

namespace App\Helpers;

class ContentModerator
{
    /**
     * Common vulgar, profane, or abusive patterns (regex).
     * Covers explicit Vietnamese cursing, teencode acronyms, and common English profanities.
     */
    private static array $patterns = [
        // Vietnamese explicit & teencode
        '/\b(đm|dm|dcm|đcm|đcl|dcl|vcl|vkl|vl|clgt|cc|đéo|đếch|đụ|đjt|địt|buồi|cặc|lồn|loz|con mẹ m|mẹ mày|con mẹ mày|mẹ kiếp|đĩ|phò|óc chó|súc vật|chó đẻ|thằng chó|đồ chó|bố láo)\b/iu',
        
        // Spaced out variations (e.g., "c o n  m ẹ  m", "đ . m")
        '/c\s*o\s*n\s*m\s*ẹ\s*m/iu',
        '/m\s*ẹ\s*m\s*à\s*y/iu',
        '/đ\s*[\.\s\-_]*m/iu',
        '/d\s*[\.\s\-_]*c\s*[\.\s\-_]*m/iu',
        '/v\s*[\.\s\-_]*c\s*[\.\s\-_]*l/iu',
        '/v\s*[\.\s\-_]*k\s*[\.\s\-_]*l/iu',
        '/đ\s*[\.\s\-_]*ụ/iu',
        '/đ\s*[\.\s\-_]*ị\s*t/iu',
        '/b\s*u\s*ồ\s*i/iu',
        '/c\s*ặ\s*c/iu',
        '/l\s*ồ\s*n/iu',
        '/ó\s*c\s*c\s*h\s*ó/iu',

        // English swear words
        '/\b(fuck|fucking|fucker|shit|bitch|asshole|cunt|dick|pussy|bastard|motherfucker)\b/iu'
    ];

    /**
     * Check if user message contains inappropriate, vulgar, or offensive content.
     * 
     * @param string $text
     * @return array [
     *     'is_safe' => bool,
     *     'reason' => string|null,
     *     'warning_message' => string|null
     * ]
     */
    public static function check(string $text): array
    {
        $normalized = trim($text);

        if (empty($normalized)) {
            return [
                'is_safe' => true,
                'reason' => null,
                'warning_message' => null
            ];
        }

        foreach (self::$patterns as $pattern) {
            if (preg_match($pattern, $normalized)) {
                return [
                    'is_safe' => false,
                    'reason' => 'PROFANITY_DETECTED',
                    'warning_message' => "🌱 **Nhắc nhở học tập thân thiện**: Hệ thống AI SkillGarden được tạo ra nhằm hỗ trợ bạn học hỏi, trau dồi kỹ năng và giải đáp bài tập. Để cùng nhau xây dựng văn hóa học đường văn minh và tích cực, bạn vui lòng sử dụng ngôn từ lịch sự nhé!\n\nNếu bạn đang gặp khó khăn trong bài học hoặc có câu hỏi chuyên môn nào, hãy mô tả chi tiết để mình có thể đồng hành cùng bạn nhé! 😊"
                ];
            }
        }

        return [
            'is_safe' => true,
            'reason' => null,
            'warning_message' => null
        ];
    }
}
