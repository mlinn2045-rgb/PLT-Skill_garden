import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, Plus, Edit, Trash2, CheckCircle, Tag, RefreshCw, Filter } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { adminService, QuizQuestion, SkillItem } from '../../services/adminService'

export const QuizBankManagementPage: React.FC = () => {
    const navigate = useNavigate()
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [skills, setSkills] = useState<SkillItem[]>([])
    const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    const fetchData = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const [qData, sData] = await Promise.all([
                adminService.getQuestions(
                    selectedSkillId ? Number(selectedSkillId) : undefined,
                    undefined,
                    selectedDifficulty || undefined
                ),
                adminService.getSkills()
            ])
            setQuestions(qData)
            setSkills(sData)
        } catch (err: any) {
            setErrorMsg(err.message || 'Không thể tải ngân hàng câu hỏi.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [selectedSkillId, selectedDifficulty])

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng câu hỏi?')) return
        try {
            await adminService.deleteQuestion(id)
            alert('Đã xóa câu hỏi thành công.')
            fetchData()
        } catch (err: any) {
            alert(err.message || 'Không thể xóa câu hỏi.')
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <HelpCircle className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Quản Lý Ngân Hàng Câu Hỏi Quiz (Phân Loại Skill)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tạo và phân loại bộ câu hỏi trắc nghiệm theo từng Skill kỹ năng cụ thể cho học viên.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} className="font-bold flex items-center gap-1 dark:border-gray-700 dark:hover:bg-gray-800">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
                    </Button>
                    <Button variant="indigo" className="font-bold flex items-center gap-2" onClick={() => navigate('/dashboard/admin/quiz-bank/create')}>
                        <Plus className="w-4 h-4" /> Tạo câu hỏi mới
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold">
                    <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Bộ lọc câu hỏi:
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedSkillId}
                        onChange={(e) => setSelectedSkillId(e.target.value ? Number(e.target.value) : '')}
                        className="p-2.5 rounded-xl border border-[#E2E4EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold outline-none"
                    >
                        <option value="">-- Tất cả Kỹ năng (Skills) --</option>
                        {skills.map(s => (
                            <option key={s.id} value={s.id}>
                                [{s.category}] {s.title}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="p-2.5 rounded-xl border border-[#E2E4EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold outline-none"
                    >
                        <option value="">-- Tất cả Độ khó --</option>
                        <option value="EASY">Dễ (Easy)</option>
                        <option value="MEDIUM">Trung bình (Medium)</option>
                        <option value="HARD">Khó (Hard)</option>
                    </select>
                </div>
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            {isLoading ? (
                <div className="p-12 bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 text-center text-xs font-bold text-gray-500 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#3C4097] dark:text-indigo-400" />
                    <p>Đang nạp ngân hàng câu hỏi từ Backend...</p>
                </div>
            ) : questions.length === 0 ? (
                <div className="p-12 bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 text-center text-xs text-gray-500">
                    Chưa có câu hỏi nào phù hợp với bộ lọc hiện tại.
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                                        Câu {idx + 1}: {q.question_text}
                                    </h2>
                                    {q.skill_title && (
                                        <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-extrabold rounded-md border border-indigo-200 dark:border-indigo-800">
                                            <Tag className="w-3 h-3 text-indigo-500" />
                                            Skill: {q.skill_title}
                                        </div>
                                    )}
                                </div>
                                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full shrink-0 ${q.difficulty === 'HARD' ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300' :
                                    q.difficulty === 'EASY' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' :
                                        'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                                    }`}>
                                    {q.difficulty}
                                </span>
                            </div>

                            <div className="space-y-2 pt-1">
                                {q.options && q.options.map((opt, oIdx) => {
                                    const isCorrect = Boolean(opt.is_correct)
                                    return (
                                        <div key={oIdx} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${isCorrect
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                                            : 'bg-gray-50 dark:bg-gray-800 border-[#E2E4EB] dark:border-gray-700 text-gray-800 dark:text-gray-200'
                                            }`}>
                                            <span>{String.fromCharCode(65 + oIdx)}. {opt.option_text}</span>
                                            {isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                                        </div>
                                    )
                                })}
                            </div>

                            {q.explanation && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                                    💡 Giải thích: {q.explanation}
                                </p>
                            )}

                            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E4EB] dark:border-gray-800">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(q.id)}
                                    className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
