import React, { useState, useEffect } from 'react'
import { Video, Save, Upload, Link as LinkIcon, Sparkles, Sprout, CheckCircle2, FileVideo, HardDrive, RefreshCw, Trash2, Eye } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { apiClient } from '../../services/apiClient'
import { courseService, SkillItem } from '../../services/courseService'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const normalizeYouTubeUrl = (rawUrl: string): string => {
    const url = rawUrl.trim()
    if (!url) return url

    if (url.includes('youtube.com/watch?v=')) {
        const videoIdMatch = url.match(/[?&]v=([^&]+)/i)
        if (videoIdMatch?.[1]) {
            return `https://www.youtube.com/embed/${videoIdMatch[1]}`
        }
    }

    if (url.includes('youtu.be/')) {
        const videoIdMatch = url.match(/youtu\.be\/([^?]+)/i)
        if (videoIdMatch?.[1]) {
            return `https://www.youtube.com/embed/${videoIdMatch[1]}`
        }
    }

    if (url.includes('/uploads/videos/')) {
        return url.includes('/public/uploads/videos/') ? url : url.replace('/uploads/videos/', '/public/uploads/videos/')
    }

    return url
}

export const CreateLessonVideoPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const isLmsAdmin = user?.role === 'SUPER_ADMIN' || (user?.role === 'ADMIN' && (
        (user.email || '').toLowerCase().includes('lms') ||
        (user.full_name || '').toLowerCase().includes('lms')
    ))
    const [selectedSkillId, setSelectedSkillId] = useState('1')
    const [title, setTitle] = useState('')
    const [sourceType, setSourceType] = useState<'YOUTUBE' | 'FILE'>('YOUTUBE')
    const [videoUrl, setVideoUrl] = useState('')
    const [xpReward, setXpReward] = useState('50')
    const [growthImpact, setGrowthImpact] = useState('5.0')
    const [description, setDescription] = useState('')
    const [successAlert, setSuccessAlert] = useState('')

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    // Admin Created Lessons list state
    const [adminLessons, setAdminLessons] = useState<any[]>([])

    const fallbackSkillOptions = [
        { id: '1', title: 'Frontend React 19 Mastery (Cây Hoa Anh Đào 🌸)' },
        { id: '2', title: 'Backend NestJS & Node.js System (Cây Cổ Thụ 🌳)' },
        { id: '3', title: 'Database SQL & Architect (Cây Tre Trăm Đốt 🎋)' },
        { id: '4', title: 'Python & Machine Learning (Cây Xương Rồng 🌵)' },
        { id: '5', title: 'Software Testing (Cây Hướng Dương 🌻)' },
        { id: '6', title: 'Flutter & React Native Mobile (Cây Dừa 🌴)' },
    ]
    const [skillOptions, setSkillOptions] = useState(fallbackSkillOptions)

    const loadCustomLessons = () => {
        try {
            const saved = localStorage.getItem('skillgarden_custom_lessons') || '[]'
            setAdminLessons(JSON.parse(saved))
        } catch {
            setAdminLessons([])
        }
    }

    useEffect(() => {
        loadCustomLessons()
        courseService.getSkills()
            .then((skills: SkillItem[]) => {
                if (skills.length > 0) {
                    setSkillOptions(skills.map((skill) => ({
                        id: String(skill.id),
                        title: skill.title,
                    })))
                }
            })
            .catch(() => {
                // Keep the fallback list when the skills API is unavailable.
            })
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)
            setUploadSuccess(false)
        }
    }

    const handleUploadLocalVideo = async () => {
        if (!isLmsAdmin) {
            alert('Chỉ tài khoản Admin LMS mới có quyền tải file video lên máy chủ!')
            return
        }
        if (!selectedFile) return
        setIsUploading(true)
        setUploadProgress(20)

        try {
            const formData = new FormData()
            formData.append('video_file', selectedFile)

            setUploadProgress(50)
            const res = await apiClient.post<any>('/admin/upload-video.php', formData)

            setUploadProgress(100)
            if (res.success && res.url) {
                const normalizedUrl = normalizeYouTubeUrl(res.url)
                setVideoUrl(normalizedUrl)
                setUploadSuccess(true)
                alert('Tải file video lên máy chủ thành công!')
            } else {
                alert(res.message || 'Tải file video thất bại.')
            }
        } catch (err: any) {
            alert(err.message || 'Lỗi kết nối khi tải video từ máy.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLmsAdmin) {
            alert('Chỉ tài khoản Admin LMS mới có quyền tạo và xuất bản bài học!')
            return
        }
        if (!title.trim()) {
            alert('Vui lòng nhập tiêu đề bài học!')
            return
        }
        if (!videoUrl.trim()) {
            alert('Vui lòng nhập link YouTube hoặc upload file video từ máy!')
            return
        }

        const normalizedVideoUrl = normalizeYouTubeUrl(videoUrl.trim())

        const newLesson = {
            id: 'custom_' + Date.now(),
            skillId: selectedSkillId,
            title: title.trim(),
            sourceType: sourceType,
            videoUrl: normalizedVideoUrl,
            description: description.trim() || 'Nội dung bài học mới do Admin cập nhật.',
            duration: '15:00',
            xpReward: Number(xpReward) || 50,
            growthImpact: Number(growthImpact) || 5.0,
            createdAt: new Date().toISOString()
        }

        // 1. Save to LocalStorage for instant reactive sync to user
        try {
            const existingStr = localStorage.getItem('skillgarden_custom_lessons') || '[]'
            const existing = JSON.parse(existingStr)
            const updated = [newLesson, ...existing]
            localStorage.setItem('skillgarden_custom_lessons', JSON.stringify(updated))
            setAdminLessons(updated)
        } catch {
            // Fallback
        }

        // Save to the shared backend before confirming the lesson to all users.
        try {
            await apiClient.post('/admin/lessons.php', {
                skill_id: selectedSkillId,
                title: title.trim(),
                video_url: normalizedVideoUrl,
                description: description.trim(),
                xp_reward: Number(xpReward) || 50
            })
        } catch (err: any) {
            alert(err.message || 'Không thể lưu bài học lên máy chủ. Vui lòng thử lại.')
            return
        }

        setSuccessAlert(`🎉 Đã tạo bài học "${title.trim()}" thành công! Bài học đã được kết nối và cập nhật tự động cho tất cả Học Viên.`)
        setTitle('')
        setVideoUrl('')
        setDescription('')
        setSelectedFile(null)
        setUploadSuccess(false)
        setTimeout(() => setSuccessAlert(''), 6000)
    }

    const handleDeleteCustomLesson = (id: string) => {
        const updated = adminLessons.filter(item => item.id !== id)
        localStorage.setItem('skillgarden_custom_lessons', JSON.stringify(updated))
        setAdminLessons(updated)
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <Video className="w-6 h-6 text-[#3C4097]" /> Tạo Bài Học & Quản Lý Video (Nối Trực Tiếp Học Viên)
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Khi bạn xuất bản bài học tại đây, dữ liệu bài học sẽ được cập nhật ngay lập tức sang giao diện học của User.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="font-bold flex items-center gap-1 shrink-0"
                    onClick={() => navigate(`/dashboard/video-learning?skill_id=${selectedSkillId}`)}
                >
                    <Eye className="w-4 h-4 text-emerald-600" /> Xem Giao Diện Học Viên
                </Button>
            </div>

            {!isLmsAdmin && (
                <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs">
                    <span className="text-lg">🔒</span>
                    <div>
                        <div className="font-extrabold text-amber-950 text-sm">Rào chắn phân quyền Quản trị LMS</div>
                        <p className="mt-0.5 text-amber-800">Tài khoản hiện tại của bạn không phải là <strong>Admin LMS (LMS Content Admin)</strong>. Quyền hạn tạo, upload và xuất bản bài học Video bị giới hạn chỉ dành cho Quản trị viên LMS.</p>
                    </div>
                </div>
            )}

            {successAlert && (
                <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
                    <span>{successAlert}</span>
                    <Button
                        size="sm"
                        variant="indigo"
                        className="text-xs shrink-0"
                        onClick={() => navigate(`/dashboard/video-learning?skill_id=${selectedSkillId}`)}
                    >
                        Đến trang xem Bài học
                    </Button>
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left 2 cols: Content Info */}
                <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-xs space-y-6">

                    {/* Skill / Course Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-[#4A5568] block">
                            CHỌN KHÓA HỌC / KỸ NĂNG ÁP DỤNG
                        </label>
                        <select
                            value={selectedSkillId}
                            onChange={(e) => setSelectedSkillId(e.target.value)}
                            className="w-full p-3 border border-[#E2E4EB] rounded-xl text-xs font-bold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3C4097] text-[#20223A]"
                        >
                            {skillOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.title}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="TIÊU ĐỀ BÀI HỌC MỚI"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Bài 3: React 19 Server Components & Hooks mới"
                        required
                    />

                    {/* Source Type Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-[#4A5568] block">
                            CHỌN NGUỒN VIDEO BÀI GIẢNG
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSourceType('YOUTUBE')}
                                className={`p-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${sourceType === 'YOUTUBE'
                                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <LinkIcon className="w-4 h-4 text-red-500" /> Nhập Link YouTube
                            </button>

                            <button
                                type="button"
                                onClick={() => setSourceType('FILE')}
                                className={`p-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${sourceType === 'FILE'
                                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <HardDrive className="w-4 h-4 text-emerald-600" /> Tải File Từ Máy Tính
                            </button>
                        </div>
                    </div>

                    {/* YouTube Link Field */}
                    {sourceType === 'YOUTUBE' && (
                        <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <Input
                                label="ĐƯỜNG DẪN VIDEO YOUTUBE (URL / EMBED)"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                                iconRight={<LinkIcon className="w-4 h-4 text-gray-400" />}
                            />

                            {videoUrl && (
                                <div className="mt-2 aspect-video bg-black rounded-xl overflow-hidden border border-gray-300">
                                    <iframe
                                        className="w-full h-full"
                                        src={videoUrl.includes('embed') ? videoUrl : `https://www.youtube.com/embed/${videoUrl.split('v=')[1] || videoUrl.split('/').pop() || ''}`}
                                        title="Preview YouTube"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Local File Upload Field */}
                    {sourceType === 'FILE' && (
                        <div className="space-y-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200">
                            <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-white space-y-3">
                                <FileVideo className="w-10 h-10 mx-auto text-emerald-600" />
                                <div>
                                    <p className="text-xs font-extrabold text-[#20223A]">
                                        Kéo thả hoặc bấm để chọn video từ máy tính
                                    </p>
                                    <p className="text-[11px] text-[#6B6D7A] mt-1">
                                        Hỗ trợ các định dạng .mp4, .webm, .mkv, .mov (Tối đa 500MB)
                                    </p>
                                </div>

                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="local-video-input"
                                />
                                <label
                                    htmlFor="local-video-input"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-emerald-700 transition-colors shadow-xs"
                                >
                                    <Upload className="w-4 h-4" /> Chọn File Video
                                </label>

                                {selectedFile && (
                                    <div className="pt-2 text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                                        <span>File đã chọn: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                                    </div>
                                )}
                            </div>

                            {selectedFile && !uploadSuccess && (
                                <Button
                                    type="button"
                                    variant="indigo"
                                    onClick={handleUploadLocalVideo}
                                    disabled={isUploading}
                                    className="w-full font-bold flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 border-none cursor-pointer"
                                >
                                    {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {isUploading ? `Đang Tải Lên Máy Chủ (${uploadProgress}%)...` : 'Tải File Video Lên Server'}
                                </Button>
                            )}

                            {uploadSuccess && (
                                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-extrabold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                    <span>Đã upload thành công lên Server: {videoUrl}</span>
                                </div>
                            )}

                            {videoUrl && sourceType === 'FILE' && (
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-gray-300 mt-3">
                                    <video controls src={videoUrl} className="w-full h-full" />
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#4A5568] block mb-1">
                            MÔ TẢ BÀI HỌC & NỘI DUNG LÝ THUYẾT
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Nhập nội dung mô tả vắn tắt hoặc hướng dẫn thực hành cho bài học này..."
                            className="w-full p-3 border border-[#E2E4EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3C4097]"
                        />
                    </div>
                </div>

                {/* Right Col: Gamification Config */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-xs space-y-6 h-fit">
                        <h2 className="text-sm font-extrabold text-[#20223A] border-b border-[#E2E4EB] pb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-500" /> Cấu Hình Thưởng & Tác Động
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
                            Khi xuất bản, bài học sẽ hiển thị ngay trong playlist xem video của Học Viên thuộc khóa học đã chọn.
                        </div>

                        <Button type="submit" variant="indigo" fullWidth className="font-bold flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 border-none cursor-pointer">
                            <Save className="w-4 h-4" /> Xuất Bản Bài Học Đến Học Viên
                        </Button>
                    </div>

                    {/* Admin Published Lessons History List */}
                    <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-xs space-y-4">
                        <h3 className="text-xs font-extrabold text-[#20223A] uppercase tracking-wider flex items-center justify-between">
                            <span>Bài học Admin đã thêm ({adminLessons.length})</span>
                        </h3>

                        {adminLessons.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Chưa có bài học nào được thêm từ Admin.</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {adminLessons.map((item) => (
                                    <div key={item.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
                                        <div className="flex items-center justify-between font-bold">
                                            <span className="text-[#3C4097] truncate max-w-[180px]">{item.title}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCustomLesson(item.id)}
                                                className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                                                title="Xóa bài học này"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="text-[11px] text-gray-500 flex items-center justify-between">
                                            <span>Khóa: #{item.skillId}</span>
                                            <span className="text-emerald-700 font-bold">+{item.xpReward} XP</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}
