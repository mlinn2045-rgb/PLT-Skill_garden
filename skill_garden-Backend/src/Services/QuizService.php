<?php
// src/Services/QuizService.php

namespace App\Services;

use App\Models\Question;
use App\Models\Quiz;
use Database;
use Exception;
use PDO;

class QuizService
{
    private Quiz $quizModel;
    private Question $questionModel;
    private PDO $db;

    public function __construct(?Quiz $quizModel = null, ?Question $questionModel = null, ?PDO $db = null)
    {
        $this->quizModel = $quizModel ?? new Quiz();
        $this->questionModel = $questionModel ?? new Question();
        $this->db = $db ?? Database::getConnection();
    }

    public function getQuizDetail(int $quizId, bool $isAdmin = false): array
    {
        $quiz = $this->quizModel->getQuizWithQuestions($quizId, $isAdmin);
        if (!$quiz) {
            throw new Exception("Không tìm thấy bài kiểm tra.", 404);
        }
        return $quiz;
    }

    public function createQuiz(array $data): array
    {
        $title = trim($data['title'] ?? '');
        if (empty($title)) {
            throw new Exception("Tiêu đề bài kiểm tra không được để trống.", 400);
        }

        $quiz = $this->quizModel->create([
            'lesson_id' => !empty($data['lesson_id']) ? (int) $data['lesson_id'] : null,
            'skill_id' => !empty($data['skill_id']) ? (int) $data['skill_id'] : null,
            'title' => $title,
            'description' => $data['description'] ?? null,
            'passing_score_percent' => (int) ($data['passing_score_percent'] ?? 80),
            'time_limit_minutes' => (int) ($data['time_limit_minutes'] ?? 15),
            'xp_reward' => (int) ($data['xp_reward'] ?? 100),
            'max_attempts' => (int) ($data['max_attempts'] ?? 0),
            'is_published' => isset($data['is_published']) ? (int) $data['is_published'] : 1,
        ]);

        return $this->getQuizDetail((int) $quiz['id'], true);
    }

    public function updateQuiz(int $quizId, array $data): bool
    {
        $quiz = $this->quizModel->findById($quizId);
        if (!$quiz) {
            throw new Exception("Không tìm thấy bài kiểm tra.", 404);
        }

        $fields = ['title', 'description', 'passing_score_percent', 'time_limit_minutes', 'xp_reward', 'max_attempts', 'is_published'];
        $update = [];
        foreach ($fields as $f) {
            if (isset($data[$f]))
                $update[$f] = $data[$f];
        }

        return $this->quizModel->update($quizId, $update);
    }

    public function deleteQuiz(int $quizId): bool
    {
        $quiz = $this->quizModel->findById($quizId);
        if (!$quiz) {
            throw new Exception("Không tìm thấy bài kiểm tra.", 404);
        }
        return $this->quizModel->delete($quizId);
    }

    // Question Bank
    public function getQuestions(?int $skillId = null, ?int $quizId = null, ?string $difficulty = null): array
    {
        $where = [];
        $params = [];

        if ($skillId) {
            $where[] = "q.skill_id = :skill_id";
            $params['skill_id'] = $skillId;
        }
        if ($quizId) {
            $where[] = "q.quiz_id = :quiz_id";
            $params['quiz_id'] = $quizId;
        }
        if ($difficulty) {
            $where[] = "q.difficulty = :difficulty";
            $params['difficulty'] = $difficulty;
        }

        $whereSql = !empty($where) ? "WHERE " . implode(' AND ', $where) : "";

        $stmt = $this->db->prepare("SELECT q.* FROM questions q {$whereSql} ORDER BY q.id DESC");
        $stmt->execute($params);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($questions as &$q) {
            $optStmt = $this->db->prepare("SELECT * FROM question_options WHERE question_id = :q_id ORDER BY order_index ASC");
            $optStmt->execute(['q_id' => $q['id']]);
            $q['options'] = $optStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return $questions;
    }

    public function createQuestion(array $data): array
    {
        $questionText = trim($data['question_text'] ?? '');
        $options = $data['options'] ?? [];

        if (empty($questionText) || empty($options) || !is_array($options)) {
            throw new Exception("Nội dung câu hỏi và danh sách đáp án là bắt buộc.", 400);
        }

        $question = $this->questionModel->create([
            'quiz_id' => !empty($data['quiz_id']) ? (int) $data['quiz_id'] : null,
            'skill_id' => !empty($data['skill_id']) ? (int) $data['skill_id'] : null,
            'question_text' => $questionText,
            'question_type' => $data['question_type'] ?? 'SINGLE_CHOICE',
            'difficulty' => $data['difficulty'] ?? 'MEDIUM',
            'explanation' => $data['explanation'] ?? null,
        ]);

        $qId = (int) $question['id'];

        $optStmt = $this->db->prepare("
            INSERT INTO question_options (question_id, option_text, is_correct, order_index)
            VALUES (:q_id, :opt_text, :is_correct, :order_index)
        ");

        foreach ($options as $idx => $opt) {
            $optStmt->execute([
                'q_id' => $qId,
                'opt_text' => trim($opt['option_text'] ?? ''),
                'is_correct' => !empty($opt['is_correct']) ? 1 : 0,
                'order_index' => (int) ($opt['order_index'] ?? ($idx + 1)),
            ]);
        }

        return $this->questionModel->getQuestionWithOptions($qId);
    }

    public function updateQuestion(int $questionId, array $data): bool
    {
        $question = $this->questionModel->findById($questionId);
        if (!$question) {
            throw new Exception("Không tìm thấy câu hỏi.", 404);
        }

        $fields = ['question_text', 'question_type', 'difficulty', 'explanation'];
        $update = [];
        foreach ($fields as $f) {
            if (isset($data[$f]))
                $update[$f] = $data[$f];
        }

        $this->questionModel->update($questionId, $update);

        // Replace options if passed
        if (isset($data['options']) && is_array($data['options'])) {
            $delStmt = $this->db->prepare("DELETE FROM question_options WHERE question_id = :q_id");
            $delStmt->execute(['q_id' => $questionId]);

            $optStmt = $this->db->prepare("
                INSERT INTO question_options (question_id, option_text, is_correct, order_index)
                VALUES (:q_id, :opt_text, :is_correct, :order_index)
            ");
            foreach ($data['options'] as $idx => $opt) {
                $optStmt->execute([
                    'q_id' => $questionId,
                    'opt_text' => trim($opt['option_text'] ?? ''),
                    'is_correct' => !empty($opt['is_correct']) ? 1 : 0,
                    'order_index' => (int) ($opt['order_index'] ?? ($idx + 1)),
                ]);
            }
        }

        return true;
    }

    public function deleteQuestion(int $questionId): bool
    {
        $question = $this->questionModel->findById($questionId);
        if (!$question) {
            throw new Exception("Không tìm thấy câu hỏi.", 404);
        }
        return $this->questionModel->delete($questionId);
    }

    // Auto-Grading & Quiz Submission
    public function submitQuiz(int $userId, int $quizId, array $userAnswers, int $durationSeconds = 0): array
    {
        $quiz = $this->quizModel->getQuizWithQuestions($quizId, true);
        if (!$quiz) {
            throw new Exception("Không tìm thấy bài kiểm tra.", 404);
        }

        $questions = $quiz['questions'] ?? [];
        $totalQuestions = count($questions);
        if ($totalQuestions === 0) {
            throw new Exception("Bài kiểm tra không có câu hỏi nào.", 400);
        }

        $correctCount = 0;
        $gradedDetails = [];

        foreach ($questions as $q) {
            $qId = (int) $q['id'];
            $submittedOptionId = (int) ($userAnswers[$qId] ?? $userAnswers[(string) $qId] ?? 0);

            // Find correct option for this question
            $correctOptionId = null;
            foreach ($q['options'] as $opt) {
                if ((int) $opt['is_correct'] === 1) {
                    $correctOptionId = (int) $opt['id'];
                    break;
                }
            }

            $isCorrect = ($submittedOptionId > 0 && $submittedOptionId === $correctOptionId);
            if ($isCorrect) {
                $correctCount++;
            }

            $gradedDetails[] = [
                'question_id' => $qId,
                'submitted_option_id' => $submittedOptionId,
                'correct_option_id' => $correctOptionId,
                'is_correct' => $isCorrect,
                'explanation' => $q['explanation'] ?? null,
            ];
        }

        $scorePercent = round(($correctCount / $totalQuestions) * 100, 1);
        $passingScore = (int) ($quiz['passing_score_percent'] ?? 80);
        $passed = ($scorePercent >= $passingScore);

        $xpEarned = 0;
        if ($passed) {
            $xpEarned = (int) ($quiz['xp_reward'] ?? 100);
            $xpService = new XPService($this->db);
            $xpService->awardXP($userId, $xpEarned, 'QUIZ_PASS', "Đạt bài kiểm tra: " . $quiz['title']);

            if (!empty($quiz['skill_id'])) {
                $xpService->updateSkillProgress($userId, (int) $quiz['skill_id']);
            }
        }

        // Save attempt
        $stmt = $this->db->prepare("
            INSERT INTO user_quiz_attempts (user_id, quiz_id, score, total_questions, correct_answers, passed, xp_earned, attempt_duration_seconds)
            VALUES (:user_id, :quiz_id, :score, :total_q, :correct_q, :passed, :xp_earned, :duration)
        ");
        $stmt->execute([
            'user_id' => $userId,
            'quiz_id' => $quizId,
            'score' => $scorePercent,
            'total_q' => $totalQuestions,
            'correct_q' => $correctCount,
            'passed' => $passed ? 1 : 0,
            'xp_earned' => $xpEarned,
            'duration' => $durationSeconds,
        ]);

        return [
            'quiz_id' => $quizId,
            'quiz_title' => $quiz['title'],
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctCount,
            'score_percent' => $scorePercent,
            'passing_score_percent' => $passingScore,
            'passed' => $passed,
            'xp_earned' => $xpEarned,
            'details' => $gradedDetails,
        ];
    }
}
