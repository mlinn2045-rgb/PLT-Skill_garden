<?php
// api/user/course-sync.php

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Services\SkillService;

$method = $_SERVER['REQUEST_METHOD'];
$skillService = new SkillService();

try {
    if ($method === 'GET') {
        $courseId = isset($_GET['course_id']) ? (int) $_GET['course_id'] : null;
        $syncStatus = $skillService->getLatestSyncStatus($courseId);

        Response::success([
            'version_timestamp' => time(),
            'sync_status' => $syncStatus,
        ], "Lấy trạng thái đồng bộ khóa học thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), 400);
}
