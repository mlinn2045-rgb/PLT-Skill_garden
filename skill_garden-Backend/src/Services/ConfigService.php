<?php
// src/Services/ConfigService.php

namespace App\Services;

use Database;
use PDO;

class ConfigService
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function getAllConfigs(): array
    {
        $stmt = $this->db->query("SELECT config_key, config_value, description, is_public, updated_at FROM system_configs ORDER BY config_key ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPublicConfigs(): array
    {
        $stmt = $this->db->query("SELECT config_key, config_value FROM system_configs WHERE is_public = 1");
        return $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    }

    public function updateConfigs(array $configs): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO system_configs (config_key, config_value)
            VALUES (:key, :value)
            ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), updated_at = NOW()
        ");

        foreach ($configs as $key => $value) {
            $stmt->execute([
                'key' => trim($key),
                'value' => is_array($value) ? json_encode($value) : (string) $value
            ]);
        }
    }
}
