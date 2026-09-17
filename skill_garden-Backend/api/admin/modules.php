<?php
// api/admin/modules.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\LearningPathService;

AuthMiddleware::requirePermission('MANAGE_LEARNING_PATHS');

$lpService = new LearningPathService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $learningPathId = (int) ($data['learning_path_id'] ?? 0);
        $title = $data['title'] ?? '';
        $description = $data['description'] ?? null;
        $orderIndex = (int) ($data['order_index'] ?? 1);

        if ($learningPathId <= 0) {
            Response::error("ID lộ trình không hợp lệ.", 400);
        }

        $module = $lpService->createModule($learningPathId, $title, $description, $orderIndex);
        Response::success($module, "Tạo module mới thành công!", 201);
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $moduleId = (int) ($data['id'] ?? $data['module_id'] ?? 0);

        if ($moduleId <= 0) {
            Response::error("ID module không hợp lệ.", 400);
        }

        $lpService->updateModule($moduleId, $data);
        Response::success(null, "Cập nhật module thành công!");
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $moduleId = (int) ($data['module_id'] ?? $_GET['id'] ?? 0);

        if ($moduleId <= 0) {
            Response::error("ID module không hợp lệ.", 400);
        }

        $lpService->deleteModule($moduleId);
        Response::success(null, "Xóa module thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
