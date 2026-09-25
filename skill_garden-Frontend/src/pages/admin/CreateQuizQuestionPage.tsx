import React, { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, HelpCircle, Plus, Save, Trash2, Tag, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { adminService, SkillItem } from '../../services/adminService'

export const CreateQuizQuestionPage: React.FC = () => {
    const navigate = useNavigate()
    const [question, setQuestion] = useState('')
    const [difficulty, setDifficulty] = useState('MEDIUM')
    const [skillId, setSkillId] = useState<number | ''>('')
    const [explanation, setExplanation] = useState('')
    const [skills, setSkills] = useState<SkillItem[]>([])
    const [isLoadingSkills, setIsLoadingSkills] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [options, setOptions] = useState([
        { text: '', correct: true },
        { text: '', correct: false },
    ])

    useEffect(() => {
        const fetchSkills = async () => {
            setIsLoadingSkills(true)
            try {
                const data = await adminService.getSkills()
                setSkills(data)
                if (data.length > 0) {
                    setSkillId(data[0].id)
                }
            } catch (err) {
                console.error('Lỗi khi tải danh sách kỹ năng:', err)
            } finally {
                setIsLoadingSkills(false)
            }
        }
        fetchSkills()
    }, [])

    const updateOption = (index: number, text: string) => {
        setOptions(current => current.map((option, optionIndex) => optionIndex === index ? { ...option, text } : option))
    }

    const setCorrectOption = (index: number) => {
        setOptions(current => current.map((option, optionIndex) => ({ ...option, correct: optionIndex === index })))
    }

    const addOption = () => {
        setOptions(current => [...current, { text: '', correct: false }])
    }

    const removeOption = (index: number) => {
        if (options.length <= 2) return
        setOptions(current => current.filter((_, optionIndex) => optionIndex !== index))
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!question.trim()) {
            alert('Vui lòng nhập nội dung câu hỏi.')
            return
        }

        const validOptions = options.filter(o => o.text.trim() !== '')
        if (validOptions.length < 2) {
            alert('Vui lòng tạo ít nhất 2 đáp án lựa chọn hợp lệ.')
            return
        }

        setIsSubmitting(true)
        try {
            await adminService.createQuestion({
                skill_id: skillId ? Number(skillId) : undefined,
                question_text: question.trim(),
                difficulty,
                explanation: explanation.trim() || undefined,
                options: validOptions.map((opt, idx) => ({
                    option_text: opt.text.trim(),
                    is_correct: opt.correct,
                    order_index: idx + 1
                }))
            })
            alert('Tạo mới câu hỏi vào Ngân hàng Quiz phân loại Skill thành công!')
            navigate('/dashboard/admin/quiz-bank')
        } catch (err: any) {
            alert(err.message || 'Không thể tạo câu hỏi Quiz.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/quiz-bank')} aria-label="Quay lại ngân hàng câu hỏi" className="dark:border-gray-700 dark:hover:bg-gray-800">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <HelpCircle className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Tạo câu hỏi Quiz mới (Phân Loại Skill)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gắn thẻ Skill, thiết lập nội dung, đáp án đúng và mức độ khó cho ngân hàng câu hỏi.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-sm space-y-5">
                {/* Skill Selection Dropdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="skill" className="text-sm font-bold flex items-center gap-1.5 mb-2 text-gray-900 dark:text-gray-100">
                            <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Phân loại Skill / Kỹ năng học phần *
                        </label>
                        {isLoadingSkills ? (
                            <div className="p-2.5 text-xs text-gray-500 flex items-center gap-2 border border-[#E2E4EB] dark:border-gray-700 rounded-xl">
                                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" /> Đang tải danh sách skill...
                            </div>
                        ) : (
                            <select
                                id="skill"
                                value={skillId}
                                onChange={event => setSkillId(event.target.value ? Number(event.target.value) : '')}
                                className="w-full rounded-xl border border-[#E2E4EB] dark:border-gray-700 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#3C4097] dark:focus:border-indigo-500 font-bold"
                            >
                                <option value="">-- Chọn Skill cho câu hỏi --</option>
                                {skills.map(s => (
                                    <option key={s.id} value={s.id}>
                                        [{s.category}] {s.title}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label htmlFor="difficulty" className="text-sm font-bold block mb-2 text-gray-900 dark:text-gray-100">Mức độ khó *</label>
                        <select id="difficulty" value={difficulty} onChange={event => setDifficulty(event.target.value)} className="w-full rounded-xl border border-[#E2E4EB] dark:border-gray-700 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#3C4097] dark:focus:border-indigo-500 font-bold">
                            <option value="EASY">Dễ (Easy)</option>
                            <option value="MEDIUM">Trung bình (Medium)</option>
                            <option value="HARD">Khó (Hard)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="question" className="text-sm font-bold block mb-2 text-gray-900 dark:text-gray-100">Nội dung câu hỏi *</label>
                    <textarea
                        id="question"
                        required
                        value={question}
                        onChange={event => setQuestion(event.target.value)}
                        placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                        className="w-full min-h-28 rounded-xl border border-[#E2E4EB] dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-[#3C4097] dark:focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="explanation" className="text-sm font-bold block mb-2 text-gray-900 dark:text-gray-100">Giải thích đáp án (Tùy chọn)</label>
                    <input
                        id="explanation"
                        type="text"
                        value={explanation}
                        onChange={event => setExplanation(event.target.value)}
                        placeholder="Giải thích lý do chọn đáp án đúng..."
                        className="w-full rounded-xl border border-[#E2E4EB] dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-[#3C4097] dark:focus:border-indigo-500"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Các phương án trả lời * (Tích chọn nút xanh cho đáp án đúng)</h2>
                        <Button type="button" variant="outline" size="sm" onClick={addOption} className="font-bold flex items-center gap-1 dark:border-gray-700 dark:hover:bg-gray-800">
                            <Plus className="w-3.5 h-3.5" /> Thêm phương án
                        </Button>
                    </div>
                    {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <button type="button" onClick={() => setCorrectOption(index)} className={`shrink-0 cursor-pointer ${option.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600'}`} aria-label={`Chọn phương án ${index + 1} là đáp án đúng`}>
                                <CheckCircle className="w-5 h-5" />
                            </button>
                            <Input required value={option.text} onChange={event => updateOption(index, event.target.value)} placeholder={`Phương án ${String.fromCharCode(65 + index)}`} />
                            <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)} disabled={options.length <= 2} aria-label={`Xóa phương án ${index + 1}`} className="dark:border-gray-700">
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 border-t border-[#E2E4EB] dark:border-gray-800 pt-4">
                    <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => navigate('/dashboard/admin/quiz-bank')} className="dark:border-gray-700 dark:hover:bg-gray-800">Hủy</Button>
                    <Button type="submit" variant="indigo" disabled={isSubmitting} className="font-bold flex items-center gap-2">
                        {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Đang lưu...' : 'Lưu câu hỏi'}
                    </Button>
                </div>
            </form>
        </div>
    )
}