import React, { useState, useEffect } from 'react'
import { Sparkles, Save, Trophy, Sprout, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { adminService } from '../../services/adminService'

export const GamificationConfigPage: React.FC = () => {
    const [xpVideo, setXpVideo] = useState('50')
    const [xpQuiz, setXpQuiz] = useState('100')
    const [xpTask, setXpTask] = useState('80')
    const [xpSkillBonus, setXpSkillBonus] = useState('300')
    const [initialXp, setInitialXp] = useState('100')
    const [growthPerLesson, setGrowthPerLesson] = useState('5.0')
    const [levelStepXp, setLevelStepXp] = useState('250')

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [toastMsg, setToastMsg] = useState('')

    const fetchConfigs = async () => {
        setIsLoading(true)
        try {
            const configs = await adminService.getGamificationConfigs()
            configs.forEach((item: any) => {
                if (item.config_key === 'xp_video') setXpVideo(item.config_value)
                if (item.config_key === 'xp_quiz') setXpQuiz(item.config_value)
                if (item.config_key === 'xp_task') setXpTask(item.config_value)
                if (item.config_key === 'xp_skill_bonus') setXpSkillBonus(item.config_value)
                if (item.config_key === 'initial_xp') setInitialXp(item.config_value)
                if (item.config_key === 'growth_per_lesson') setGrowthPerLesson(item.config_value)
                if (item.config_key === 'level_step_xp') setLevelStepXp(item.config_value)
            })
        } catch {
            // Keep current values if backend table empty
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchConfigs()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await adminService.updateGamificationConfigs({
                xp_video: xpVideo,
                xp_quiz: xpQuiz,
                xp_task: xpTask,
                xp_skill_bonus: xpSkillBonus,
                initial_xp: initialXp,
                growth_per_lesson: growthPerLesson,
                level_step_xp: levelStepXp,
            })
            setToastMsg('Đã lưu cấu hình Gamification thành công vào MySQL Database!')
            setTimeout(() => setToastMsg(''), 4000)
        } catch (err: any) {
            alert(err.message || 'Lưu cấu hình thất bại.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Sparkles className="w-6 h-6 text-yellow-500" /> Cấu Hình Gamification & Cơ Chế Tăng Trưởng (API Thật)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Thiết lập điểm kinh nghiệm XP thưởng, cấp độ học viên và tốc độ sinh trưởng từ CSDL MySQL.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchConfigs} disabled={isLoading} className="font-bold flex items-center gap-1 dark:border-gray-700 dark:hover:bg-gray-800">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
                </Button>
            </div>

            {toastMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold shadow-xs">
                    {toastMsg}
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rules 1: XP Rewards */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-4">
                    <h2 className="text-sm font-extrabold text-gray-900 dark:text-white border-b border-[#E2E4EB] dark:border-gray-800 pb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Quy Tắc Thưởng Điểm XP
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
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white border-b border-[#E2E4EB] dark:border-gray-800 pb-3 flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Cấp Độ & Tiến Độ Sinh Trưởng Cây
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

                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
                            <strong className="block font-bold">Lưu ý nghiệp vụ:</strong>
                            Các mốc sinh trưởng cây sẽ tự động cập nhật visual 5 giai đoạn dựa trên tỷ lệ % hoàn thành bài học.
                        </div>
                    </div>

                    <Button type="submit" variant="indigo" disabled={isSaving} fullWidth className="font-bold flex items-center justify-center gap-2 mt-4">
                        <Save className="w-4 h-4" /> {isSaving ? 'Đang lưu...' : 'Lưu cấu hình Gamification'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
