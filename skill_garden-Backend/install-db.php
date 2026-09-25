<?php
// install-db.php - Automatic Database Schema & Users Seed Installer

header('Content-Type: text/html; charset=utf-8');

echo "<h2>🌱 SkillGarden - Automatic Database & Users Installer</h2>";

try {
    $configPath = __DIR__ . '/config/config.php';
    if (!file_exists($configPath)) {
        $configPath = __DIR__ . '/../config/config.php';
    }

    $config = require $configPath;
    $dbConfig = $config['db'];

    echo "<p>⏳ Connecting to Database <code>{$dbConfig['dbname']}</code> on <code>{$dbConfig['host']}</code>...</p>";

    $dsn = sprintf("mysql:host=%s;port=%s;dbname=%s;charset=%s", $dbConfig['host'], $dbConfig['port'], $dbConfig['dbname'], $dbConfig['charset']);
    $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    echo "<p style='color:green;'>✅ Database connection successful!</p>";

    $schemaFile = __DIR__ . '/database/schema.sql';
    if (!file_exists($schemaFile)) {
        $schemaFile = __DIR__ . '/../database/schema.sql';
    }

    if (!file_exists($schemaFile)) {
        throw new Exception("File schema.sql not found at path: {$schemaFile}");
    }

    echo "<p>⏳ Executing <code>schema.sql</code> script...</p>";
    $sql = file_get_contents($schemaFile);

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec($sql);

    // Auto-migrate schema updates for existing tables
    try {
        $checkCol = $pdo->query("SHOW COLUMNS FROM lesson_materials LIKE 'skill_id'");
        if ($checkCol->rowCount() === 0) {
            $pdo->exec("ALTER TABLE lesson_materials ADD COLUMN skill_id INT NULL AFTER lesson_id");
            $pdo->exec("ALTER TABLE lesson_materials ADD CONSTRAINT fk_lesson_materials_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE");
        }
        $pdo->exec("ALTER TABLE lesson_materials MODIFY COLUMN lesson_id INT NULL");

        $pdo->exec("
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
        ");
    } catch (Exception $ex) {
        // Log/ignore if already applied
    }

    // Now seed all accounts from users.json with valid bcrypt hashes
    $usersJsonFile = __DIR__ . '/database/users.json';
    if (!file_exists($usersJsonFile)) {
        $usersJsonFile = __DIR__ . '/../database/users.json';
    }

    if (file_exists($usersJsonFile)) {
        echo "<p>⏳ Seeding user accounts from <code>users.json</code>...</p>";
        $usersData = json_decode(file_get_contents($usersJsonFile), true);
        if (is_array($usersData)) {
            $userCount = 0;
            foreach ($usersData as $u) {
                $email = strtolower(trim($u['email'] ?? ''));
                if (empty($email))
                    continue;

                $fullName = $u['fullName'] ?? 'N/A';
                $username = $u['username'] ?? explode('@', $email)[0];
                $password = $u['password'] ?? 'admin123';
                $role = strtoupper($u['role'] ?? 'USER');
                $isApproved = !empty($u['isApproved']) ? 1 : 0;
                $level = (int) ($u['level'] ?? 1);
                $totalXp = (int) ($u['totalXp'] ?? 0);
                $streakDays = (int) ($u['streakDays'] ?? 0);
                $bio = $u['bio'] ?? null;
                $tagId = substr(ucfirst($username), 0, 44) . '#' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

                $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

                $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
                $stmtCheck->execute(['email' => $email]);
                $existing = $stmtCheck->fetch();

                if ($existing) {
                    $stmtUpdate = $pdo->prepare("
                        UPDATE users SET
                            full_name = :full_name,
                            username = :username,
                            password_hash = :password_hash,
                            role = :role,
                            is_approved = :is_approved,
                            level = :level,
                            total_xp = :total_xp,
                            streak_days = :streak_days,
                            bio = :bio
                        WHERE email = :email
                    ");
                    $stmtUpdate->execute([
                        'full_name' => $fullName,
                        'username' => $username,
                        'password_hash' => $passwordHash,
                        'role' => $role,
                        'is_approved' => $isApproved,
                        'level' => $level,
                        'total_xp' => $totalXp,
                        'streak_days' => $streakDays,
                        'bio' => $bio,
                        'email' => $email
                    ]);
                } else {
                    $uuid = sprintf(
                        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                        mt_rand(0, 0xffff),
                        mt_rand(0, 0xffff),
                        mt_rand(0, 0xffff),
                        mt_rand(0, 0x0fff) | 0x4000,
                        mt_rand(0, 0x3fff) | 0x8000,
                        mt_rand(0, 0xffff),
                        mt_rand(0, 0xffff),
                        mt_rand(0, 0xffff)
                    );

                    $stmtInsert = $pdo->prepare("
                        INSERT INTO users (uuid, email, full_name, username, tag_id, password_hash, role, status, is_approved, level, total_xp, streak_days, bio)
                        VALUES (:uuid, :email, :full_name, :username, :tag_id, :password_hash, :role, 'ACTIVE', :is_approved, :level, :total_xp, :streak_days, :bio)
                    ");
                    $stmtInsert->execute([
                        'uuid' => $uuid,
                        'email' => $email,
                        'full_name' => $fullName,
                        'username' => $username,
                        'tag_id' => $tagId,
                        'password_hash' => $passwordHash,
                        'role' => $role,
                        'is_approved' => $isApproved,
                        'level' => $level,
                        'total_xp' => $totalXp,
                        'streak_days' => $streakDays,
                        'bio' => $bio
                    ]);
                }
                $userCount++;
            }
            echo "<p style='color:green;'>✅ Đã khởi tạo và mã hóa password chuẩn bcrypt cho <b>{$userCount} tài khoản</b> thành công!</p>";
        }
    }

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    echo "<div style='background:#e6fffa; border:1px solid #319795; padding:15px; border-radius:8px;'>";
    echo "<h3 style='color:#234e52; margin-top:0;'>🎉 INSTALLED & SEEDED ALL USERS SUCCESSFULLY!</h3>";
    echo "<p>Đã tạo xong tất cả các bảng và danh sách tài khoản Admin & Học viên chuẩn mật khẩu!</p>";
    echo "</div>";

} catch (Exception $e) {
    echo "<div style='background:#fff5f5; border:1px solid #e53e3e; padding:15px; border-radius:8px;'>";
    echo "<h3 style='color:#9b2c2c; margin-top:0;'>❌ LỖI KHI IMPORT DATABASE:</h3>";
    echo "<p><code>" . htmlspecialchars($e->getMessage()) . "</code></p>";
    echo "</div>";
}
