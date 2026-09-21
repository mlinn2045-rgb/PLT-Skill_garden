<?php
header('Content-Type: text/html; charset=utf-8');

try {
    $bootstrapPath = __DIR__ . '/config/bootstrap.php';
    if (!file_exists($bootstrapPath)) {
        $bootstrapPath = __DIR__ . '/../config/bootstrap.php';
    }
    require_once $bootstrapPath;

    $db = Database::getConnection();

    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $db->exec("TRUNCATE TABLE user_lessons;");
    $db->exec("TRUNCATE TABLE user_lesson_notes;");
    $db->exec("TRUNCATE TABLE lessons;");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");

    echo "<h3>🧹 CLEARED ALL SAMPLE LESSONS SUCCESSFULLY FROM MYSQL!</h3>";
    echo "<p>Bây giờ database hoàn toàn sạch sẽ (0 bài học). Khi Admin tạo bài học mới ở trang Admin, bài học đó sẽ được lưu vào MySQL và hiển thị duy nhất bên Học viên!</p>";

} catch (Exception $e) {
    echo "<h3 style='color:red;'>Lỗi: " . htmlspecialchars($e->getMessage()) . "</h3>";
}
