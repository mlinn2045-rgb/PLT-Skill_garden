-- ===================================================================
-- SKILLGARDEN COMPLETE DATABASE SCHEMA
-- Based on SRS_SkillTree_MLinn2045_ver1.0
-- Database: MySQL 8.x / MariaDB
-- Charset: utf8mb4_unicode_ci
-- ===================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(100) NULL UNIQUE,
  `tag_id` VARCHAR(50) NULL, -- e.g. AnhKhoa#1234
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(500) NULL DEFAULT NULL,
  `bio` TEXT NULL DEFAULT NULL,
  `role` ENUM('SUPER_ADMIN', 'ADMIN', 'USER') NOT NULL DEFAULT 'USER',
  `status` ENUM('ACTIVE', 'LOCKED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `is_approved` TINYINT(1) NOT NULL DEFAULT 0,
  `failed_login_attempts` INT NOT NULL DEFAULT 0,
  `locked_until` DATETIME NULL DEFAULT NULL,
  `level` INT NOT NULL DEFAULT 1,
  `total_xp` INT NOT NULL DEFAULT 0,
  `streak_days` INT NOT NULL DEFAULT 0,
  `has_claimed_welcome_xp` TINYINT(1) NOT NULL DEFAULT 0,
  `last_active_at` DATETIME NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_uuid` (`uuid`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ADMIN PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS `admin_permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NOT NULL,
  `permission_key` VARCHAR(100) NOT NULL, -- e.g. MANAGE_USERS, MANAGE_SKILLS, MANAGE_LESSONS, MANAGE_QUIZZES
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_admin_permission` (`admin_id`, `permission_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TOKEN BLACKLIST TABLE (For Logout Security)
CREATE TABLE IF NOT EXISTS `token_blacklist` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `token_hash` VARCHAR(64) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `blacklisted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PLANTS TABLE (Plant Types for Gamification)
CREATE TABLE IF NOT EXISTS `plants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL, -- Cây hoa anh đào, Cây cổ thụ, Cây tre, Cây xương rồng
  `code` VARCHAR(50) NOT NULL UNIQUE, -- FLOWER, TREE, BAMBOO, CACTUS, PINE, BONSAI
  `description` TEXT NULL,
  `icon_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PLANT STAGES TABLE (Plant Growth Phases)
CREATE TABLE IF NOT EXISTS `plant_stages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `plant_id` INT NOT NULL,
  `stage_level` INT NOT NULL, -- 1: Seed, 2: Sprout, 3: Sapling, 4: Mature, 5: Bloom
  `stage_name` VARCHAR(100) NOT NULL,
  `required_progress_percent` INT NOT NULL DEFAULT 0, -- 0%, 25%, 50%, 75%, 100%
  `image_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`plant_id`) REFERENCES `plants`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_plant_stage` (`plant_id`, `stage_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SKILLS TABLE (Courses catalog)
CREATE TABLE IF NOT EXISTS `skills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Development', -- Frontend, Backend, Database, Testing, AI
  `description` TEXT NULL,
  `icon_url` VARCHAR(500) NULL,
  `plant_id` INT NULL,
  `status` ENUM('ACTIVE', 'DRAFT', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `total_lessons` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`plant_id`) REFERENCES `plants`(`id`) ON DELETE SET NULL,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. LEARNING PATHS TABLE
CREATE TABLE IF NOT EXISTS `learning_paths` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `skill_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `order_index` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. MODULES TABLE (Chapters within a Learning Path)
CREATE TABLE IF NOT EXISTS `modules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `learning_path_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `order_index` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`learning_path_id`) REFERENCES `learning_paths`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. LESSONS TABLE (Video/Theory/Quiz Lessons)
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `module_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `content_type` ENUM('VIDEO', 'PDF', 'QUIZ', 'TEXT') NOT NULL DEFAULT 'VIDEO',
  `video_url` VARCHAR(500) NULL,
  `video_duration_seconds` INT NOT NULL DEFAULT 0,
  `theory_content` LONGTEXT NULL,
  `code_example` TEXT NULL,
  `xp_reward` INT NOT NULL DEFAULT 50,
  `growth_impact_percent` FLOAT NOT NULL DEFAULT 5.0,
  `order_index` INT NOT NULL DEFAULT 1,
  `is_required` TINYINT(1) NOT NULL DEFAULT 1,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE CASCADE,
  INDEX `idx_module_order` (`module_id`, `order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. LESSON MATERIALS TABLE (PDF / Downloadable Resources)
CREATE TABLE IF NOT EXISTS `lesson_materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT NULL,
  `skill_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL DEFAULT 'pdf', -- pdf, zip, slide, doc
  `file_size_bytes` BIGINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT NULL,
  `skill_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `passing_score_percent` INT NOT NULL DEFAULT 80,
  `time_limit_minutes` INT NOT NULL DEFAULT 15,
  `xp_reward` INT NOT NULL DEFAULT 100,
  `max_attempts` INT NOT NULL DEFAULT 0, -- 0 = unlimited
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. QUESTIONS TABLE (Quiz Bank)
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NULL,
  `skill_id` INT NULL,
  `question_text` TEXT NOT NULL,
  `question_type` ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK') NOT NULL DEFAULT 'SINGLE_CHOICE',
  `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
  `explanation` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. QUESTION OPTIONS TABLE
CREATE TABLE IF NOT EXISTS `question_options` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question_id` INT NOT NULL,
  `option_text` TEXT NOT NULL,
  `is_correct` TINYINT(1) NOT NULL DEFAULT 0,
  `order_index` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. USER SKILLS PROGRESS TABLE
CREATE TABLE IF NOT EXISTS `user_skills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `skill_id` INT NOT NULL,
  `progress_percent` FLOAT NOT NULL DEFAULT 0.0,
  `status` ENUM('IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'IN_PROGRESS',
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_user_skill` (`user_id`, `skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. USER GARDEN TREES TABLE (Digital Garden)
CREATE TABLE IF NOT EXISTS `user_garden_trees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `skill_id` INT NOT NULL,
  `plant_id` INT NOT NULL,
  `current_stage_id` INT NULL,
  `tree_name` VARCHAR(100) NULL,
  `level` INT NOT NULL DEFAULT 1,
  `xp_accumulated` INT NOT NULL DEFAULT 0,
  `status` ENUM('GROWING', 'NEEDS_CARE', 'MATURE') NOT NULL DEFAULT 'GROWING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plant_id`) REFERENCES `plants`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`current_stage_id`) REFERENCES `plant_stages`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_user_garden_skill` (`user_id`, `skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. USER LESSONS PROGRESS & NOTES
CREATE TABLE IF NOT EXISTS `user_lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `lesson_id` INT NOT NULL,
  `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'NOT_STARTED',
  `video_watch_seconds` INT NOT NULL DEFAULT 0,
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `completed_at` DATETIME NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_user_lesson` (`user_id`, `lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_lesson_notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `lesson_id` INT NOT NULL,
  `timestamp_seconds` INT NOT NULL DEFAULT 0,
  `note_text` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. USER QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS `user_quiz_attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `quiz_id` INT NOT NULL,
  `score` FLOAT NOT NULL DEFAULT 0.0,
  `total_questions` INT NOT NULL DEFAULT 0,
  `correct_answers` INT NOT NULL DEFAULT 0,
  `passed` TINYINT(1) NOT NULL DEFAULT 0,
  `xp_earned` INT NOT NULL DEFAULT 0,
  `attempt_duration_seconds` INT NOT NULL DEFAULT 0,
  `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. ACHIEVEMENTS & QUESTS
CREATE TABLE IF NOT EXISTS `achievements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `badge_icon_url` VARCHAR(500) NULL,
  `condition_type` VARCHAR(100) NOT NULL, -- e.g. COMPLETE_LESSON_1, COMPLETE_SKILL_1, REACH_LEVEL_5
  `condition_value` INT NOT NULL DEFAULT 1,
  `xp_reward` INT NOT NULL DEFAULT 200,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_achievements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `achievement_id` INT NOT NULL,
  `unlocked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `daily_quests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `quest_type` ENUM('DAILY', 'WEEKLY') NOT NULL DEFAULT 'DAILY',
  `target_count` INT NOT NULL DEFAULT 1,
  `xp_reward` INT NOT NULL DEFAULT 50,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_quests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `quest_id` INT NOT NULL,
  `current_count` INT NOT NULL DEFAULT 0,
  `is_claimed` TINYINT(1) NOT NULL DEFAULT 0,
  `quest_date` DATE NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`quest_id`) REFERENCES `daily_quests`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_user_quest_date` (`user_id`, `quest_id`, `quest_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. AUDIT LOGS & SYSTEM CONFIGS
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_entity` VARCHAR(100) NULL,
  `target_id` INT NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(100) NOT NULL UNIQUE,
  `config_value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- INITIAL SEED DATA (SUPER ADMIN & SAMPLE PLANTS)
-- ===================================================================

-- 1. Default Accounts (All accounts with tested & verified bcrypt hashes)
INSERT INTO `users` (`uuid`, `email`, `full_name`, `username`, `tag_id`, `password_hash`, `role`, `status`, `is_approved`, `level`, `total_xp`)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@pltsolutions.com', 'SkillGarden Super Admin', 'skillgarden_super_admin', 'SuperAdmin#0001', '$2y$10$stGwrsDbYVoebM8iRxWgY.UwYOSdMtzBW9BMhGYVcrA8qtL3PRLdy', 'SUPER_ADMIN', 'ACTIVE', 1, 99, 99999),
  ('138d0711-38dd-4b7a-b5cd-cf36d69e0064', 'admin@skillgarden.com', 'SkillGarden Super Admin', 'skillgarden_admin', 'SuperAdmin#0002', '$2y$10$l2oApCgf.4pAMBHM3xwCfuWQEW.HQ/XPtJ5rt1He1a62s2zw6A2Vm', 'SUPER_ADMIN', 'ACTIVE', 1, 99, 99999),
  ('22222222-2222-2222-2222-222222222222', 'lms.admin@pltsolutions.com', 'SkillGarden LMS Admin', 'lms_admin', 'LMSAdmin#0002', '$2y$10$KSOSbPOJCio32MMZfuF.oed9x3Vd6lfVX5ySzBqymDeIerItInMaO', 'ADMIN', 'ACTIVE', 1, 10, 5000),
  ('24e9995c-5b25-4ee0-9ad5-b7724d0b2e7b', 'baopq@skillgarden.com', 'Phạm Quốc Bảo', 'baopq_admin', 'LMSAdmin#0003', '$2y$10$1mwuBucaqqQS27/coJSwRuCxNgHilztlxViKSTvmQ7aQblAiJ9lA6', 'ADMIN', 'ACTIVE', 1, 15, 4500),
  ('33333333-3333-3333-3333-333333333333', 'user_khoa@pltsolutions.com', 'Nguyễn Anh Khoa', 'user_khoa', 'UserKhoa#0003', '$2y$10$Lm7Oyory6AriRjfDMOFgo.zzoargUHVFATIZjXk6DkvgJ8srEwot2', 'USER', 'ACTIVE', 1, 5, 1250),
  ('8095f557-6edc-4972-a3b9-a42487699e9e', 'anhkhoa@plt.com', 'Nguyễn Anh Khoa (PLT)', 'anhkhoa', 'UserKhoa#0004', '$2y$10$73FtVLHtgWfebqOwUsNv6.gWyMo4GF9OPu2uqX933HOqtj2WLvFqG', 'USER', 'ACTIVE', 1, 5, 1500),
  ('fa01ad1a-fe99-4f2f-add7-0cfd0e9c8527', 'anhkhoa.user@gmail.com', 'Nguyễn Anh Khoa', 'anhkhoa_dev', 'UserKhoa#0005', '$2y$10$.0fy0PN12KZ6Br4lVXdkgu9Uk6y2LSEYwyCGcawMsBW6HPP3vjaBS', 'USER', 'ACTIVE', 1, 5, 1250),
  ('f9700f14-e6cc-4ed5-bd16-a76ce6dc663d', 'nam.le@gmail.com', 'Lê Hoàng Nam', 'namle_backend', 'UserNam#0006', '$2y$10$hDk/EcILH.uYYX0kcWPZ0exxAfBoVf2f.5Ggdi1kiaog5.Pcl/wV2', 'USER', 'ACTIVE', 1, 3, 680),
  ('fcc276f1-7627-45a0-a8a8-c2f4e45f3da2', 'maitran@gmail.com', 'Trần Thị Mai', 'maitran99', 'UserMai#0007', '$2y$10$P57rK78tf6Ipwrk1gg8MtOjuxOn/B/r5QF6CqkRed/NKiixwj91K2', 'USER', 'ACTIVE', 0, 1, 100),
  ('2890a0cc-f463-41b1-8444-f894e164f354', 'tuanvm.pending@gmail.com', 'Vũ Minh Tuấn', 'tuanvm', 'UserTuan#0008', '$2y$10$Y6UoI.FOTcFm5wRgzPTCd.npvdsSCmKBnM2lOwjnR1oZwSBZfvoj6', 'USER', 'ACTIVE', 0, 1, 0)
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `is_approved` = VALUES(`is_approved`);

-- 2. Seed Sample Plants
INSERT INTO `plants` (`name`, `code`, `description`) VALUES
('Cây Hoa Anh Đào', 'FLOWER', 'Dành cho các kỹ năng Frontend Development'),
('Cây Cổ Thụ', 'TREE', 'Dành cho các kỹ năng Backend Development'),
('Cây Tre', 'BAMBOO', 'Dành cho các kỹ năng Database & SQL'),
('Cây Xương Rồng', 'CACTUS', 'Dành cho các kỹ năng Python & Data'),
('Cây Thông', 'PINE', 'Dành cho các kỹ năng Software Testing'),
('Cây Cảnh Bonsai', 'BONSAI', 'Dành cho các kỹ năng Java System')
ON DUPLICATE KEY UPDATE `id` = `id`;

-- 3. Seed Plant Stages (FLOWER)
INSERT INTO `plant_stages` (`plant_id`, `stage_level`, `stage_name`, `required_progress_percent`) VALUES
(1, 1, 'Hạt giống', 0),
(1, 2, 'Mầm non', 25),
(1, 3, 'Cây non', 50),
(1, 4, 'Cây trưởng thành', 75),
(1, 5, 'Nở hoa rực rỡ', 100)
ON DUPLICATE KEY UPDATE `id` = `id`;

-- 4. Seed Default Skills
INSERT INTO `skills` (`id`, `title`, `slug`, `category`, `status`) VALUES
(1, 'Frontend React 19 Mastery', 'frontend-react-19', 'Frontend', 'ACTIVE'),
(2, 'Backend Node.js & NestJS', 'backend-nodejs-nestjs', 'Backend', 'ACTIVE'),
(3, 'Python & Data Science', 'python-data-science', 'Data', 'ACTIVE'),
(4, 'SQL & Relational Database', 'sql-database', 'Database', 'ACTIVE'),
(5, 'DevOps & Cloud Infrastructure', 'devops-cloud', 'DevOps', 'ACTIVE'),
(6, 'Software Testing & QA Mastery', 'software-testing-qa', 'QA', 'ACTIVE')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 5. Seed Default Learning Paths
INSERT INTO `learning_paths` (`id`, `skill_id`, `title`, `description`) VALUES
(1, 1, 'Lộ trình Lập trình Frontend React 19 từ Zero đến Hero', 'Nắm vững kiến thức React 19, Components, Hooks và State Management.'),
(2, 2, 'Lộ trình Lập trình Backend Node.js & NestJS', 'Xây dựng RESTful API chuẩn doanh nghiệp.'),
(3, 3, 'Lộ trình Python & Data Science Thực Chiến', 'Phân tích dữ liệu và lập trình Python ứng dụng.'),
(4, 4, 'Lộ trình Quản trị Cơ sở Dữ liệu SQL', 'Thiết kế CSDL và truy vấn dữ liệu tối ưu.'),
(5, 5, 'Lộ trình DevOps & Docker/CI-CD', 'Quản trị hạ tầng và tự động hóa quy trình.'),
(6, 6, 'Lộ trình Kiểm thử Phần mềm Chuyên nghiệp QA', 'Unit testing, Integration testing và E2E testing.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 6. Seed Default Modules
INSERT INTO `modules` (`id`, `learning_path_id`, `title`, `description`, `order_index`) VALUES
(1, 1, 'Chương 1: Kiến thức cơ bản & React 19 Core', 'Các khái niệm nền tảng quan trọng của React 19.', 1),
(2, 1, 'Chương 2: Advanced Hooks & State Management', 'Quản lý state phức tạp và tối ưu render.', 2),
(3, 2, 'Chương 1: Kiến thức nền tảng Backend', 'Tổng quan về server và kiến trúc API.', 1),
(4, 3, 'Chương 1: Lập trình Python cơ bản', 'Cú pháp Python và cấu trúc dữ liệu.', 1),
(5, 4, 'Chương 1: SQL Fundamentals', 'Thiết kế bảng và truy vấn SELECT.', 1),
(6, 5, 'Chương 1: DevOps Basics', 'Khái niệm DevOps và Containerization.', 1),
(7, 6, 'Chương 1: QA Fundamentals', 'Quy trình kiểm thử phần mềm.', 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 7. Seed Default Lessons
INSERT INTO `lessons` (`id`, `module_id`, `title`, `slug`, `description`, `content_type`, `video_url`, `video_duration_seconds`, `xp_reward`, `order_index`, `is_published`) VALUES
(1, 1, '1. Giới thiệu tổng quan React 19 & Architecture', 'gioi-thieu-react-19', 'Bài học tổng quan về React 19, Virtual DOM và kiến trúc ứng dụng mới.', 'VIDEO', 'https://www.youtube.com/watch?v=s2skans2dP4', 900, 50, 1, 1),
(2, 1, '2. React Components, JSX & Props Deep Dive', 'react-components-props', 'Hướng dẫn xây dựng Functional Component, JSX syntax và giao tiếp dữ liệu qua Props.', 'VIDEO', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 1200, 50, 2, 1),
(3, 1, '3. State Management với useState & useReducer', 'state-management-usestate', 'Quản lý trạng thái giao diện UI mượt mà với useState và useReducer hook.', 'VIDEO', 'https://www.youtube.com/watch?v=0ZJgOiR4LUs', 1500, 50, 3, 1),
(4, 2, '4. Side Effects & Lifecycle với useEffect', 'side-effects-useeffect', 'Xử lý bất đồng bộ, call API và giải phóng bộ nhớ với useEffect hook.', 'VIDEO', 'https://www.youtube.com/watch?v=0ZJgOiR4LUs', 1800, 100, 1, 1)
-- 16. COURSE SYNC LOGS TABLE (Real-Time Synchronization & Rollback Audit)
CREATE TABLE IF NOT EXISTS `course_sync_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `action` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  `sync_status` ENUM('PENDING', 'SYNCED', 'FAILED') DEFAULT 'PENDING',
  `retry_count` INT DEFAULT 0,
  `error_message` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;


