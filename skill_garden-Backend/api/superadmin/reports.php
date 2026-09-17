<?php
// api/superadmin/reports.php

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

if ($userRole !== 'SUPER_ADMIN') {
    Response::error("Chỉ Super Admin mới có quyền truy cập System Reports.", 403);
}

try {
    if ($method === 'GET') {
        // Users stats
        $totalUsers = (int) $db->query("SELECT COUNT(*) FROM users WHERE role = 'USER'")->fetchColumn();
        $activeUsers = (int) $db->query("SELECT COUNT(*) FROM users WHERE role = 'USER' AND status = 'ACTIVE'")->fetchColumn();
        $pendingUsers = (int) $db->query("SELECT COUNT(*) FROM users WHERE role = 'USER' AND is_approved = 0")->fetchColumn();

        // Admins stats
        $totalAdmins = (int) $db->query("SELECT COUNT(*) FROM users WHERE role = 'ADMIN'")->fetchColumn();

        // Course & Lesson stats
        $totalSkills = (int) $db->query("SELECT COUNT(*) FROM skills")->fetchColumn();
        $totalLessons = (int) $db->query("SELECT COUNT(*) FROM lessons")->fetchColumn();
        $completedLessons = (int) $db->query("SELECT COUNT(*) FROM user_lessons WHERE is_completed = 1")->fetchColumn();

        // Quizzes stats
        $totalAttempts = (int) $db->query("SELECT COUNT(*) FROM user_quiz_attempts")->fetchColumn();
        $passedAttempts = (int) $db->query("SELECT COUNT(*) FROM user_quiz_attempts WHERE passed = 1")->fetchColumn();
        $quizPassRate = $totalAttempts > 0 ? round(($passedAttempts / $totalAttempts) * 100, 1) : 0.0;

        // Garden stats
        $totalTrees = (int) $db->query("SELECT COUNT(*) FROM user_garden_trees")->fetchColumn();
        $matureTrees = (int) $db->query("SELECT COUNT(*) FROM user_garden_trees WHERE status = 'MATURE'")->fetchColumn();

        Response::success([
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'pending' => $pendingUsers,
                'admins' => $totalAdmins,
            ],
            'learning' => [
                'total_skills' => $totalSkills,
                'total_lessons' => $totalLessons,
                'completed_lessons' => $completedLessons,
            ],
            'quizzes' => [
                'total_attempts' => $totalAttempts,
                'passed_attempts' => $passedAttempts,
                'pass_rate_percent' => $quizPassRate,
            ],
            'garden' => [
                'total_trees' => $totalTrees,
                'mature_trees' => $matureTrees,
            ]
        ], "Lấy báo cáo thống kê hệ thống thành công.");
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
