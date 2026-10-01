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

    public function getPublishedLessonsBySkillId(int $skillId, ?int $userId = null): array
    {
        $stmt = $this->db->prepare("
            SELECT l.*, m.title AS module_title, m.order_index AS module_order, lp.skill_id, s.title AS skill_title
            FROM lessons l
            JOIN modules m ON l.module_id = m.id
            JOIN learning_paths lp ON m.learning_path_id = lp.id
            JOIN skills s ON lp.skill_id = s.id
            WHERE lp.skill_id = :skill_id AND l.is_published = 1
            ORDER BY m.order_index ASC, l.order_index ASC, l.id ASC
        ");
        $stmt->execute(['skill_id' => $skillId]);
        $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($lessons)) {
            return [];
        }

        // Fetch user progress for all lessons in this skill if userId provided
        $userProgressMap = [];
        if ($userId) {
            $lessonIds = array_column($lessons, 'id');
            if (!empty($lessonIds)) {
                $placeholders = implode(',', array_fill(0, count($lessonIds), '?'));
                $progressStmt = $this->db->prepare("
                    SELECT lesson_id, status, video_watch_seconds, is_completed, completed_at
                    FROM user_lessons
                    WHERE user_id = ? AND lesson_id IN ($placeholders)
                ");
                $params = array_merge([$userId], $lessonIds);
                $progressStmt->execute($params);
                while ($row = $progressStmt->fetch(PDO::FETCH_ASSOC)) {
                    $userProgressMap[(int) $row['lesson_id']] = $row;
                }
            }
        }

        // Sequential unlock calculation
        $result = [];
        $previousLessonCompleted = true; // First lesson is always unlocked

        foreach ($lessons as $index => $l) {
            $lid = (int) $l['id'];
            $prog = $userProgressMap[$lid] ?? null;
            $isCompleted = !empty($prog['is_completed']);
            $watchSeconds = (int) ($prog['video_watch_seconds'] ?? 0);

            // Sequential rule: Lesson 0 is unlocked. Lesson N is unlocked only if Lesson N-1 was completed.
            $isUnlocked = ($index === 0) || $previousLessonCompleted;

            $status = 'LOCKED';
            if ($isCompleted) {
                $status = 'COMPLETED';
            } elseif ($isUnlocked) {
                $status = 'ACTIVE';
            }

            $l['is_completed'] = $isCompleted;
            $l['video_watch_seconds'] = $watchSeconds;
            $l['is_unlocked'] = $isUnlocked;
            $l['status'] = $status;
            $l['user_progress'] = $prog ?: [
                'status' => $status,
                'video_watch_seconds' => $watchSeconds,
                'is_completed' => $isCompleted,
            ];

            $result[] = $l;

            // For the next lesson in sequence
            $previousLessonCompleted = $isCompleted;
        }

        return $result;
    }

    public function getAdminLessonsBySkillId(int $skillId = 0): array
    {
        $sql = "
            SELECT l.*, m.title AS module_title, m.order_index AS module_order, lp.skill_id, s.title AS skill_title
            FROM lessons l
            JOIN modules m ON l.module_id = m.id
            JOIN learning_paths lp ON m.learning_path_id = lp.id
            JOIN skills s ON lp.skill_id = s.id
        ";
        $params = [];
        if ($skillId > 0) {
            $sql .= " WHERE lp.skill_id = :skill_id";
            $params['skill_id'] = $skillId;
        }
        $sql .= " ORDER BY lp.skill_id ASC, m.order_index ASC, l.order_index ASC, l.id ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createLesson(array $data): array
    {
        $title = trim($data['title'] ?? '');
        $moduleId = (int) ($data['module_id'] ?? 0);

        if ($moduleId <= 0 && !empty($data['skill_id'])) {
            $skillId = (int) $data['skill_id'];
            $chapter = (int) ($data['chapter'] ?? $data['chapter_id'] ?? 1);
            if ($chapter <= 0) $chapter = 1;

            // 1. Ensure Skill exists
            $skillCheck = $this->db->prepare("SELECT id FROM skills WHERE id = :skill_id");
            $skillCheck->execute(['skill_id' => $skillId]);
            if (!$skillCheck->fetchColumn()) {
                $insertSkill = $this->db->prepare("INSERT INTO skills (id, title, slug, category, status) VALUES (:id, :title, :slug, 'Development', 'ACTIVE')");
                $insertSkill->execute([
                    'id' => $skillId,
                    'title' => "Kỹ năng #" . $skillId,
                    'slug' => "skill-" . $skillId
                ]);
            }

            // 2. Ensure Learning Path exists
            $lpStmt = $this->db->prepare("SELECT id FROM learning_paths WHERE skill_id = :skill_id ORDER BY id ASC LIMIT 1");
            $lpStmt->execute(['skill_id' => $skillId]);
            $lpId = (int) $lpStmt->fetchColumn();

            if ($lpId <= 0) {
                $insertLp = $this->db->prepare("INSERT INTO learning_paths (skill_id, title) VALUES (:skill_id, 'Lộ trình học chuẩn')");
                $insertLp->execute(['skill_id' => $skillId]);
                $lpId = (int) $this->db->lastInsertId();
            }

            // 3. Find Module matching chapter order_index or create it
            $moduleStmt = $this->db->prepare("
                SELECT id FROM modules WHERE learning_path_id = :lp_id AND order_index = :order_index LIMIT 1
            ");
            $moduleStmt->execute(['lp_id' => $lpId, 'order_index' => $chapter]);
            $moduleId = (int) $moduleStmt->fetchColumn();

            if ($moduleId <= 0) {
                $insertMod = $this->db->prepare("INSERT INTO modules (learning_path_id, title, order_index) VALUES (:lp_id, :title, :order_index)");
                $insertMod->execute([
                    'lp_id' => $lpId,
                    'title' => "Chương $chapter: Kiến thức chuyên sâu & Thực chiến",
                    'order_index' => $chapter
                ]);
                $moduleId = (int) $this->db->lastInsertId();
            }
        }

        if (empty($title) || $moduleId <= 0) {
            throw new Exception("Tên bài học và ID module là bắt buộc.", 400);
        }

        $baseSlug = $data['slug'] ?? $this->createSlug($title);
        $slug = $baseSlug ?: 'lesson-' . time();
        $slugCheck = $this->db->prepare("SELECT id FROM lessons WHERE slug = :slug");
        $slugCheck->execute(['slug' => $slug]);
        if ($slugCheck->fetchColumn()) {
            $slug = $slug . '-' . substr(uniqid(), -5);
        }

        $orderIndex = isset($data['order_index']) && (int) $data['order_index'] > 0
            ? (int) $data['order_index']
            : (int) ($this->db->query("SELECT COALESCE(MAX(order_index), 0) + 1 FROM lessons WHERE module_id = " . (int)$moduleId)->fetchColumn() ?: 1);

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
            'order_index' => $orderIndex,
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

        if (!empty($data['module_id'])) {
            $update['module_id'] = (int) $data['module_id'];
        } elseif (!empty($data['chapter']) || !empty($data['skill_id'])) {
            $skillId = (int) ($data['skill_id'] ?? 0);
            if ($skillId <= 0) {
                $curMod = $this->db->query("SELECT lp.skill_id FROM modules m JOIN learning_paths lp ON m.learning_path_id = lp.id WHERE m.id = " . (int)$lesson['module_id'])->fetch(PDO::FETCH_ASSOC);
                $skillId = (int) ($curMod['skill_id'] ?? 1);
            }
            $chapter = (int) ($data['chapter'] ?? 1);
            if ($chapter <= 0) $chapter = 1;

            $lpStmt = $this->db->prepare("SELECT id FROM learning_paths WHERE skill_id = :skill_id ORDER BY id ASC LIMIT 1");
            $lpStmt->execute(['skill_id' => $skillId]);
            $lpId = (int) $lpStmt->fetchColumn();

            if ($lpId > 0) {
                $moduleStmt = $this->db->prepare("SELECT id FROM modules WHERE learning_path_id = :lp_id AND order_index = :order_index LIMIT 1");
                $moduleStmt->execute(['lp_id' => $lpId, 'order_index' => $chapter]);
                $targetModuleId = (int) $moduleStmt->fetchColumn();
                if ($targetModuleId <= 0) {
                    $insertMod = $this->db->prepare("INSERT INTO modules (learning_path_id, title, order_index) VALUES (:lp_id, :title, :order_index)");
                    $insertMod->execute([
                        'lp_id' => $lpId,
                        'title' => "Chương $chapter: Kiến thức chuyên sâu & Thực chiến",
                        'order_index' => $chapter
                    ]);
                    $targetModuleId = (int) $this->db->lastInsertId();
                }
                if ($targetModuleId > 0) {
                    $update['module_id'] = $targetModuleId;
                }
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

    /**
     * Check if a lesson is unlocked for a user based on sequential order.
     * Throws Exception with code 403 if locked.
     */
    public function checkSequentialUnlock(int $userId, int $lessonId): void
    {
        // 1. Find skill_id for this lesson
        $skillStmt = $this->db->prepare("
            SELECT lp.skill_id 
            FROM lessons l
            JOIN modules m ON l.module_id = m.id
            JOIN learning_paths lp ON m.learning_path_id = lp.id
            WHERE l.id = :lesson_id LIMIT 1
        ");
        $skillStmt->execute(['lesson_id' => $lessonId]);
        $skillId = (int) $skillStmt->fetchColumn();

        if ($skillId <= 0) {
            return;
        }

        // 2. Fetch all published lessons in order for this skill
        $published = $this->getPublishedLessonsBySkillId($skillId, $userId);
        if (empty($published)) {
            return;
        }

        $lessonIndex = -1;
        foreach ($published as $idx => $item) {
            if ((int) $item['id'] === $lessonId) {
                $lessonIndex = $idx;
                break;
            }
        }

        // If not first lesson, verify that the immediately previous lesson is completed
        if ($lessonIndex > 0) {
            $prevLesson = $published[$lessonIndex - 1];
            if (empty($prevLesson['is_completed'])) {
                $prevTitle = $prevLesson['title'] ?? "bài học trước đó";
                throw new Exception("Bạn cần xem và hoàn thành 100% video bài học '{$prevTitle}' trước khi mở khóa bài học này.", 403);
            }
        }
    }

    public function completeLesson(int $userId, int $lessonId, int $watchSeconds = 0): array
    {
        $lesson = $this->lessonModel->findById($lessonId);
        if (!$lesson) {
            throw new Exception("Không tìm thấy bài học.", 404);
        }

        // Verify sequential unlock rule
        $this->checkSequentialUnlock($userId, $lessonId);

        // Check if already completed
        $checkStmt = $this->db->prepare("SELECT is_completed, video_watch_seconds FROM user_lessons WHERE user_id = :user_id AND lesson_id = :lesson_id");
        $checkStmt->execute(['user_id' => $userId, 'lesson_id' => $lessonId]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        $alreadyCompleted = (bool) ($existing['is_completed'] ?? false);
        $finalWatchSeconds = max((int) ($existing['video_watch_seconds'] ?? 0), $watchSeconds);
        if ($finalWatchSeconds <= 0 && !empty($lesson['video_duration_seconds'])) {
            $finalWatchSeconds = (int) $lesson['video_duration_seconds'];
        }

        if ($existing) {
            $stmt = $this->db->prepare("
                UPDATE user_lessons 
                SET status = 'COMPLETED', is_completed = 1, video_watch_seconds = :watch_seconds, completed_at = NOW() 
                WHERE user_id = :user_id AND lesson_id = :lesson_id
            ");
            $stmt->execute([
                'user_id' => $userId,
                'lesson_id' => $lessonId,
                'watch_seconds' => $finalWatchSeconds,
            ]);
        } else {
            $stmt = $this->db->prepare("
                INSERT INTO user_lessons (user_id, lesson_id, status, video_watch_seconds, is_completed, completed_at)
                VALUES (:user_id, :lesson_id, 'COMPLETED', :watch_seconds, 1, NOW())
            ");
            $stmt->execute([
                'user_id' => $userId,
                'lesson_id' => $lessonId,
                'watch_seconds' => $finalWatchSeconds,
            ]);
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
            'video_watch_seconds' => $finalWatchSeconds,
            'xp_earned' => $xpEarned,
            'already_completed' => $alreadyCompleted,
        ];
    }

    public function updateWatchProgress(int $userId, int $lessonId, int $seconds, bool $autoCompleteIf100 = false, int $duration = 0): array
    {
        $lesson = $this->lessonModel->findById($lessonId);
        if (!$lesson) {
            throw new Exception("Không tìm thấy bài học.", 404);
        }

        // Verify sequential unlock rule
        $this->checkSequentialUnlock($userId, $lessonId);

        $videoDuration = $duration > 0 ? $duration : (int) ($lesson['video_duration_seconds'] ?? 0);

        // Check if 100% completed
        if ($autoCompleteIf100 || ($videoDuration > 0 && $seconds >= ($videoDuration - 1))) {
            return $this->completeLesson($userId, $lessonId, $seconds);
        }

        $stmt = $this->db->prepare("
            INSERT INTO user_lessons (user_id, lesson_id, status, video_watch_seconds)
            VALUES (:user_id, :lesson_id, 'IN_PROGRESS', :seconds)
            ON DUPLICATE KEY UPDATE 
                video_watch_seconds = GREATEST(video_watch_seconds, VALUES(video_watch_seconds)),
                status = IF(status = 'COMPLETED', 'COMPLETED', 'IN_PROGRESS')
        ");
        $stmt->execute(['user_id' => $userId, 'lesson_id' => $lessonId, 'seconds' => $seconds]);

        return [
            'lesson_id' => $lessonId,
            'video_watch_seconds' => $seconds,
            'is_completed' => false,
            'already_completed' => false,
            'xp_earned' => 0,
        ];
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
