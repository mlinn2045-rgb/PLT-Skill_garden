<?php
// api/admin/learning-paths.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\LearningPathService;

AuthMiddleware::requirePermission('MANAGE_LEARNING_PATHS');

$lpService = new LearningPathService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $skillId = (int) ($_GET['skill_id'] ?? 0);
        if ($skillId <= 0) {
            Response::error("ID kỹ năng là bắt buộc.", 400);
        }

        $paths = $lpService->getLearningPaths($skillId);
        Response::success($paths, "Lấy lộ trình học tập thành công.");
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $skillId = (int) ($data['skill_id'] ?? 0);
        $title = $data['title'] ?? '';
        $description = $data['description'] ?? null;
        $orderIndex = (int) ($data['order_index'] ?? 1);

        if ($skillId <= 0) {
            Response::error("ID kỹ năng không hợp lệ.", 400);
        }

        $path = $lpService->createLearningPath($skillId, $title, $description, $orderIndex);
        Response::success($path, "Tạo lộ trình học tập mới thành công!", 201);
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $pathId = (int) ($data['id'] ?? $data['path_id'] ?? 0);

        if ($pathId <= 0) {
            Response::error("ID lộ trình không hợp lệ.", 400);
        }

        $lpService->updateLearningPath($pathId, $data);
        Response::success(null, "Cập nhật lộ trình học tập thành công!");
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $pathId = (int) ($data['path_id'] ?? $_GET['id'] ?? 0);

        if ($pathId <= 0) {
            Response::error("ID lộ trình không hợp lệ.", 400);
        }

        $lpService->deleteLearningPath($pathId);
        Response::success(null, "Xóa lộ trình học tập thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
