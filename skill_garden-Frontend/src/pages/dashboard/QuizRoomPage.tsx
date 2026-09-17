import React, { useState, useEffect } from 'react'
import { Timer, CheckCircle, HelpCircle, Award, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export const QuizRoomPage: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(600) // 10 mins
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        if (timeLeft <= 0 || isSubmitted) return
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
        return () => clearInterval(timer)
    }, [timeLeft, isSubmitted])

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const questions = [
        {
            id: 1,
            question: 'Virtual DOM trong React giải quyết bài toán cốt lõi nào?',
            options: [
                'Tối ưu số lần thao tác trực tiếp trên Real DOM nhằm tăng hiệu năng rendering.',
                'Thay thế hoàn toàn HTML và CSS bằng Javascript.',
                'Lưu trữ toàn bộ dữ liệu vào LocalStorage tự động.',
                'Tạo kết nối WebSocket trực tiếp đến Database.'
            ],
            correct: 0
        },
        {
            id: 2,
            question: 'Hàm useState trong React Hook trả về kiểu giá trị nào?',
            options: [
                'Một Object chứa state và dispatch.',
                'Một Mảng (Array) gồm [stateValue, setStateFunction].',
                'Một Promise không đồng bộ.',
                'Một giá trị Boolean duy nhất.'
            ],
            correct: 1
        },
        {
            id: 3,
            question: 'Thuộc tính key trong danh sách mảng React có tác dụng gì?',
            options: [
                'Để style CSS cho item.',
                'Giúp React nhận diện định danh duy nhất cho từng element khi Re-render.',
                'Mã hóa dữ liệu gửi lên Server.',
                'Không có tác dụng gì.'
            ],
            correct: 1
        }
    ]

    const handleSelectOption = (optIdx: number) => {
        setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: optIdx })
    }

    const calculateScore = () => {
        let correctCount = 0
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correct) correctCount++
        })
        return correctCount
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12">
            {/* Top Bar */}
            <div className="bg-white border-b border-[#E2E4EB] px-6 py-4 flex items-center justify-between shadow-sm">
                <div>
                    <h1 className="text-lg font-bold text-[#20223A]">Quiz Đánh Giá Năng Lực React Core</h1>
                    <p className="text-xs text-[#6B6D7A]">Thời gian làm bài: 10 phút | Thưởng: 100 XP + Tăng trưởng mầm cây</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#FFFBEB] text-[#D97706] px-4 py-1.5 rounded-full font-mono text-sm font-bold border border-[#FEF3C7]">
                        <Timer className="w-4 h-4" />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                    {!isSubmitted && (
                        <Button variant="indigo" onClick={() => setIsSubmitted(true)} className="font-bold">
                            Nộp bài ngay
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-8 space-y-6">
                {!isSubmitted ? (
                    <div className="bg-white rounded-2xl p-8 border border-[#E2E4EB] shadow-md space-y-6">
                        {/* Question progress */}
                        <div className="flex items-center justify-between text-xs font-bold text-[#6B6D7A]">
                            <span>Câu hỏi {currentQuestion + 1} trên {questions.length}</span>
                            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% hoàn thành</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#E2E4EB] h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-[#6FAF7B] h-full transition-all duration-300"
                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>

                        {/* Question text */}
                        <h2 className="text-xl font-bold text-[#20223A] leading-snug">
                            {questions[currentQuestion].question}
                        </h2>

                        {/* Options */}
                        <div className="space-y-3 pt-2">
                            {questions[currentQuestion].options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(idx)}
                                    className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${selectedAnswers[currentQuestion] === idx
                                            ? 'border-[#3C4097] bg-[#F4F5FF] text-[#3C4097] shadow-sm'
                                            : 'border-[#E2E4EB] hover:bg-gray-50 text-[#20223A]'
                                        }`}
                                >
                                    <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                                    {selectedAnswers[currentQuestion] === idx && (
                                        <CheckCircle className="w-5 h-5 text-[#3C4097]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Question Nav */}
                        <div className="flex justify-between pt-4 border-t border-[#E2E4EB]">
                            <Button
                                variant="outline"
                                disabled={currentQuestion === 0}
                                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                            >
                                Câu trước
                            </Button>

                            {currentQuestion < questions.length - 1 ? (
                                <Button variant="indigo" onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                                    Câu tiếp theo
                                </Button>
                            ) : (
                                <Button variant="indigo" onClick={() => setIsSubmitted(true)}>
                                    Hoàn thành & Nộp bài
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Results Card */
                    <div className="bg-white rounded-2xl p-8 border border-[#E2E4EB] shadow-xl text-center space-y-6">
                        <div className="w-20 h-20 bg-[#DCEFE1] text-[#2C6A3D] rounded-full mx-auto flex items-center justify-center shadow-lg animate-bounce">
                            <Sparkles className="w-10 h-10" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-extrabold text-[#20223A]">Xuất sắc! Bạn đã hoàn thành Quiz</h2>
                            <p className="text-sm text-[#6B6D7A] mt-1">
                                Kết quả: <span className="font-bold text-[#3C4097]">{calculateScore()} / {questions.length} câu đúng</span>
                            </p>
                        </div>

                        <div className="bg-[#FAFAF7] border border-[#E2E4EB] rounded-2xl p-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
                            <div className="text-center">
                                <p className="text-xs text-[#6B6D7A]">XP Tích lũy</p>
                                <p className="text-2xl font-extrabold text-[#3C4097]">+100 XP</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-[#6B6D7A]">Tăng trưởng Cây</p>
                                <p className="text-2xl font-extrabold text-[#6FAF7B]">+15% Mầm</p>
                            </div>
                        </div>

                        <Button variant="indigo" size="lg" className="font-bold">
                            Về Vườn học tiếp tục
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
