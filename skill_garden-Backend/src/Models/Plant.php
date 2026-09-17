<?php
// src/Models/Plant.php

namespace App\Models;

class Plant extends BaseModel
{
    protected string $table = 'plants';

    public function getPlantWithStages(int $plantId): ?array
    {
        $plant = $this->findById($plantId);
        if (!$plant) {
            return null;
        }

        $stmt = $this->db->prepare("SELECT * FROM plant_stages WHERE plant_id = :p_id ORDER BY stage_level ASC");
        $stmt->execute(['p_id' => $plantId]);
        $plant['stages'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return $plant;
    }
}
