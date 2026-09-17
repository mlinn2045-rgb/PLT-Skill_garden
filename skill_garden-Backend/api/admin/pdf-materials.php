<?php
// api/admin/pdf-materials.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Helpers\JWT;

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getConnection();

$config = require __DIR__ . '/../../config/config.php';
$token = $_COOKIE[$config['jwt']['cookie_name'] ?? 'skill_garden_token'] ?? null;
$userRole = 'GUEST';

if ($token) {
    $payload = JWT::decode($token, $config['jwt']['secret']);
    if ($payload && isset($payload['role'])) {
        $userRole = $payload['role'];
    }
}

try {
    if ($method === 'GET') {
        $lessonId = (int) ($_GET['lesson_id'] ?? 0);
        if ($lessonId > 0) {
            $stmt = $db->prepare("SELECT * FROM lesson_materials WHERE lesson_id = :l_id ORDER BY id DESC");
            $stmt->execute(['l_id' => $lessonId]);
        } else {
            $stmt = $db->query("SELECT lm.*, l.title as lesson_title FROM lesson_materials lm LEFT JOIN lessons l ON lm.lesson_id = l.id ORDER BY lm.id DESC");
        }
        $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);
        Response::success($materials, "Lấy danh sách tài liệu thành công.");
    }

    if (!in_array($userRole, ['ADMIN', 'SUPER_ADMIN'])) {
        Response::error("Bạn không có quyền thực hiện thao tác này.", 403);
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if ($method === 'POST') {
        $title = trim($body['title'] ?? '');
        $fileUrl = trim($body['file_url'] ?? '');
        $lessonId = (int) ($body['lesson_id'] ?? 0);
        $fileType = trim($body['file_type'] ?? 'pdf');
        $fileSizeBytes = (int) ($body['file_size_bytes'] ?? 0);

        if (empty($title) || empty($fileUrl)) {
            Response::error("Tiêu đề và đường dẫn file là bắt buộc.", 400);
        }

        $stmt = $db->prepare("
            INSERT INTO lesson_materials (lesson_id, title, file_url, file_type, file_size_bytes)
            VALUES (:l_id, :title, :file_url, :file_type, :size)
        ");
        $stmt->execute([
            'l_id' => $lessonId > 0 ? $lessonId : null,
            'title' => $title,
            'file_url' => $fileUrl,
            'file_type' => $fileType,
            'size' => $fileSizeBytes
        ]);

        Response::success(['id' => $db->lastInsertId()], "Thêm tài liệu PDF mới thành công.", 201);
    }

    if ($method === 'DELETE') {
        $id = (int) ($_GET['id'] ?? 0);
        if ($id <= 0) {
            Response::error("ID tài liệu không hợp lệ.", 400);
        }

        $stmt = $db->prepare("DELETE FROM lesson_materials WHERE id = :id");
        $stmt->execute(['id' => $id]);
        Response::success(['deleted' => true], "Đã xóa tài liệu thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
