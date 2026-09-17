import React, { useState } from 'react'
import { Video, Save, Upload, Link, Sparkles, Sprout } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export const CreateLessonVideoPage: React.FC = () => {
    const [title, setTitle] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [xpReward, setXpReward] = useState('50')
    const [growthImpact, setGrowthImpact] = useState('5.0')
    const [description, setDescription] = useState('')

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        alert('Tạo bài học Video & cấu hình Gamification thành công!')
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-sm">
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                    <Video className="w-6 h-6 text-[#3C4097]" /> Tạo Bài Học & Quản Lý Video
                </h1>
                <p className="text-xs text-[#6B6D7A] mt-1">Upload hoặc nhúng link Video bài giảng, cấu hình XP và tác động sinh trưởng Cây.</p>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left 2 cols: Content Info */}
                <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-sm space-y-4">
                    <Input
                        label="TIÊU ĐỀ BÀI HỌC"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Bài 2: React Components & Props"
                        required
                    />

                    <Input
                        label="ĐƯỜNG DẪN VIDEO (URL YOUTUBE / HLS / MP4)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        iconRight={<Link className="w-4 h-4 text-gray-400" />}
                        required
                    />

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#4A5568] block mb-1">
                            MÔ TẢ BÀI HỌC & NỘI DUNG LÝ THUYẾT
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            placeholder="Nhập nội dung mô tả vắn tắt hoặc hướng dẫn thực hành..."
                            className="w-full p-3 border border-[#E2E4EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3C4097]"
                        />
                    </div>
                </div>

                {/* Right Col: Gamification Config */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-sm space-y-6 h-fit">
                    <h2 className="text-sm font-extrabold text-[#20223A] border-b border-[#E2E4EB] pb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" /> Cấu Hình Gamification
                    </h2>

                    <Input
                        label="XP THƯỞNG KHI HOÀN THÀNH"
                        type="number"
                        value={xpReward}
                        onChange={(e) => setXpReward(e.target.value)}
                    />

                    <Input
                        label="% TÁC ĐỘNG TĂNG TRƯỞNG CÂY"
                        type="number"
                        value={growthImpact}
                        onChange={(e) => setGrowthImpact(e.target.value)}
                        iconRight={<Sprout className="w-4 h-4 text-emerald-600" />}
                    />

                    <div className="p-3 bg-[#FAFAF7] rounded-xl text-[11px] text-[#6B6D7A] border border-[#E2E4EB]">
                        Tác động sinh trưởng sẽ cộng dồn trực tiếp vào mầm cây kỹ năng thuộc khóa học khi học viên xem xong $\ge 80\%$ video.
                    </div>

                    <Button type="submit" variant="indigo" fullWidth className="font-bold flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" /> Lưu bài học
                    </Button>
                </div>
            </form>
        </div>
    )
}
