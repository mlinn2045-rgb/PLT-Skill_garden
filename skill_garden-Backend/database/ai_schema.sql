-- ===================================================================
-- SKILLGARDEN AI HERMES SCHEMA MIGRATION
-- Compliant with AI_AND_PAYMENT_ARCHITECTURE_SPEC.md
-- ===================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. AI CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS `ai_conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL DEFAULT 'Trò chuyện cùng AI Tutor',
  `context_skill_id` INT NULL DEFAULT NULL,
  `context_lesson_id` INT NULL DEFAULT NULL,
  `model_used` VARCHAR(100) NOT NULL DEFAULT 'google/gemini-2.5-flash',
  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ai_conv_user` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. AI MESSAGES TABLE
CREATE TABLE IF NOT EXISTS `ai_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `role` ENUM('user', 'assistant', 'system', 'tool') NOT NULL,
  `content` MEDIUMTEXT NOT NULL,
  `tool_calls` JSON NULL DEFAULT NULL,
  `tool_call_id` VARCHAR(100) NULL DEFAULT NULL,
  `token_count` INT NOT NULL DEFAULT 0,
  `latency_ms` INT NOT NULL DEFAULT 0,
  `model_name` VARCHAR(100) NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ai_msg_conv` (`conversation_id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. AI SEMANTIC CACHE TABLE (Layer 2: Semantic Cache)
CREATE TABLE IF NOT EXISTS `ai_semantic_cache` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prompt_hash` VARCHAR(64) NOT NULL UNIQUE,
  `prompt_text` TEXT NOT NULL,
  `response_text` MEDIUMTEXT NOT NULL,
  `embedding` JSON NULL DEFAULT NULL,
  `hit_count` INT NOT NULL DEFAULT 1,
  `last_hit_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_prompt_hash` (`prompt_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. AI USER ADAPTIVE PROFILE TABLE (Layer 5: Memory System)
CREATE TABLE IF NOT EXISTS `ai_user_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `learning_style` VARCHAR(50) NOT NULL DEFAULT 'visual',
  `strengths` JSON NULL DEFAULT NULL,
  `weaknesses` JSON NULL DEFAULT NULL,
  `recommended_pace` VARCHAR(50) NOT NULL DEFAULT 'normal',
  `summary_notes` TEXT NULL DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. AI MESSAGE FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS `ai_feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `message_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` TINYINT NOT NULL, -- 1: Hài lòng (Thumb Up), -1: Không hài lòng (Thumb Down)
  `comment` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_fb_msg` (`message_id`),
  INDEX `idx_fb_user` (`user_id`),
  FOREIGN KEY (`message_id`) REFERENCES `ai_messages`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. AI CREDIT PACKAGES TABLE (Hermes Nạp Tiền VietQR)
CREATE TABLE IF NOT EXISTS `ai_credit_packages` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `price_vnd` INT NOT NULL,
  `credits` INT NOT NULL,
  `bonus_credits` INT NOT NULL DEFAULT 0,
  `badge` VARCHAR(50) NULL DEFAULT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. AI CREDIT TRANSACTIONS TABLE (Lịch sử biến động ví)
CREATE TABLE IF NOT EXISTS `ai_credit_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `order_code` BIGINT NULL DEFAULT NULL,
  `type` ENUM('DEPOSIT', 'HERMES_USAGE', 'BONUS_GRANT', 'REFUND') NOT NULL,
  `amount` INT NOT NULL, -- +600 hoặc -10
  `balance_after` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `model_used` VARCHAR(100) NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_trans_user` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default credit packages if empty
INSERT INTO `ai_credit_packages` (`id`, `name`, `price_vnd`, `credits`, `bonus_credits`, `badge`, `description`, `sort_order`)
VALUES 
  ('PKG_20K', 'Gói Hermes Khởi Động', 20000, 200, 0, 'Phổ biến', 'Thích hợp hỏi 20 - 40 bài tập khó hoặc phân tích code', 1),
  ('PKG_50K', 'Gói Hermes Siêu Trí Tuệ', 50000, 600, 100, 'Khuyên Dùng', 'Tặng thêm +100 Credits, mở khóa DeepSeek R1 & Qwen Coder Pro', 2),
  ('PKG_100K', 'Gói Hermes Chuyên Gia', 100000, 1500, 300, 'Tiết Kiệm 50%', 'Dành cho ôn thi đồ án, không giới hạn tốc độ suy luận', 3)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

SET FOREIGN_KEY_CHECKS = 1;

