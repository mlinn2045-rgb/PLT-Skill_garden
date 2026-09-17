<?php
// src/Models/BaseModel.php

namespace App\Models;

use Database;
use PDO;

abstract class BaseModel
{
    protected PDO $db;
    protected string $table;
    protected string $primaryKey = 'id';

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM `{$this->table}` WHERE `{$this->primaryKey}` = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function findAll(array $conditions = [], string $orderBy = 'id DESC', ?int $limit = null, ?int $offset = null): array
    {
        $sql = "SELECT * FROM `{$this->table}`";
        $params = [];

        if (!empty($conditions)) {
            $whereClauses = [];
            foreach ($conditions as $field => $value) {
                $paramKey = "where_" . str_replace('.', '_', $field);
                $whereClauses[] = "`{$field}` = :{$paramKey}";
                $params[$paramKey] = $value;
            }
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }

        if (!empty($orderBy)) {
            $sql .= " ORDER BY {$orderBy}";
        }

        if ($limit !== null) {
            $sql .= " LIMIT " . (int) $limit;
            if ($offset !== null) {
                $sql .= " OFFSET " . (int) $offset;
            }
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function count(array $conditions = []): int
    {
        $sql = "SELECT COUNT(*) FROM `{$this->table}`";
        $params = [];

        if (!empty($conditions)) {
            $whereClauses = [];
            foreach ($conditions as $field => $value) {
                $paramKey = "count_" . str_replace('.', '_', $field);
                $whereClauses[] = "`{$field}` = :{$paramKey}";
                $params[$paramKey] = $value;
            }
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    public function paginate(int $page = 1, int $perPage = 10, array $conditions = [], string $orderBy = 'id DESC'): array
    {
        $page = max(1, $page);
        $perPage = max(1, min(100, $perPage));
        $offset = ($page - 1) * $perPage;

        $totalItems = $this->count($conditions);
        $totalPages = ceil($totalItems / $perPage);
        $items = $this->findAll($conditions, $orderBy, $perPage, $offset);

        return [
            'items' => $items,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_items' => $totalItems,
                'total_pages' => (int) $totalPages,
            ]
        ];
    }

    public function create(array $data): array
    {
        $fields = array_keys($data);
        $columns = implode('`, `', $fields);
        $placeholders = ':' . implode(', :', $fields);

        $sql = "INSERT INTO `{$this->table}` (`{$columns}`) VALUES ({$placeholders})";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);

        $id = (int) $this->db->lastInsertId();
        return $this->findById($id);
    }

    public function update(int $id, array $data): bool
    {
        if (empty($data)) {
            return false;
        }

        $setClauses = [];
        $params = ['id' => $id];

        foreach ($data as $field => $value) {
            $setClauses[] = "`{$field}` = :{$field}";
            $params[$field] = $value;
        }

        $sql = "UPDATE `{$this->table}` SET " . implode(', ', $setClauses) . " WHERE `{$this->primaryKey}` = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM `{$this->table}` WHERE `{$this->primaryKey}` = :id");
        return $stmt->execute(['id' => $id]);
    }
}
