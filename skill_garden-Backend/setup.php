<?php
header('Content-Type: text/html; charset=utf-8');

try {
    $bootstrapPath = __DIR__ . '/config/bootstrap.php';
    if (!file_exists($bootstrapPath)) {
        $bootstrapPath = __DIR__ . '/../config/bootstrap.php';
    }
    require_once $bootstrapPath;

    $db = Database::getConnection();

    // 1. Seed / Update User Accounts
    $accounts = [
        [
            'email' => 'lms.admin@pltsolutions.com',
            'full_name' => 'SkillGarden LMS Admin',
            'username' => 'lms_admin',
            'role' => 'ADMIN',
            'pass' => 'admin123'
        ],
        [
            'email' => 'admin@pltsolutions.com',
            'full_name' => 'SkillGarden Super Admin',
            'username' => 'skillgarden_super_admin',
            'role' => 'SUPER_ADMIN',
            'pass' => 'admin123'
        ],
        [
            'email' => 'user_khoa@pltsolutions.com',
            'full_name' => 'Nguyễn Anh Khoa',
            'username' => 'user_khoa',
            'role' => 'USER',
            'pass' => '123456'
        ]
    ];

    foreach ($accounts as $acc) {
        $hash = password_hash($acc['pass'], PASSWORD_BCRYPT, ['cost' => 10]);
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $acc['email']]);
        $existing = $stmt->fetch();

        if ($existing) {
            $up = $db->prepare("UPDATE users SET password_hash = :hash, is_approved = 1, status = 'ACTIVE', failed_login_attempts = 0, locked_until = NULL WHERE email = :email");
            $up->execute(['hash' => $hash, 'email' => $acc['email']]);
        } else {
            $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
            $ins = $db->prepare("INSERT INTO users (uuid, email, full_name, username, tag_id, password_hash, role, status, is_approved) VALUES (:uuid, :email, :full_name, :username, :tag_id, :password_hash, :role, 'ACTIVE', 1)");
            $ins->execute([
                'uuid' => $uuid,
                'email' => $acc['email'],
                'full_name' => $acc['full_name'],
                'username' => $acc['username'],
                'tag_id' => $acc['username'] . '#001',
                'password_hash' => $hash,
                'role' => $acc['role']
            ]);
        }
    }

    // 2. Seed Skills (1 to 6)
    $skillsData = [
        [1, 'Frontend React 19 Mastery', 'frontend-react-19', 'Frontend'],
        [2, 'Backend NestJS & Node.js System', 'backend-nestjs-nodejs', 'Backend'],
        [3, 'Database SQL & MySQL Architect', 'database-sql-mysql', 'Database'],
        [4, 'Python & Data Analysis Core', 'python-data-analysis', 'Data'],
        [5, 'Manual & Automation Testing', 'software-testing-qa', 'QA'],
        [6, 'Flutter & React Native Mobile', 'mobile-flutter-react-native', 'Mobile'],
    ];

    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");

    foreach ($skillsData as $sk) {
        $stmt = $db->prepare("INSERT INTO skills (id, title, slug, category, status) VALUES (:id, :title, :slug, :cat, 'ACTIVE') ON DUPLICATE KEY UPDATE title = VALUES(title)");
        $stmt->execute(['id' => $sk[0], 'title' => $sk[1], 'slug' => $sk[2], 'cat' => $sk[3]]);

        $stmtLp = $db->prepare("INSERT INTO learning_paths (id, skill_id, title) VALUES (:id, :skill_id, :title) ON DUPLICATE KEY UPDATE title = VALUES(title)");
        $stmtLp->execute(['id' => $sk[0], 'skill_id' => $sk[0], 'title' => 'Lộ trình ' . $sk[1]]);
    }

    // 3. Seed Modules
    $modulesData = [
        // Skill 1
        [1, 1, 'Chặng 01: Nền tảng Web Hiện đại (Modern Semantic HTML5 & CSS3)', 1],
        [2, 1, 'Chặng 02: React 19, Hooks & Quản lý trạng thái', 2],
        [3, 1, 'Chặng 03: Server Components, Next.js & Tối ưu UX', 3],
        // Skill 2
        [4, 2, 'Chặng 01: Kiến thức nền tảng Backend & Express', 1],
        [5, 2, 'Chặng 02: NestJS Core & Kiến trúc Backend', 2],
        [6, 2, 'Chặng 03: Microservices, Queues & Triển khai Hệ thống', 3],
        // Skill 3
        [7, 3, 'Chặng 01: SQL Fundamentals & Database Design', 1],
        [8, 3, 'Chặng 02: SQL Chuyên sâu & Thiết kế Dữ liệu', 2],
        [9, 3, 'Chặng 03: Database Architecture & High Availability', 3],
        // Skill 4
        [10, 4, 'Chặng 01: Lập trình Python cơ bản & Cấu trúc dữ liệu', 1],
        [11, 4, 'Chặng 02: Python Core & Xử lý Dữ liệu với Pandas', 2],
        [12, 4, 'Chặng 03: Trực quan hóa Dữ liệu & Machine Learning Foundation', 3],
        // Skill 5
        [13, 5, 'Chặng 01: QA Fundamentals & Test Case Design', 1],
        [14, 5, 'Chặng 02: Manual Testing & Test Design', 2],
        [15, 5, 'Chặng 03: Playwright Automation & CI Testing', 3],
        // Skill 6
        [16, 6, 'Chặng 01: Mobile UI & Cross-platform Fundamentals', 1],
        [17, 6, 'Chặng 02: Mobile State Management & API Integration', 2],
        [18, 6, 'Chặng 03: Navigation, Native Modules & App Store Release', 3],
    ];

    foreach ($modulesData as $mod) {
        $stmtMod = $db->prepare("INSERT INTO modules (id, learning_path_id, title, order_index) VALUES (:id, :lp_id, :title, :order_index) ON DUPLICATE KEY UPDATE title = VALUES(title)");
        $stmtMod->execute(['id' => $mod[0], 'lp_id' => $mod[1], 'title' => $mod[2], 'order_index' => $mod[3]]);
    }

    // 4. Clear all sample lessons so Admin can add fresh lessons dynamically
    $db->exec("TRUNCATE TABLE user_lessons;");
    $db->exec("TRUNCATE TABLE user_lesson_notes;");
    $db->exec("TRUNCATE TABLE lessons;");

    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");

    echo "<h3>🎉 CLEARED ALL SAMPLE LESSONS SUCCESSFULLY! NOW DATABASE IS CLEAN FOR ADMIN TO ADD FRESH LESSONS!</h3>";

} catch (Exception $e) {
    echo "<h3 style='color:red;'>Lỗi: " . htmlspecialchars($e->getMessage()) . "</h3>";
}
