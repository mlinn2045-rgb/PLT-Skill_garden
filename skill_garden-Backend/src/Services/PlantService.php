<?php
// src/Services/PlantService.php

namespace App\Services;

use App\Models\Plant;
use Database;
use Exception;
use PDO;

class PlantService
{
    private Plant $plantModel;
    private PDO $db;

    public function __construct(?Plant $plantModel = null, ?PDO $db = null)
    {
        $this->plantModel = $plantModel ?? new Plant();
        $this->db = $db ?? Database::getConnection();
    }

    public function getAllPlants(): array
    {
        $sql = "SELECT * FROM plants ORDER BY id ASC";
        $stmt = $this->db->query($sql);
        $plants = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($plants as &$plant) {
            $stageStmt = $this->db->prepare("SELECT * FROM plant_stages WHERE plant_id = :p_id ORDER BY stage_level ASC");
            $stageStmt->execute(['p_id' => $plant['id']]);
            $plant['stages'] = $stageStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return $plants;
    }

    public function createPlant(array $data): array
    {
        $name = trim($data['name'] ?? '');
        $code = strtoupper(trim($data['code'] ?? ''));

        if (empty($name) || empty($code)) {
            throw new Exception("Tên cây và mã cây là bắt buộc.", 400);
        }

        $plant = $this->plantModel->create([
            'name' => $name,
            'code' => $code,
            'description' => $data['description'] ?? null,
            'icon_url' => $data['icon_url'] ?? null,
        ]);

        return $this->plantModel->getPlantWithStages((int) $plant['id']);
    }

    public function updatePlant(int $plantId, array $data): bool
    {
        $plant = $this->plantModel->findById($plantId);
        if (!$plant) {
            throw new Exception("Không tìm thấy loại cây này.", 404);
        }

        $update = [];
        if (isset($data['name']))
            $update['name'] = trim($data['name']);
        if (isset($data['code']))
            $update['code'] = strtoupper(trim($data['code']));
        if (isset($data['description']))
            $update['description'] = trim($data['description']);
        if (isset($data['icon_url']))
            $update['icon_url'] = trim($data['icon_url']);

        return $this->plantModel->update($plantId, $update);
    }

    public function deletePlant(int $plantId): bool
    {
        $plant = $this->plantModel->findById($plantId);
        if (!$plant) {
            throw new Exception("Không tìm thấy loại cây.", 404);
        }

        return $this->plantModel->delete($plantId);
    }

    // Stages CRUD
    public function savePlantStage(int $plantId, array $stageData): array
    {
        $stageLevel = (int) ($stageData['stage_level'] ?? 1);
        $stageName = trim($stageData['stage_name'] ?? '');
        $requiredProgress = (int) ($stageData['required_progress_percent'] ?? 0);
        $imageUrl = $stageData['image_url'] ?? null;

        if (empty($stageName)) {
            throw new Exception("Tên giai đoạn cây không được để trống.", 400);
        }

        $stmt = $this->db->prepare("
            INSERT INTO plant_stages (plant_id, stage_level, stage_name, required_progress_percent, image_url)
            VALUES (:plant_id, :stage_level, :stage_name, :required_progress, :image_url)
            ON DUPLICATE KEY UPDATE 
                stage_name = VALUES(stage_name),
                required_progress_percent = VALUES(required_progress_percent),
                image_url = VALUES(image_url)
        ");
        $stmt->execute([
            'plant_id' => $plantId,
            'stage_level' => $stageLevel,
            'stage_name' => $stageName,
            'required_progress' => $requiredProgress,
            'image_url' => $imageUrl
        ]);

        return $this->plantModel->getPlantWithStages($plantId);
    }
}
