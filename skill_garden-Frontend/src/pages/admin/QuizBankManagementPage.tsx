import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, Plus, Edit, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export const QuizBankManagementPage: React.FC = () => {
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([
        {
            id: 1,
            text: 'Virtual DOM trong React giải quyết bài toán cốt lõi nào?',
            difficulty: 'MEDIUM',
            options: [
                { text: 'Tối ưu hiệu năng rendering với Real DOM', correct: true },
                { text: 'Thay thế HTML/CSS', correct: false }
            ]
        },
        {
            id: 2,
            text: 'Hàm useState trong React Hook trả về kiểu giá trị nào?',
            difficulty: 'EASY',
            options: [
                { text: 'Một Mảng [stateValue, setStateFunction]', correct: true },
                { text: 'Một Object duy nhất', correct: false }
            ]
        }
    ])

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <HelpCircle className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Quản Lý Ngân Hàng Câu Hỏi Quiz
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tạo và thiết lập bộ câu hỏi trắc nghiệm, đáp án đúng và mức độ khó.</p>
                </div>
                <Button variant="indigo" className="font-bold flex items-center gap-2" onClick={() => navigate('/dashboard/admin/quiz-bank/create')}>
                    <Plus className="w-4 h-4" /> Tạo câu hỏi mới
                </Button>
            </div>

            <div className="space-y-4">
                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-sm space-y-3">
                        <div className="flex items-start justify-between">
                            <h2 className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                                Câu {idx + 1}: {q.text}
                            </h2>
                            <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-bold rounded-full">
                                {q.difficulty}
                            </span>
                        </div>

                        <div className="space-y-2 pt-1">
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${opt.correct
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                                    : 'bg-gray-50 dark:bg-gray-800 border-[#E2E4EB] dark:border-gray-700 text-gray-800 dark:text-gray-200'
                                    }`}>
                                    <span>{String.fromCharCode(65 + oIdx)}. {opt.text}</span>
                                    {opt.correct && <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E4EB] dark:border-gray-800">
                            <Button variant="outline" size="sm" className="font-bold dark:border-gray-700 dark:hover:bg-gray-800"><Edit className="w-3.5 h-3.5 mr-1" /> Sửa</Button>
                            <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
