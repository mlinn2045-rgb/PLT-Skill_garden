<?php
// src/Services/LearningPathService.php

namespace App\Services;

use App\Models\LearningPath;
use App\Models\Module;
use Database;
use Exception;
use PDO;

class LearningPathService
{
    private LearningPath $pathModel;
    private Module $moduleModel;
    private PDO $db;

    public function __construct(?LearningPath $pathModel = null, ?Module $moduleModel = null, ?PDO $db = null)
    {
        $this->pathModel = $pathModel ?? new LearningPath();
        $this->moduleModel = $moduleModel ?? new Module();
        $this->db = $db ?? Database::getConnection();
    }

    public function getLearningPaths(int $skillId): array
    {
        return $this->pathModel->getPathsBySkillId($skillId);
    }

    public function createLearningPath(int $skillId, string $title, ?string $description = null, int $orderIndex = 1): array
    {
        if (empty(trim($title))) {
            throw new Exception("Tiêu đề lộ trình học tập không được để trống.", 400);
        }

        return $this->pathModel->create([
            'skill_id' => $skillId,
            'title' => trim($title),
            'description' => $description,
            'order_index' => $orderIndex,
        ]);
    }

    public function updateLearningPath(int $pathId, array $data): bool
    {
        $path = $this->pathModel->findById($pathId);
        if (!$path) {
            throw new Exception("Không tìm thấy lộ trình học tập.", 404);
        }

        $update = [];
        if (isset($data['title']))
            $update['title'] = trim($data['title']);
        if (isset($data['description']))
            $update['description'] = trim($data['description']);
        if (isset($data['order_index']))
            $update['order_index'] = (int) $data['order_index'];

        return $this->pathModel->update($pathId, $update);
    }

    public function deleteLearningPath(int $pathId): bool
    {
        $path = $this->pathModel->findById($pathId);
        if (!$path) {
            throw new Exception("Không tìm thấy lộ trình học tập.", 404);
        }

        return $this->pathModel->delete($pathId);
    }

    // Module CRUD
    public function createModule(int $learningPathId, string $title, ?string $description = null, int $orderIndex = 1): array
    {
        if (empty(trim($title))) {
            throw new Exception("Tiêu đề module không được để trống.", 400);
        }

        return $this->moduleModel->create([
            'learning_path_id' => $learningPathId,
            'title' => trim($title),
            'description' => $description,
            'order_index' => $orderIndex,
        ]);
    }

    public function updateModule(int $moduleId, array $data): bool
    {
        $module = $this->moduleModel->findById($moduleId);
        if (!$module) {
            throw new Exception("Không tìm thấy module.", 404);
        }

        $update = [];
        if (isset($data['title']))
            $update['title'] = trim($data['title']);
        if (isset($data['description']))
            $update['description'] = trim($data['description']);
        if (isset($data['order_index']))
            $update['order_index'] = (int) $data['order_index'];

        return $this->moduleModel->update($moduleId, $update);
    }

    public function deleteModule(int $moduleId): bool
    {
        $module = $this->moduleModel->findById($moduleId);
        if (!$module) {
            throw new Exception("Không tìm thấy module.", 404);
        }

        return $this->moduleModel->delete($moduleId);
    }
}
