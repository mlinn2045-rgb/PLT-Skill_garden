<?php
// src/Models/LearningPath.php

namespace App\Models;

class LearningPath extends BaseModel
{
    protected string $table = 'learning_paths';

    public function getPathsBySkillId(int $skillId): array
    {
        return $this->findAll(['skill_id' => $skillId], 'order_index ASC, id ASC');
    }
}
