<?php
// src/Models/Question.php

namespace App\Models;

class Question extends BaseModel
{
    protected string $table = 'questions';

    public function getQuestionWithOptions(int $questionId): ?array
    {
        $question = $this->findById($questionId);
        if (!$question) {
            return null;
        }

        $stmt = $this->db->prepare("SELECT * FROM question_options WHERE question_id = :q_id ORDER BY order_index ASC");
        $stmt->execute(['q_id' => $questionId]);
        $question['options'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return $question;
    }
}
