-- Combined Database Initialization for SkillGarden Docker container
SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(100) NULL UNIQUE,
  `tag_id` VARCHAR(20) NULL,
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
  `permission_key` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_admin_permission` (`admin_id`, `permission_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. COURSES / SKILLS TABLE
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `category` VARCHAR(100) DEFAULT 'GENERAL',
  `level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER',
  `icon` VARCHAR(100) DEFAULT 'sprout',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED INITIAL ACCOUNTS
INSERT INTO `users` (`uuid`, `email`, `full_name`, `username`, `tag_id`, `password_hash`, `role`, `status`, `is_approved`)
VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@pltsolutions.com', 'SkillGarden Super Admin', 'skillgarden_super_admin', 'superadmin#1001', '$2y$10$stGwrsDbYVoebM8iRxWgY.UwYOSdMtzBW9BMhGYVcrA8qtL3PRLdy', 'SUPER_ADMIN', 'ACTIVE', 1),
('138d0711-38dd-4b7a-b5cd-cf36d69e0064', 'admin@skillgarden.com', 'SkillGarden Super Admin', 'skillgarden_admin', 'adminmaster#1002', '$2y$10$l2oApCgf.4pAMBHM3xwCfuWQEW.HQ/XPtJ5rt1He1a62s2zw6A2Vm', 'SUPER_ADMIN', 'ACTIVE', 1),
('22222222-2222-2222-2222-222222222222', 'lms.admin@pltsolutions.com', 'SkillGarden LMS Admin', 'lms_admin', 'lmsadmin#1003', '$2y$10$KSOSbPOJCio32MMZfuF.oed9x3Vd6lfVX5ySzBqymDeIerItInMaO', 'ADMIN', 'ACTIVE', 1),
('33333333-3333-3333-3333-333333333333', 'user_khoa@pltsolutions.com', 'Nguyễn Anh Khoa', 'user_khoa', 'userkhoa#1004', '$2y$10$Lm7Oyory6AriRjfDMOFgo.zzoargUHVFATIZjXk6DkvgJ8srEwot2', 'USER', 'ACTIVE', 1)
ON DUPLICATE KEY UPDATE `is_approved` = 1, `status` = 'ACTIVE';
