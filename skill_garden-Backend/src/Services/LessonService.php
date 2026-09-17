<?php
// src/Services/LessonService.php

namespace App\Services;

use App\Models\Lesson;
use Database;
use Exception;
use PDO;

class LessonService
{
    private Lesson $lessonModel;
    private PDO $db;

    public function __construct(?Lesson $lessonModel = null, ?PDO $db = null)
    {
        $this->lessonModel = $lessonModel ?? new Lesson();
        $this->db = $db ?? Database::getConnection();
    }

    private function createSlug(string $title): string
    {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        return trim($slug, '-');
    }

    public function getLessonDetail(int $lessonId, ?int $userId = null): array
    {
        $lesson = $this->lessonModel->getLessonWithMaterials($lessonId);
        if (!$lesson) {
            throw new Exception("Không tìm thấy bài học.", 404);
        }

        if ($userId) {
            // Get user lesson status
            $stmt = $this->db->prepare("SELECT * FROM user_lessons WHERE user_id = :user_id AND lesson_id = :lesson_id");
            $stmt->execute(['user_id' => $userId, 'lesson_id' => $lessonId]);
            $userLesson = $stmt->fetch(PDO::FETCH_ASSOC);

            $lesson['user_progress'] = $userLesson ?: [
                'status' => 'NOT_STARTED',
                'video_watch_seconds' => 0,
                'is_completed' => false,
            ];

            // Get user notes for this lesson
            $noteStmt = $this->db->prepare("SELECT * FROM user_lesson_notes WHERE user_id = :user_id AND lesson_id = :lesson_id ORDER BY timestamp_seconds ASC");
            $noteStmt->execute(['user_id' => $userId, 'lesson_id' => $lessonId]);
            $lesson['user_notes'] = $noteStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return $lesson;
    }

    public function createLesson(array $data): array
    {
        $title = trim($data['title'] ?? '');
        $moduleId = (int) ($data['module_id'] ?? 0);

        if (empty($title) || $moduleId <= 0) {
            throw new Exception("Tên bài học và ID module là bắt buộc.", 400);
        }

        $slug = $data['slug'] ?? $this->createSlug($title);

        $lesson = $this->lessonModel->create([
            'module_id' => $moduleId,
            'title' => $title,
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'content_type' => $data['content_type'] ?? 'VIDEO',
            'video_url' => $data['video_url'] ?? null,
            'video_duration_seconds' => (int) ($data['video_duration_seconds'] ?? 0),
            'theory_content' => $data['theory_content'] ?? null,
            'code_example' => $data['code_example'] ?? null,
            'xp_reward' => (int) ($data['xp_reward'] ?? 50),
            'growth_impact_percent' => (float) ($data['growth_impact_percent'] ?? 5.0),
            'order_index' => (int) ($data['order_index'] ?? 1),
            'is_required' => isset($data['is_required']) ? (int) $data['is_required'] : 1,
            'is_published' => isset($data['is_published']) ? (int) $data['is_published'] : 1,
        ]);

        // Add materials if present
        if (!empty($data['materials']) && is_array($data['materials'])) {
            $matStmt = $this->db->prepare("
                INSERT INTO lesson_materials (lesson_id, title, file_url, file_type, file_size_bytes)
                VALUES (:lesson_id, :title, :file_url, :file_type, :file_size_bytes)
            ");
            foreach ($data['materials'] as $mat) {
                $matStmt->execute([
                    'lesson_id' => $lesson['id'],
                    'title' => $mat['title'] ?? 'Tài liệu bài học',
                    'file_url' => $mat['file_url'],
                    'file_type' => $mat['file_type'] ?? 'pdf',
                    'file_size_bytes' => (int) ($mat['file_size_bytes'] ?? 0),
                ]);
            }
        }

        return $this->getLessonDetail((int) $lesson['id']);
    }

    public function updateLesson(int $lessonId, array $data): bool
    {
        $lesson = $this->lessonModel->findById($lessonId);
        if (!$lesson) {
            throw new Exception("Không tìm thấy bài học.", 404);
        }

        $fields = [
            'title',
            'description',
            'content_type',
            'video_url',
            'video_duration_seconds',
            'theory_content',
            'code_example',
            'xp_reward',
            'growth_impact_percent',
            'order_index',
            'is_required',
            'is_published'
        ];

        $update = [];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $update[$field] = $data[$field];
            }
        }

        return $this->lessonModel->update($lessonId, $update);
    }

    public function deleteLesson(int $lessonId): bool
    {
        $lesson = $this->lessonModel->findById($lessonId);
        if (!$lesson) {
            throw new Exception("Không tìm thấy bài học.", 404);
        }

        return $this->lessonModel->delete($lessonId);
    }

    public function completeLesson(int $userId, int $lessonId): array
    {
        $lesson = $this->lessonModel->findById($lessonId);
        if (!$lesson) {
            throw new Exception("Không tìm thấy bài học.", 404);
        }

        // Check if already completed
        $checkStmt = $this->db->prepare("SELECT is_completed FROM user_lessons WHERE user_id = :user_id AND lesson_id = :lesson_id");
        $checkStmt->execute(['user_id' => $userId, 'lesson_id' => $lessonId]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        $alreadyCompleted = (bool) ($existing['is_completed'] ?? false);

        if ($existing) {
            $stmt = $this->db->prepare("
                UPDATE user_lessons 
                SET status = 'COMPLETED', is_completed = 1, completed_at = NOW() 
                WHERE user_id = :user_id AND lesson_id = :lesson_id
            ");
            $stmt->execute(['user_id' => $userId, 'lesson_id' => $lessonId]);
        } else {
            $stmt = $this->db->prepare("
                INSERT INTO user_lessons (user_id, lesson_id, status, is_completed, completed_at)
                VALUES (:user_id, :lesson_id, 'COMPLETED', 1, NOW())
            ");
            $stmt->execute(['user_id' => $userId, 'lesson_id' => $lessonId]);
        }

        $xpEarned = 0;
        if (!$alreadyCompleted) {
            $xpEarned = (int) ($lesson['xp_reward'] ?? 50);
            $xpService = new XPService($this->db);
            $xpService->awardXP($userId, $xpEarned, 'LESSON_COMPLETE', "Hoàn thành bài học: " . $lesson['title']);

            // Find skill_id for this lesson to update progress
            $skillStmt = $this->db->prepare("
                SELECT lp.skill_id 
                FROM lessons l
                JOIN modules m ON l.module_id = m.id
                JOIN learning_paths lp ON m.learning_path_id = lp.id
                WHERE l.id = :lesson_id LIMIT 1
            ");
            $skillStmt->execute(['lesson_id' => $lessonId]);
            $skillId = (int) $skillStmt->fetchColumn();

            if ($skillId > 0) {
                $xpService->updateSkillProgress($userId, $skillId);
            }
        }

        return [
            'lesson_id' => $lessonId,
            'is_completed' => true,
            'xp_earned' => $xpEarned,
            'already_completed' => $alreadyCompleted,
        ];
    }

    public function updateWatchProgress(int $userId, int $lessonId, int $seconds): bool
    {
        $stmt = $this->db->prepare("
            INSERT INTO user_lessons (user_id, lesson_id, status, video_watch_seconds)
            VALUES (:user_id, :lesson_id, 'IN_PROGRESS', :seconds)
            ON DUPLICATE KEY UPDATE 
                video_watch_seconds = GREATEST(video_watch_seconds, VALUES(video_watch_seconds)),
                status = IF(status = 'COMPLETED', 'COMPLETED', 'IN_PROGRESS')
        ");
        return $stmt->execute(['user_id' => $userId, 'lesson_id' => $lessonId, 'seconds' => $seconds]);
    }

    // Notes
    public function addNote(int $userId, int $lessonId, string $noteText, int $timestampSeconds = 0): array
    {
        $stmt = $this->db->prepare("
            INSERT INTO user_lesson_notes (user_id, lesson_id, timestamp_seconds, note_text)
            VALUES (:user_id, :lesson_id, :timestamp_seconds, :note_text)
        ");
        $stmt->execute([
            'user_id' => $userId,
            'lesson_id' => $lessonId,
            'timestamp_seconds' => $timestampSeconds,
            'note_text' => trim($noteText)
        ]);

        $noteId = (int) $this->db->lastInsertId();
        return [
            'id' => $noteId,
            'user_id' => $userId,
            'lesson_id' => $lessonId,
            'timestamp_seconds' => $timestampSeconds,
            'note_text' => trim($noteText),
            'created_at' => date('Y-m-d H:i:s'),
        ];
    }

    public function deleteNote(int $userId, int $noteId): bool
    {
        $stmt = $this->db->prepare("DELETE FROM user_lesson_notes WHERE id = :id AND user_id = :user_id");
        return $stmt->execute(['id' => $noteId, 'user_id' => $userId]);
    }
}
