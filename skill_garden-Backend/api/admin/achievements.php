<?php
// api/admin/achievements.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\AchievementService;

AuthMiddleware::requirePermission('MANAGE_ACHIEVEMENTS');

$achieveService = new AchievementService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $achievements = $achieveService->getAchievements();
        Response::success($achievements, "Lấy danh sách thành tích (Admin) thành công.");
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $achievement = $achieveService->createAchievement($data);
        Response::success($achievement, "Tạo thành tích mới thành công!", 201);
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = (int) ($data['id'] ?? $data['achievement_id'] ?? 0);

        if ($id <= 0) {
            Response::error("ID thành tích không hợp lệ.", 400);
        }

        $achieveService->updateAchievement($id, $data);
        Response::success(null, "Cập nhật thành tích thành công!");
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = (int) ($data['achievement_id'] ?? $_GET['id'] ?? 0);

        if ($id <= 0) {
            Response::error("ID thành tích không hợp lệ.", 400);
        }

        $achieveService->deleteAchievement($id);
        Response::success(null, "Xóa thành tích thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
