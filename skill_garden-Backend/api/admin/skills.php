<?php
// api/admin/skills.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\SkillService;

AuthMiddleware::requirePermission('MANAGE_SKILLS');

$skillService = new SkillService();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $category = $_GET['category'] ?? null;
        $skills = $skillService->getSkills($category, true);
        Response::success($skills, "Lấy danh sách tất cả kỹ năng (Admin view) thành công.");
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $skill = $skillService->createSkill($data);
        Response::success($skill, "Tạo kỹ năng mới thành công!", 201);
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $skillId = (int) ($data['id'] ?? $data['skill_id'] ?? 0);

        if ($skillId <= 0) {
            Response::error("ID kỹ năng không hợp lệ.", 400);
        }

        $skillService->updateSkill($skillId, $data);
        Response::success(null, "Cập nhật kỹ năng thành công!");
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $skillId = (int) ($data['skill_id'] ?? $_GET['id'] ?? 0);

        if ($skillId <= 0) {
            Response::error("ID kỹ năng không hợp lệ.", 400);
        }

        $skillService->deleteSkill($skillId);
        Response::success(null, "Xóa kỹ năng thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
