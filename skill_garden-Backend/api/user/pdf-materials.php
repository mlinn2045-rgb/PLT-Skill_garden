<?php
// api/user/pdf-materials.php - User Skill-based PDF Access, Sync, and Logging API

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\AuditService;

$user = AuthMiddleware::authenticate();
$userId = (int) $user['id'];
$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $skillId = isset($_GET['skill_id']) ? (int) $_GET['skill_id'] : 0;
        $materialId = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        // Fetch user's enrolled skills
        $enrolledStmt = $db->prepare("SELECT skill_id FROM user_skills WHERE user_id = :u_id");
        $enrolledStmt->execute(['u_id' => $userId]);
        $enrolledSkillIds = $enrolledStmt->fetchAll(PDO::FETCH_COLUMN);

        $isAdmin = in_array($user['role'], ['ADMIN', 'SUPER_ADMIN']);

        // Single material detail request & logging
        if ($materialId > 0) {
            $stmt = $db->prepare("
                SELECT lm.*, s.title AS skill_title, l.title AS lesson_title
                FROM lesson_materials lm
                LEFT JOIN skills s ON lm.skill_id = s.id
                LEFT JOIN lessons l ON lm.lesson_id = l.id
                WHERE lm.id = :id
            ");
            $stmt->execute(['id' => $materialId]);
            $material = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$material) {
                Response::error("Tài liệu không tồn tại.", 404);
            }

            // Access check: User must be enrolled in the material's skill_id (or skill of lesson), unless ADMIN
            $materialSkillId = $material['skill_id'];
            if (!$isAdmin && $materialSkillId && !in_array($materialSkillId, $enrolledSkillIds)) {
                Response::error("Bạn chưa đăng ký theo học Kỹ năng chứa tài liệu PDF này.", 403);
            }

            // Log user access activity
            $auditService = new AuditService($db);
            $action = $_GET['action'] === 'download' ? 'DOWNLOAD_PDF' : 'VIEW_PDF';
            $auditService->log(
                $userId,
                $action,
                'lesson_materials',
                $materialId,
                sprintf("Học viên %s (%s) %s tài liệu: '%s' [Skill ID: %s]", $user['full_name'], $user['email'], $action === 'DOWNLOAD_PDF' ? 'tải xuống' : 'xem', $material['title'], $materialSkillId ?? 'N/A')
            );

            Response::success($material, "Lấy thông tin tài liệu PDF thành công.");
        }

        // List materials for enrolled skills or specified skill
        if ($skillId > 0) {
            if (!$isAdmin && !in_array($skillId, $enrolledSkillIds)) {
                Response::error("Bạn chưa đăng ký theo học Kỹ năng này.", 403);
            }

            $stmt = $db->prepare("
                SELECT lm.*, s.title AS skill_title, l.title AS lesson_title
                FROM lesson_materials lm
                LEFT JOIN skills s ON lm.skill_id = s.id
                LEFT JOIN lessons l ON lm.lesson_id = l.id
                WHERE lm.skill_id = :skill_id OR l.module_id IN (
                    SELECT m.id FROM modules m 
                    JOIN learning_paths lp ON m.learning_path_id = lp.id 
                    WHERE lp.skill_id = :skill_id2
                )
                ORDER BY lm.id DESC
            ");
            $stmt->execute(['skill_id' => $skillId, 'skill_id2' => $skillId]);
            $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            // Auto-sync: return all PDFs for skills that the user is enrolled in
            if ($isAdmin) {
                $stmt = $db->query("
                    SELECT lm.*, s.title AS skill_title, l.title AS lesson_title
                    FROM lesson_materials lm
                    LEFT JOIN skills s ON lm.skill_id = s.id
                    LEFT JOIN lessons l ON lm.lesson_id = l.id
                    ORDER BY lm.id DESC
                ");
            } else {
                if (empty($enrolledSkillIds)) {
                    Response::success([], "Học viên chưa đăng ký kỹ năng nào.");
                }

                $inClause = implode(',', array_map('intval', $enrolledSkillIds));
                $stmt = $db->query("
                    SELECT lm.*, s.title AS skill_title, l.title AS lesson_title
                    FROM lesson_materials lm
                    LEFT JOIN skills s ON lm.skill_id = s.id
                    LEFT JOIN lessons l ON lm.lesson_id = l.id
                    WHERE lm.skill_id IN ({$inClause}) OR l.module_id IN (
                        SELECT m.id FROM modules m 
                        JOIN learning_paths lp ON m.learning_path_id = lp.id 
                        WHERE lp.skill_id IN ({$inClause})
                    )
                    ORDER BY lm.id DESC
                ");
            }
            $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        Response::success($materials, "Đồng bộ danh sách tài liệu PDF thành công.");
    }

    if ($method === 'POST') {
        // Log activity endpoint
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $materialId = (int) ($body['material_id'] ?? $body['id'] ?? 0);
        $action = trim($body['action'] ?? 'VIEW_PDF');

        if ($materialId <= 0) {
            Response::error("ID tài liệu không hợp lệ.", 400);
        }

        $stmt = $db->prepare("SELECT lm.*, s.title AS skill_title FROM lesson_materials lm LEFT JOIN skills s ON lm.skill_id = s.id WHERE lm.id = :id");
        $stmt->execute(['id' => $materialId]);
        $mat = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($mat) {
            $auditService = new AuditService($db);
            $auditService->log(
                $userId,
                $action,
                'lesson_materials',
                $materialId,
                sprintf("Ghi log hoạt động %s tài liệu '%s' (Skill ID: %s)", $action === 'DOWNLOAD_PDF' ? 'tải xuống' : 'xem', $mat['title'], $mat['skill_id'] ?? 'N/A')
            );
            Response::success(['logged' => true], "Đã ghi log hoạt động xem/tải tài liệu.");
        }
        Response::error("Tài liệu không tồn tại.", 404);
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
