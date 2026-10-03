import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIQuizGeneratorModal } from '../components/admin/AIQuizGeneratorModal';
import { adminService } from '../services/adminService';
import { aiService } from '../services/aiService';

describe('AI LMS Admin Quiz Generator & Integration Suite', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // Mock getSkills
        vi.spyOn(adminService, 'getSkills').mockResolvedValue([
            { id: 1, title: 'React 19 Core', category: 'Frontend', slug: 'react-19', status: 'ACTIVE' }
        ]);
        // Mock getLessons
        vi.spyOn(adminService, 'getLessons').mockResolvedValue([
            { id: 101, title: 'Optimistic UI with useOptimistic', order_index: 1 }
        ]);
        // Mock createQuestion
        vi.spyOn(adminService, 'createQuestion').mockResolvedValue({
            id: 999,
            question_text: 'Test question',
            difficulty: 'MEDIUM',
            question_type: 'MULTIPLE_CHOICE',
            options: []
        });
    });

    it('renders the AI Quiz Generator Modal with proper controls and title', async () => {
        render(
            <AIQuizGeneratorModal
                isOpen={true}
                onClose={() => {}}
                initialSkillId={1}
            />
        );

        expect(screen.getByText(/AI Quiz Generator/i)).toBeInTheDocument();
        expect(screen.getByText(/Smart LMS/i)).toBeInTheDocument();
        expect(screen.getByText(/Kỹ năng \(Skill\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Độ khó/i)).toBeInTheDocument();
        expect(screen.getByText(/Sinh Bộ Câu Hỏi Bằng AI/i)).toBeInTheDocument();
    });

    it('populates demo lecture note and triggers AI generation', async () => {
        vi.spyOn(aiService, 'generateQuizFromText').mockResolvedValue({
            totalGenerated: 2,
            difficulty: 'MEDIUM',
            questions: [
                {
                    question: 'Mục đích cốt lõi của hook useOptimistic trong React 19 là gì?',
                    options: [
                        'Cập nhật UI ngay lập tức trước khi server phản hồi',
                        'Tạo vòng lặp vô tận trong component',
                        'Quản lý kết nối cơ sở dữ liệu MySQL',
                        'Thay thế toàn bộ CSS framework'
                    ],
                    correctAnswerIndex: 0,
                    explanation: 'useOptimistic giúp tăng trải nghiệm người dùng bằng cách phản hồi lạc quan.',
                    difficulty: 'MEDIUM'
                },
                {
                    question: 'Unidirectional Data Flow là gì?',
                    options: [
                        'Luồng dữ liệu một chiều từ cha xuống con',
                        'Luồng dữ liệu hai chiều tự do',
                        'Truy vấn trực tiếp từ browser vào file hệ thống',
                        'Không có luồng dữ liệu nào'
                    ],
                    correctAnswerIndex: 0,
                    explanation: 'Dữ liệu chỉ di chuyển theo một hướng duy nhất để dễ gỡ lỗi.',
                    difficulty: 'MEDIUM'
                }
            ]
        });

        render(
            <AIQuizGeneratorModal
                isOpen={true}
                onClose={() => {}}
                initialSkillId={1}
            />
        );

        // Click "Dán tài liệu demo"
        const demoButton = screen.getByText(/Dán tài liệu demo/i);
        fireEvent.click(demoButton);

        // Click Generate Button
        const genBtn = screen.getByText(/Sinh Bộ Câu Hỏi Bằng AI/i);
        fireEvent.click(genBtn);

        await waitFor(() => {
            expect(screen.getByText(/Mục đích cốt lõi của hook useOptimistic/i)).toBeInTheDocument();
            expect(screen.getByText(/Unidirectional Data Flow là gì\?/i)).toBeInTheDocument();
        });

        // Verify correct answers and badges
        expect(screen.getAllByText(/Giải thích:/i).length).toBe(2);
        expect(screen.getByText(/Lưu 2 câu đã chọn vào Quiz Bank/i)).toBeInTheDocument();
    });

    it('saves selected generated questions into database via adminService', async () => {
        const createSpy = vi.spyOn(adminService, 'createQuestion').mockResolvedValue({
            id: 1,
            question_text: 'Q1',
            difficulty: 'MEDIUM',
            question_type: 'MULTIPLE_CHOICE',
            options: []
        });

        const successSpy = vi.fn();
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        render(
            <AIQuizGeneratorModal
                isOpen={true}
                onClose={() => {}}
                onSuccess={successSpy}
                initialSkillId={1}
                initialLessonId={101}
                initialContent="Nội dung bài học kiểm thử tự động hóa React 19 và Clean Architecture."
            />
        );

        // Generate questions
        const genBtn = screen.getByText(/Sinh Bộ Câu Hỏi Bằng AI/i);
        fireEvent.click(genBtn);

        await waitFor(() => {
            expect(screen.getByText(/Lưu 3 câu đã chọn vào Quiz Bank/i)).toBeInTheDocument();
        });

        // Click save button
        const saveBtn = screen.getByText(/Lưu 3 câu đã chọn vào Quiz Bank/i);
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(createSpy).toHaveBeenCalled();
            expect(successSpy).toHaveBeenCalled();
        });

        alertSpy.mockRestore();
    });
});
