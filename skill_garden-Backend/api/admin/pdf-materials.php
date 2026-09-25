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
        $skillId = (int) ($_GET['skill_id'] ?? 0);
        if ($lessonId > 0) {
            $stmt = $db->prepare("
                SELECT lm.*, l.title as lesson_title, s.title as skill_title 
                FROM lesson_materials lm 
                LEFT JOIN lessons l ON lm.lesson_id = l.id 
                LEFT JOIN skills s ON lm.skill_id = s.id 
                WHERE lm.lesson_id = :l_id 
                ORDER BY lm.id DESC
            ");
            $stmt->execute(['l_id' => $lessonId]);
        } elseif ($skillId > 0) {
            $stmt = $db->prepare("
                SELECT lm.*, l.title as lesson_title, s.title as skill_title 
                FROM lesson_materials lm 
                LEFT JOIN lessons l ON lm.lesson_id = l.id 
                LEFT JOIN skills s ON lm.skill_id = s.id 
                WHERE lm.skill_id = :s_id 
                ORDER BY lm.id DESC
            ");
            $stmt->execute(['s_id' => $skillId]);
        } else {
            $stmt = $db->query("
                SELECT lm.*, l.title as lesson_title, s.title as skill_title 
                FROM lesson_materials lm 
                LEFT JOIN lessons l ON lm.lesson_id = l.id 
                LEFT JOIN skills s ON lm.skill_id = s.id 
                ORDER BY lm.id DESC
            ");
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
        $skillId = (int) ($body['skill_id'] ?? 0);
        $fileType = trim($body['file_type'] ?? 'pdf');
        $fileSizeBytes = (int) ($body['file_size_bytes'] ?? 0);

        if (empty($title) || empty($fileUrl)) {
            Response::error("Tiêu đề và đường dẫn file là bắt buộc.", 400);
        }

        $stmt = $db->prepare("
            INSERT INTO lesson_materials (lesson_id, skill_id, title, file_url, file_type, file_size_bytes)
            VALUES (:l_id, :s_id, :title, :file_url, :file_type, :size)
        ");
        $stmt->execute([
            'l_id' => $lessonId > 0 ? $lessonId : null,
            's_id' => $skillId > 0 ? $skillId : null,
            'title' => $title,
            'file_url' => $fileUrl,
            'file_type' => $fileType,
            'size' => $fileSizeBytes
        ]);

        Response::success(['id' => $db->lastInsertId()], "Thêm tài liệu PDF mới thành công.", 201);
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $id = (int) ($body['id'] ?? $_GET['id'] ?? 0);
        $title = trim($body['title'] ?? '');
        $fileUrl = trim($body['file_url'] ?? '');
        $skillId = isset($body['skill_id']) ? (int) $body['skill_id'] : null;
        $lessonId = isset($body['lesson_id']) ? (int) $body['lesson_id'] : null;

        if ($id <= 0 || empty($title) || empty($fileUrl)) {
            Response::error("ID, tiêu đề và đường dẫn file là bắt buộc.", 400);
        }

        $stmt = $db->prepare("
            UPDATE lesson_materials 
            SET title = :title, 
                file_url = :file_url, 
                file_type = :file_type, 
                file_size_bytes = :size,
                skill_id = :s_id,
                lesson_id = :l_id 
            WHERE id = :id
        ");
        $stmt->execute([
            'id' => $id,
            'title' => $title,
            'file_url' => $fileUrl,
            'file_type' => trim($body['file_type'] ?? 'pdf'),
            'size' => (int) ($body['file_size_bytes'] ?? 0),
            's_id' => $skillId > 0 ? $skillId : null,
            'l_id' => $lessonId > 0 ? $lessonId : null,
        ]);
        Response::success(['updated' => true], "Cập nhật tài liệu PDF thành công.");
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
