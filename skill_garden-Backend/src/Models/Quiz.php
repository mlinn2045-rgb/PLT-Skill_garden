<?php
// src/Models/Quiz.php

namespace App\Models;

class Quiz extends BaseModel
{
    protected string $table = 'quizzes';

    public function getQuizWithQuestions(int $quizId, bool $includeCorrectAnswers = false): ?array
    {
        $quiz = $this->findById($quizId);
        if (!$quiz) {
            return null;
        }

        $stmt = $this->db->prepare("
            SELECT q.* 
            FROM questions q
            WHERE q.quiz_id = :quiz_id
            ORDER BY q.id ASC
        ");
        $stmt->execute(['quiz_id' => $quizId]);
        $questions = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($questions as &$q) {
            $optSql = $includeCorrectAnswers
                ? "SELECT id, question_id, option_text, is_correct, order_index FROM question_options WHERE question_id = :q_id ORDER BY order_index ASC"
                : "SELECT id, question_id, option_text, order_index FROM question_options WHERE question_id = :q_id ORDER BY order_index ASC";

            $optStmt = $this->db->prepare($optSql);
            $optStmt->execute(['q_id' => $q['id']]);
            $q['options'] = $optStmt->fetchAll(\PDO::FETCH_ASSOC);
        }

        $quiz['questions'] = $questions;
        return $quiz;
    }
}
