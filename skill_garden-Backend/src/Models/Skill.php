<?php
// src/Models/Skill.php

namespace App\Models;

class Skill extends BaseModel
{
    protected string $table = 'skills';

    public function findBySlug(string $slug): ?array
    {
        $stmt = $this->db->prepare("
            SELECT s.*, p.name as plant_name, p.code as plant_code, p.icon_url as plant_icon
            FROM skills s
            LEFT JOIN plants p ON s.plant_id = p.id
            WHERE s.slug = :slug LIMIT 1
        ");
        $stmt->execute(['slug' => $slug]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function getActiveSkills(?string $category = null): array
    {
        $sql = "
            SELECT s.*, p.name as plant_name, p.code as plant_code, p.icon_url as plant_icon
            FROM skills s
            LEFT JOIN plants p ON s.plant_id = p.id
            WHERE s.status = 'ACTIVE'
        ";
        $params = [];

        if (!empty($category)) {
            $sql .= " AND s.category = :category";
            $params['category'] = $category;
        }

        $sql .= " ORDER BY s.id ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
