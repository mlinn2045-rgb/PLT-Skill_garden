<?php
// src/Models/Lesson.php

namespace App\Models;

class Lesson extends BaseModel
{
    protected string $table = 'lessons';

    public function getLessonsByModuleId(int $moduleId): array
    {
        return $this->findAll(['module_id' => $moduleId], 'order_index ASC, id ASC');
    }

    public function getLessonWithMaterials(int $lessonId): ?array
    {
        $lesson = $this->findById($lessonId);
        if (!$lesson) {
            return null;
        }

        $stmt = $this->db->prepare("SELECT * FROM lesson_materials WHERE lesson_id = :lesson_id");
        $stmt->execute(['lesson_id' => $lessonId]);
        $lesson['materials'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return $lesson;
    }
}
