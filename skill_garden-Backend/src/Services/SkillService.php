<?php
// src/Services/SkillService.php

namespace App\Services;

use App\Models\Skill;
use Database;
use Exception;
use PDO;

class SkillService
{
    private Skill $skillModel;
    private PDO $db;

    public function __construct(?Skill $skillModel = null, ?PDO $db = null)
    {
        $this->skillModel = $skillModel ?? new Skill();
        $this->db = $db ?? Database::getConnection();
    }

    private function createSlug(string $title): string
    {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        return trim($slug, '-');
    }

    public function getSkills(?string $category = null, bool $adminView = false): array
    {
        if ($adminView) {
            $sql = "
                SELECT s.*, p.name as plant_name, p.code as plant_code, p.icon_url as plant_icon
                FROM skills s
                LEFT JOIN plants p ON s.plant_id = p.id
                ORDER BY s.id DESC
            ";
            $stmt = $this->db->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return $this->skillModel->getActiveSkills($category);
    }

    public function getSkillBySlug(string $slug, ?int $userId = null): array
    {
        $skill = $this->skillModel->findBySlug($slug);
        if (!$skill) {
            throw new Exception("Không tìm thấy kỹ năng này.", 404);
        }

        // Include full learning path with modules and lessons
        $skillId = (int) $skill['id'];

        $pathStmt = $this->db->prepare("SELECT * FROM learning_paths WHERE skill_id = :skill_id ORDER BY order_index ASC");
        $pathStmt->execute(['skill_id' => $skillId]);
        $learningPaths = $pathStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($learningPaths as &$lp) {
            $modStmt = $this->db->prepare("SELECT * FROM modules WHERE learning_path_id = :lp_id ORDER BY order_index ASC");
            $modStmt->execute(['lp_id' => $lp['id']]);
            $modules = $modStmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($modules as &$mod) {
                $lesStmt = $this->db->prepare("
                    SELECT id, module_id, title, slug, description, content_type, video_url, video_duration_seconds, xp_reward, order_index, is_required
                    FROM lessons 
                    WHERE module_id = :mod_id AND is_published = 1 
                    ORDER BY order_index ASC
                ");
                $lesStmt->execute(['mod_id' => $mod['id']]);
                $lessons = $lesStmt->fetchAll(PDO::FETCH_ASSOC);

                // If user logged in, attach completion status
                if ($userId) {
                    foreach ($lessons as &$les) {
                        $ulStmt = $this->db->prepare("SELECT status, is_completed FROM user_lessons WHERE user_id = :user_id AND lesson_id = :lesson_id");
                        $ulStmt->execute(['user_id' => $userId, 'lesson_id' => $les['id']]);
                        $userLesson = $ulStmt->fetch(PDO::FETCH_ASSOC);
                        $les['user_status'] = $userLesson['status'] ?? 'NOT_STARTED';
                        $les['is_completed'] = (bool) ($userLesson['is_completed'] ?? false);
                    }
                }

                $mod['lessons'] = $lessons;
            }

            $lp['modules'] = $modules;
        }

        $skill['learning_paths'] = $learningPaths;

        // User skill progress
        if ($userId) {
            $usStmt = $this->db->prepare("SELECT progress_percent, status FROM user_skills WHERE user_id = :user_id AND skill_id = :skill_id");
            $usStmt->execute(['user_id' => $userId, 'skill_id' => $skillId]);
            $userSkill = $usStmt->fetch(PDO::FETCH_ASSOC);
            $skill['user_progress'] = $userSkill ?: ['progress_percent' => 0.0, 'status' => 'NOT_STARTED'];
        }

        return $skill;
    }

    public function createSkill(array $data): array
    {
        $title = trim($data['title'] ?? '');
        if (empty($title)) {
            throw new Exception("Tên kỹ năng không được để trống.", 400);
        }

        $slug = $data['slug'] ?? $this->createSlug($title);
        if ($this->skillModel->findBySlug($slug)) {
            $slug .= '-' . rand(10, 99);
        }

        return $this->skillModel->create([
            'title' => $title,
            'slug' => $slug,
            'category' => $data['category'] ?? 'Development',
            'description' => $data['description'] ?? null,
            'icon_url' => $data['icon_url'] ?? null,
            'plant_id' => !empty($data['plant_id']) ? (int) $data['plant_id'] : null,
            'status' => $data['status'] ?? 'ACTIVE',
        ]);
    }

    public function updateSkill(int $skillId, array $data): bool
    {
        $skill = $this->skillModel->findById($skillId);
        if (!$skill) {
            throw new Exception("Không tìm thấy kỹ năng.", 404);
        }

        $updateData = [];
        if (isset($data['title']))
            $updateData['title'] = trim($data['title']);
        if (isset($data['category']))
            $updateData['category'] = trim($data['category']);
        if (isset($data['description']))
            $updateData['description'] = trim($data['description']);
        if (isset($data['icon_url']))
            $updateData['icon_url'] = trim($data['icon_url']);
        if (isset($data['plant_id']))
            $updateData['plant_id'] = $data['plant_id'] ? (int) $data['plant_id'] : null;
        if (isset($data['status']))
            $updateData['status'] = $data['status'];

        return $this->skillModel->update($skillId, $updateData);
    }

    public function deleteSkill(int $skillId): bool
    {
        $skill = $this->skillModel->findById($skillId);
        if (!$skill) {
            throw new Exception("Không tìm thấy kỹ năng.", 404);
        }

        return $this->skillModel->delete($skillId);
    }

    public function assignPlantToSkill(int $skillId, int $plantId): bool
    {
        return $this->skillModel->update($skillId, ['plant_id' => $plantId]);
    }
}
