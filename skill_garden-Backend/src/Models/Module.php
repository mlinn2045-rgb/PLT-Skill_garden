<?php
// src/Models/Module.php

namespace App\Models;

class Module extends BaseModel
{
    protected string $table = 'modules';

    public function getModulesByPathId(int $learningPathId): array
    {
        return $this->findAll(['learning_path_id' => $learningPathId], 'order_index ASC, id ASC');
    }
}
