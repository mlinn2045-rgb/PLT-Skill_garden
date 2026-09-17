<?php
// src/Models/Garden.php

namespace App\Models;

class Garden extends BaseModel
{
    protected string $table = 'user_garden_trees';

    public function getUserGardenTrees(int $userId): array
    {
        $sql = "
            SELECT 
                ugt.*,
                s.title as skill_title,
                s.slug as skill_slug,
                s.category as skill_category,
                p.name as plant_name,
                p.code as plant_code,
                ps.stage_level,
                ps.stage_name,
                ps.required_progress_percent,
                ps.image_url as stage_image_url
            FROM user_garden_trees ugt
            JOIN skills s ON ugt.skill_id = s.id
            JOIN plants p ON ugt.plant_id = p.id
            LEFT JOIN plant_stages ps ON ugt.current_stage_id = ps.id
            WHERE ugt.user_id = :user_id
            ORDER BY ugt.updated_at DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
