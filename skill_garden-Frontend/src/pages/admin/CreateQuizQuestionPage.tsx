import React, { useState } from 'react'
import { ArrowLeft, CheckCircle, HelpCircle, Plus, Save, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export const CreateQuizQuestionPage: React.FC = () => {
    const navigate = useNavigate()
    const [question, setQuestion] = useState('')
    const [difficulty, setDifficulty] = useState('MEDIUM')
    const [options, setOptions] = useState([
        { text: '', correct: true },
        { text: '', correct: false },
    ])

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

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        navigate('/dashboard/admin/quiz-bank')
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/quiz-bank')} aria-label="Quay lại ngân hàng câu hỏi" className="dark:border-gray-700 dark:hover:bg-gray-800">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <HelpCircle className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Tạo câu hỏi Quiz mới
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Thiết lập nội dung, đáp án đúng và mức độ khó.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-sm space-y-5">
                <div>
                    <label htmlFor="question" className="text-sm font-bold block mb-2 text-gray-900 dark:text-gray-100">Nội dung câu hỏi</label>
                    <textarea
                        id="question"
                        required
                        value={question}
                        onChange={event => setQuestion(event.target.value)}
                        placeholder="Nhập nội dung câu hỏi..."
                        className="w-full min-h-28 rounded-xl border border-[#E2E4EB] dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-[#3C4097] dark:focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="difficulty" className="text-sm font-bold block mb-2 text-gray-900 dark:text-gray-100">Mức độ khó</label>
                    <select id="difficulty" value={difficulty} onChange={event => setDifficulty(event.target.value)} className="w-full rounded-xl border border-[#E2E4EB] dark:border-gray-700 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#3C4097] dark:focus:border-indigo-500">
                        <option value="EASY">Dễ</option>
                        <option value="MEDIUM">Trung bình</option>
                        <option value="HARD">Khó</option>
                    </select>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Các phương án trả lời</h2>
                        <Button type="button" variant="outline" size="sm" onClick={addOption} className="font-bold flex items-center gap-1 dark:border-gray-700 dark:hover:bg-gray-800">
                            <Plus className="w-3.5 h-3.5" /> Thêm phương án
                        </Button>
                    </div>
                    {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <button type="button" onClick={() => setCorrectOption(index)} className={`shrink-0 ${option.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600'}`} aria-label={`Chọn phương án ${index + 1} là đáp án đúng`}>
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
                    <Button type="button" variant="outline" onClick={() => navigate('/dashboard/admin/quiz-bank')} className="dark:border-gray-700 dark:hover:bg-gray-800">Hủy</Button>
                    <Button type="submit" variant="indigo" className="font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Lưu câu hỏi</Button>
                </div>
            </form>
        </div>
    )
}