import React, { useState, useEffect } from 'react'
import {
    Sparkles,
    X,
    CheckCircle2,
    BookOpen,
    Tag,
    Layers,
    RefreshCw,
    HelpCircle,
    Check,
    AlertCircle,
    FileText,
    ArrowRight
} from 'lucide-react'
import { Button } from '../ui/Button'
import { adminService, SkillItem } from '../../services/adminService'
import { aiService } from '../../services/aiService'
import { GeneratedQuizQuestion } from '../../types/ai'

interface AIQuizGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (createdCount: number) => void;
    initialSkillId?: number | '';
    initialLessonId?: number | '';
    initialContent?: string;
    initialTitle?: string;
}

const SAMPLE_LECTURE_NOTE = `Mô hình kiến trúc Component và Luồng dữ liệu trong React 19:
React 19 giới thiệu các cải tiến đột phá trong việc tối ưu hóa hiệu năng và trải nghiệm người dùng (UX). Điểm cốt lõi là luồng dữ liệu một chiều (Unidirectional Data Flow) giúp ứng dụng dễ đoán và dễ bảo trì.
1. useActionState: Quản lý trạng thái bất đồng bộ của Form, tự động bắt lỗi và thiết lập cờ isPending mà không cần quản lý thủ công nhiều useState.
2. useOptimistic: Cập nhật giao diện người dùng tức thì (Optimistic UI) trước khi Server trả về kết quả, đem lại trải nghiệm mượt mà không độ trễ.
3. useTransition: Phân loại cập nhật state thành ưu tiên cao (gõ phím, click) và ưu tiên thấp (lọc dữ liệu, đổi trang), giữ UI luôn đạt 60 khung hình/giây.
Nguyên tắc bất biến: Luôn kiểm thử tự động, tuân thủ Clean Architecture và hạn chế re-render dư thừa bằng cách tách component con độc lập.`;

export const AIQuizGeneratorModal: React.FC<AIQuizGeneratorModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialSkillId = '',
    initialLessonId = '',
    initialContent = '',
    initialTitle = ''
}) => {
    // Skills & Lessons
    const [skills, setSkills] = useState<SkillItem[]>([])
    const [lessons, setLessons] = useState<any[]>([])
    const [skillId, setSkillId] = useState<number | ''>(initialSkillId)
    const [lessonId, setLessonId] = useState<number | ''>(initialLessonId)

    // Generator inputs
    const [content, setContent] = useState(initialContent)
    const [difficulty, setDifficulty] = useState<string>('MEDIUM')
    const [numQuestions, setNumQuestions] = useState<number>(5)

    // UI States
    const [isLoadingSkills, setIsLoadingSkills] = useState(false)
    const [isLoadingLessons, setIsLoadingLessons] = useState(false)
    const [isFetchingLessonContent, setIsFetchingLessonContent] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveProgress, setSaveProgress] = useState<{ current: number; total: number } | null>(null)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')

    // Generated Questions List
    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuizQuestion[]>([])
    const [selectedIndices, setSelectedIndices] = useState<number[]>([])

    // Load skills
    useEffect(() => {
        if (!isOpen) return

        const fetchSkills = async () => {
            setIsLoadingSkills(true)
            try {
                const data = await adminService.getSkills()
                setSkills(data)
                if (!skillId && data.length > 0) {
                    setSkillId(data[0].id)
                }
            } catch (err) {
                console.error('Lỗi tải danh sách Skill:', err)
            } finally {
                setIsLoadingSkills(false)
            }
        }

        fetchSkills()
    }, [isOpen])

    // Load lessons when skillId changes
    useEffect(() => {
        if (!skillId) {
            setLessons([])
            setLessonId('')
            return
        }

        const fetchLessons = async () => {
            setIsLoadingLessons(true)
            try {
                const data = await adminService.getLessons(Number(skillId))
                const list = Array.isArray(data) ? data : []
                setLessons(list)
                if (list.length > 0 && !lessonId) {
                    setLessonId(list[0].id)
                }
            } catch (err) {
                console.error('Lỗi tải bài học:', err)
                setLessons([])
            } finally {
                setIsLoadingLessons(false)
            }
        }

        fetchLessons()
    }, [skillId])

    // If initialContent or initialSkillId changes
    useEffect(() => {
        if (initialContent) {
            setContent(initialContent)
        }
        if (initialSkillId) {
            setSkillId(initialSkillId)
        }
        if (initialLessonId) {
            setLessonId(initialLessonId)
        }
    }, [initialContent, initialSkillId, initialLessonId])

    // Fetch lesson content automatically
    const handleFetchLessonContent = async () => {
        if (!lessonId) {
            alert('Vui lòng chọn bài học trước để trích xuất nội dung.')
            return
        }
        setIsFetchingLessonContent(true)
        setErrorMessage('')
        try {
            const res = await fetch(`/api/lessons.php?id=${lessonId}`)
            const data = await res.json()
            if (data.success && data.data) {
                const item = data.data
                const text = [
                    item.title ? `Tiêu đề bài học: ${item.title}` : '',
                    item.description ? `Mô tả: ${item.description}` : '',
                    item.content ? `Nội dung chi tiết:\n${item.content}` : ''
                ].filter(Boolean).join('\n\n')

                if (text.trim()) {
                    setContent(text)
                    setSuccessMessage(`Đã lấy nội dung từ "${item.title || 'Bài học'}" thành công!`)
                    setTimeout(() => setSuccessMessage(''), 3000)
                } else {
                    setErrorMessage('Bài học này chưa có nội dung chi tiết. Vui lòng nhập hoặc dán nội dung thủ công.')
                }
            } else {
                setErrorMessage(data.message || 'Không thể lấy nội dung bài học.')
            }
        } catch {
            setErrorMessage('Lỗi khi kết nối lấy nội dung bài học.')
        } finally {
            setIsFetchingLessonContent(false)
        }
    }

    // Generate questions with AI
    const handleGenerate = async () => {
        if (!content.trim() || content.trim().length < 30) {
            setErrorMessage('Vui lòng cung cấp ít nhất 30 ký tự nội dung tài liệu/bài giảng để AI phân tích.')
            return
        }

        setIsGenerating(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const res = await aiService.generateQuizFromText(content.trim(), numQuestions, difficulty)
            if (res && res.questions && res.questions.length > 0) {
                setGeneratedQuestions(res.questions)
                // Select all by default
                setSelectedIndices(res.questions.map((_, idx) => idx))
                setSuccessMessage(`AI đã tạo thành công ${res.questions.length} câu hỏi chuẩn sư phạm!`)
            } else {
                setErrorMessage('AI không thể trích xuất câu hỏi từ văn bản này. Vui lòng kiểm tra lại nội dung tài liệu.')
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Lỗi khi gọi AI sinh câu hỏi.')
        } finally {
            setIsGenerating(false)
        }
    }

    // Toggle single question selection
    const toggleSelect = (index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedIndices.length === generatedQuestions.length) {
            setSelectedIndices([])
        } else {
            setSelectedIndices(generatedQuestions.map((_, idx) => idx))
        }
    }

    // Update question content locally
    const handleQuestionTextChange = (index: number, newText: string) => {
        setGeneratedQuestions(prev =>
            prev.map((q, i) => (i === index ? { ...q, question: newText } : q))
        )
    }

    // Change correct answer for a question
    const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
        setGeneratedQuestions(prev =>
            prev.map((q, i) => (i === questionIndex ? { ...q, correctAnswerIndex: optionIndex } : q))
        )
    }

    // Save selected questions into Quiz Bank Database
    const handleSaveToBank = async () => {
        if (selectedIndices.length === 0) {
            alert('Vui lòng chọn ít nhất 1 câu hỏi để lưu.')
            return
        }

        setIsSaving(true)
        setErrorMessage('')
        let savedCount = 0
        setSaveProgress({ current: 0, total: selectedIndices.length })

        try {
            for (let i = 0; i < selectedIndices.length; i++) {
                const qIdx = selectedIndices[i]
                const q = generatedQuestions[qIdx]

                const payload = {
                    skill_id: skillId ? Number(skillId) : undefined,
                    lesson_id: lessonId ? Number(lessonId) : undefined,
                    question_text: q.question.trim(),
                    difficulty: q.difficulty || difficulty,
                    explanation: q.explanation?.trim() || undefined,
                    options: q.options.map((optText, optIdx) => ({
                        option_text: optText.trim(),
                        is_correct: optIdx === q.correctAnswerIndex,
                        order_index: optIdx + 1
                    }))
                }

                await adminService.createQuestion(payload)
                savedCount++
                setSaveProgress({ current: savedCount, total: selectedIndices.length })
            }

            alert(`Đã lưu thành công ${savedCount} câu hỏi AI vào Ngân hàng Quiz!`)
            if (onSuccess) {
                onSuccess(savedCount)
            }
            handleClose()
        } catch (err: any) {
            setErrorMessage(`Lỗi khi lưu câu hỏi (Đã lưu được ${savedCount}/${selectedIndices.length}): ${err.message}`)
        } finally {
            setIsSaving(false)
            setSaveProgress(null)
        }
    }

    const handleClose = () => {
        setGeneratedQuestions([])
        setSelectedIndices([])
        setErrorMessage('')
        setSuccessMessage('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border border-[#E2E4EB] dark:border-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-gray-900 dark:text-gray-100">
                {/* Header */}
                <div className="p-6 border-b border-[#E2E4EB] dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-50 via-indigo-50/40 to-white dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                    AI Quiz Generator
                                </h2>
                                <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    Smart LMS
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Tự động bóc tách tài liệu bài giảng & sinh bộ đề trắc nghiệm kèm giải thích chuẩn hóa.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSaving}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Notifications */}
                {errorMessage && (
                    <div className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="mx-6 mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                    {/* Setup Controls */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-750 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            {/* Skill Dropdown */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <Tag className="w-3.5 h-3.5 text-indigo-500" /> Kỹ năng (Skill)
                                </label>
                                <select
                                    value={skillId}
                                    onChange={e => setSkillId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">-- Chọn Kỹ Năng --</option>
                                    {skills.map(s => (
                                        <option key={s.id} value={s.id}>
                                            [{s.category}] {s.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lesson Dropdown */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Bài học
                                    </label>
                                    {lessonId && (
                                        <button
                                            type="button"
                                            onClick={handleFetchLessonContent}
                                            disabled={isFetchingLessonContent}
                                            className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-bold"
                                        >
                                            {isFetchingLessonContent ? 'Đang trích xuất...' : '📥 Lấy nội dung'}
                                        </button>
                                    )}
                                </div>
                                <select
                                    value={lessonId}
                                    onChange={e => setLessonId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">-- Tất cả / Không chọn --</option>
                                    {lessons.map(l => (
                                        <option key={l.id} value={l.id}>
                                            Bài {l.order_index}: {l.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5 text-amber-500" /> Độ khó
                                </label>
                                <select
                                    value={difficulty}
                                    onChange={e => setDifficulty(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="EASY">Dễ (Easy)</option>
                                    <option value="MEDIUM">Trung bình (Medium)</option>
                                    <option value="HARD">Khó (Hard)</option>
                                </select>
                            </div>

                            {/* Number of questions */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Số lượng câu
                                </label>
                                <select
                                    value={numQuestions}
                                    onChange={e => setNumQuestions(Number(e.target.value))}
                                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value={3}>3 câu hỏi (Nhanh)</option>
                                    <option value={5}>5 câu hỏi (Khuyên dùng)</option>
                                    <option value={8}>8 câu hỏi</option>
                                    <option value={10}>10 câu hỏi (Đầy đủ)</option>
                                </select>
                            </div>
                        </div>

                        {/* Content text area */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-purple-500" /> Nội dung bài giảng / Slide / Tài liệu ({content.length} ký tự)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setContent(SAMPLE_LECTURE_NOTE)}
                                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                                >
                                    📋 Dán tài liệu demo
                                </button>
                            </div>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Dán nội dung bài học, tóm tắt video transcript hoặc slide giáo trình vào đây để AI phân tích và tạo câu hỏi..."
                                rows={5}
                                className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-mono placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Generate button */}
                        <div className="flex justify-end">
                            <Button
                                variant="primary"
                                disabled={isGenerating || !content.trim()}
                                onClick={handleGenerate}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-purple-500/20 px-6 py-2.5"
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>AI Đang Phân Tích & Sinh Câu Hỏi...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Sinh Bộ Câu Hỏi Bằng AI</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Questions Preview Section */}
                    {generatedQuestions.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        <span>Danh sách câu hỏi được tạo ({generatedQuestions.length})</span>
                                    </h3>
                                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md font-bold text-[11px]">
                                        Đã chọn: {selectedIndices.length}/{generatedQuestions.length}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleSelectAll}
                                    className="font-bold text-[11px]"
                                >
                                    {selectedIndices.length === generatedQuestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {generatedQuestions.map((q, qIndex) => {
                                    const isSelected = selectedIndices.includes(qIndex)
                                    return (
                                        <div
                                            key={qIndex}
                                            className={`p-4 rounded-2xl border transition-all ${
                                                isSelected
                                                    ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800 shadow-sm'
                                                    : 'bg-white dark:bg-gray-800/40 border-gray-200 dark:border-gray-750 opacity-70'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(qIndex)}
                                                    className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                />
                                                <div className="flex-1 space-y-3">
                                                    {/* Question Title & Difficulty */}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-extrabold text-purple-700 dark:text-purple-300">
                                                            Câu {qIndex + 1}:
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                            {q.difficulty || difficulty}
                                                        </span>
                                                    </div>

                                                    <textarea
                                                        value={q.question}
                                                        onChange={e => handleQuestionTextChange(qIndex, e.target.value)}
                                                        rows={2}
                                                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold text-xs outline-none focus:ring-1 focus:ring-purple-500"
                                                    />

                                                    {/* Options */}
                                                    <div className="space-y-1.5">
                                                        <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                                            Các phương án lựa chọn (Click nút tròn để đặt đáp án đúng):
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {q.options.map((opt, optIndex) => {
                                                                const isCorrect = optIndex === q.correctAnswerIndex
                                                                return (
                                                                    <div
                                                                        key={optIndex}
                                                                        onClick={() => handleCorrectOptionChange(qIndex, optIndex)}
                                                                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                                                                            isCorrect
                                                                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                                                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                                                        }`}
                                                                    >
                                                                        <div
                                                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                                                isCorrect
                                                                                    ? 'bg-emerald-600 text-white'
                                                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                                            }`}
                                                                        >
                                                                            {String.fromCharCode(65 + optIndex)}
                                                                        </div>
                                                                        <span className="flex-1 text-xs truncate">{opt}</span>
                                                                        {isCorrect && (
                                                                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Explanation */}
                                                    {q.explanation && (
                                                        <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300 font-medium">
                                                            <span className="font-bold">💡 Giải thích: </span>
                                                            {q.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-5 border-t border-[#E2E4EB] dark:border-gray-800 flex items-center justify-between bg-gray-50/60 dark:bg-gray-850">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {saveProgress ? (
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                Đang lưu: {saveProgress.current} / {saveProgress.total} câu hỏi...
                            </span>
                        ) : generatedQuestions.length > 0 ? (
                            <span>Đã chọn {selectedIndices.length} câu hỏi để thêm vào Ngân hàng Quiz</span>
                        ) : (
                            <span>Điền thông tin và bấm 'Sinh Bộ Câu Hỏi' để bắt đầu.</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSaving}
                            className="dark:border-gray-700 dark:hover:bg-gray-800 font-bold"
                        >
                            Hủy bỏ
                        </Button>

                        {generatedQuestions.length > 0 && (
                            <Button
                                variant="primary"
                                onClick={handleSaveToBank}
                                disabled={isSaving || selectedIndices.length === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-2 shadow-md shadow-indigo-500/20 px-5"
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Đang lưu vào CSDL...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Lưu {selectedIndices.length} câu đã chọn vào Quiz Bank</span>
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
