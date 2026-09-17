import React, { useState } from 'react'
import { Sparkles, Save, Flame, Sprout, Trophy, Sliders, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export const GamificationConfigPage: React.FC = () => {
    const [xpVideo, setXpVideo] = useState('50')
    const [xpQuiz, setXpQuiz] = useState('100')
    const [xpTask, setXpTask] = useState('80')
    const [xpSkillBonus, setXpSkillBonus] = useState('300')
    const [initialXp, setInitialXp] = useState('100')
    const [growthPerLesson, setGrowthPerLesson] = useState('5.0')
    const [levelStepXp, setLevelStepXp] = useState('250')

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        alert('Đã lưu cấu hình Gamification thành công!')
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs">
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-500" /> Cấu Hình Gamification & Cơ Chế Tăng Trưởng
                </h1>
                <p className="text-xs text-[#6B6D7A] mt-1">Thiết lập điểm kinh nghiệm XP thưởng, cấp độ học viên và tốc độ sinh trưởng của mầm cây kỹ năng.</p>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rules 1: XP Rewards */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-xs space-y-4">
                    <h2 className="text-sm font-extrabold text-[#20223A] border-b border-[#E2E4EB] pb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-emerald-600" /> Quy Tắc Thưởng Điểm XP
                    </h2>

                    <Input
                        label="XP KHỞI TẠO KHI TẠO TÀI KHOẢN"
                        type="number"
                        value={initialXp}
                        onChange={(e) => setInitialXp(e.target.value)}
                    />

                    <Input
                        label="XP THƯỞNG HOÀN THÀNH 1 BÀI HỌC VIDEO"
                        type="number"
                        value={xpVideo}
                        onChange={(e) => setXpVideo(e.target.value)}
                    />

                    <Input
                        label="XP THƯỞNG ĐẠT BÀI QUIZ TRẮC NGHIỆM"
                        type="number"
                        value={xpQuiz}
                        onChange={(e) => setXpQuiz(e.target.value)}
                    />

                    <Input
                        label="XP THƯỞNG HOÀN THÀNH 1 TASK THỰC HÀNH"
                        type="number"
                        value={xpTask}
                        onChange={(e) => setXpTask(e.target.value)}
                    />

                    <Input
                        label="XP THƯỞNG KHI HOÀN THÀNH TOÀN BỘ 1 SKILL"
                        type="number"
                        value={xpSkillBonus}
                        onChange={(e) => setXpSkillBonus(e.target.value)}
                    />
                </div>

                {/* Rules 2: Level & Plant Progress */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h2 className="text-sm font-extrabold text-[#20223A] border-b border-[#E2E4EB] pb-3 flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-emerald-600" /> Cấp Độ & Tiến Độ Sinh Trưởng Cây
                        </h2>

                        <Input
                            label="XP CẦN THIẾT TĂNG MỖI LEVEL"
                            type="number"
                            value={levelStepXp}
                            onChange={(e) => setLevelStepXp(e.target.value)}
                        />

                        <Input
                            label="% TÁC ĐỘNG TĂNG TRƯỞNG CÂY TỰ ĐỘNG / BÀI HỌC"
                            type="number"
                            value={growthPerLesson}
                            onChange={(e) => setGrowthPerLesson(e.target.value)}
                        />

                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                            <strong className="block font-bold">Lưu ý nghiệp vụ:</strong>
                            Các mốc sinh trưởng cây sẽ tự động cập nhật visual 5 giai đoạn (Hạt giống → Mầm → Cây → Hoa → Quả) dựa trên tỷ lệ % hoàn thành bài học.
                        </div>
                    </div>

                    <Button type="submit" variant="indigo" fullWidth className="font-bold flex items-center justify-center gap-2 mt-4">
                        <Save className="w-4 h-4" /> Lưu cấu hình Gamification
                    </Button>
                </div>
            </form>
        </div>
    )
}
