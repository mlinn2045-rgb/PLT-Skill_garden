import React, { useState, useEffect } from 'react'
import { Video, Save, Upload, Link as LinkIcon, Sparkles, Sprout, CheckCircle2, FileVideo, HardDrive, RefreshCw, Trash2, Eye, Edit } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { apiClient } from '../../services/apiClient'
import { courseService, SkillItem } from '../../services/courseService'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const getYouTubeVideoId = (url: string): string => {
    if (!url) return ''
    const watchMatch = url.match(/[?&]v=([^&]+)/i)
    if (watchMatch?.[1]) return watchMatch[1]

    const embedMatch = url.match(/\/embed\/([^?&]+)/i)
    if (embedMatch?.[1]) return embedMatch[1]

    const shortMatch = url.match(/youtu\.be\/([^?&]+)/i)
    if (shortMatch?.[1]) return shortMatch[1]

    const shortsMatch = url.match(/\/shorts\/([^?&]+)/i)
    if (shortsMatch?.[1]) return shortsMatch[1]

    const liveMatch = url.match(/\/live\/([^?&]+)/i)
    if (liveMatch?.[1]) return liveMatch[1]

    return ''
}

const normalizeYouTubeUrl = (rawUrl: string): string => {
    const url = rawUrl.trim()
    if (!url) return ''

    const videoId = getYouTubeVideoId(url)
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
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
        (user.permissions || []).includes('MANAGE_LESSONS') ||
        (user.email || '').toLowerCase().includes('lms')
    ))
    const [selectedSkillId, setSelectedSkillId] = useState('1')
    const [selectedChapter, setSelectedChapter] = useState('1')
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
    const [editingLesson, setEditingLesson] = useState<any | null>(null)

    const fallbackSkillOptions = [
        { id: '1', title: 'Frontend React 19 Mastery (Cây Hoa Anh Đào 🌸)' },
        { id: '2', title: 'Backend NestJS & Node.js System (Cây Cổ Thụ 🌳)' },
        { id: '3', title: 'Database SQL & MySQL Architect (Cây Tre Trăm Đốt 🎋)' },
        { id: '4', title: 'Python & Data Analysis Core (Cây Xương Rồng 🌵)' },
        { id: '5', title: 'Manual & Automation Testing (Cây Hướng Dương 🌻)' },
        { id: '6', title: 'Flutter & React Native Mobile (Cây Dừa 🌴)' },
    ]
    const [skillOptions, setSkillOptions] = useState(fallbackSkillOptions)

    const loadBackendLessons = async () => {
        try {
            const res = await apiClient.get<any[]>('/admin/lessons.php')
            if (Array.isArray(res.data)) {
                setAdminLessons(res.data)
            }
        } catch {
            setAdminLessons([])
        }
    }

    useEffect(() => {
        void loadBackendLessons()
        courseService.getSkills()
            .then((skills: SkillItem[]) => {
                if (skills.length > 0) {
                    setSkillOptions(skills.map((skill) => ({
                        id: String(skill.id),
                        title: `${skill.title} (${skill.plant_name || 'Kỹ năng'})`,
                    })))
                }
            })
            .catch(() => {
                // Keep the fallback list when the skills API is unavailable.
            })

        let bc: BroadcastChannel | null = null
        try {
            bc = new BroadcastChannel('skillgarden_sync')
            bc.onmessage = (event) => {
                if (event.data?.type === 'LESSONS_UPDATED') {
                    void loadBackendLessons()
                }
            }
        } catch { }

        const handleUpdate = () => void loadBackendLessons()
        window.addEventListener('skillgarden_lessons_updated', handleUpdate)
        window.addEventListener('storage', handleUpdate)

        return () => {
            if (bc) bc.close()
            window.removeEventListener('skillgarden_lessons_updated', handleUpdate)
            window.removeEventListener('storage', handleUpdate)
        }
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

        // Save to the shared backend
        try {
            const payload = {
                skill_id: Number(selectedSkillId) || 1,
                chapter: Number(selectedChapter) || 1,
                title: title.trim(),
                video_url: normalizedVideoUrl,
                description: description.trim(),
                xp_reward: Number(xpReward) || 50,
            }
            if (editingLesson?.id) {
                await apiClient.patch('/admin/lessons.php', { id: editingLesson.id, ...payload })
            } else {
                await apiClient.post<any>('/admin/lessons.php', payload)
            }

            // Sync across all browser tabs immediately
            localStorage.setItem('skillgarden_lessons_synced_at', String(Date.now()))
            window.dispatchEvent(new Event('skillgarden_lessons_updated'))
            try {
                const bc = new BroadcastChannel('skillgarden_sync')
                bc.postMessage({ type: 'LESSONS_UPDATED', skillId: selectedSkillId })
                bc.close()
            } catch { }

            await loadBackendLessons()
        } catch (err: any) {
            alert(err.message || 'Không thể lưu bài học lên máy chủ. Vui lòng thử lại.')
            return
        }

        const actionText = editingLesson ? 'cập nhật' : 'tạo'
        setSuccessAlert(`🎉 Đã ${actionText} bài học "${title.trim()}" thành công! Bài học đã được kết nối và cập nhật tự động sang giao diện Học Viên.`)
        setTitle('')
        setVideoUrl('')
        setDescription('')
        setSelectedFile(null)
        setUploadSuccess(false)
        setEditingLesson(null)
        setTimeout(() => setSuccessAlert(''), 6000)
    }

    const handleEditCustomLesson = (lesson: any) => {
        setEditingLesson(lesson)
        setSelectedSkillId(String(lesson.skill_id || lesson.skillId || '1'))
        setSelectedChapter(String(lesson.order_index || '1'))
        setTitle(lesson.title || '')
        setVideoUrl(lesson.video_url || lesson.videoUrl || '')
        setDescription(lesson.description || '')
        setXpReward(String(lesson.xp_reward || lesson.xpReward || 50))
        setGrowthImpact(String(lesson.growth_impact_percent || lesson.growthImpact || 5))
        setSourceType((lesson.video_url || '').includes('/uploads/') ? 'FILE' : 'YOUTUBE')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDeleteCustomLesson = async (id: number | string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài học video này?')) return
        try {
            await apiClient.delete(`/admin/lessons.php?id=${id}`)
            localStorage.setItem('skillgarden_lessons_synced_at', String(Date.now()))
            window.dispatchEvent(new Event('skillgarden_lessons_updated'))
            try {
                const bc = new BroadcastChannel('skillgarden_sync')
                bc.postMessage({ type: 'LESSONS_UPDATED' })
                bc.close()
            } catch { }
            await loadBackendLessons()
        } catch (err: any) {
            alert(err.message || 'Không thể xóa bài học trên máy chủ.')
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Video className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Tạo Bài Học & Quản Lý Video (Nối Trực Tiếp Học Viên)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Khi bạn xuất bản bài học tại đây, dữ liệu bài học sẽ được cập nhật ngay lập tức sang giao diện học của User.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="font-bold flex items-center gap-1 shrink-0 dark:border-gray-700 dark:hover:bg-gray-800"
                    onClick={() => navigate(`/dashboard/video-learning?skill_id=${selectedSkillId}`)}
                >
                    <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Xem Giao Diện Học Viên
                </Button>
            </div>

            {!isLmsAdmin && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs">
                    <span className="text-lg">🔒</span>
                    <div>
                        <div className="font-extrabold text-amber-950 dark:text-amber-200 text-sm">Rào chắn phân quyền Quản trị LMS</div>
                        <p className="mt-0.5 text-amber-800 dark:text-amber-300/90">Tài khoản hiện tại của bạn không phải là <strong>Admin LMS (LMS Content Admin)</strong>. Quyền hạn tạo, upload và xuất bản bài học Video bị giới hạn chỉ dành cho Quản trị viên LMS.</p>
                    </div>
                </div>
            )}

            {successAlert && (
                <div className="p-4 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
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
                <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-6">

                    {/* Skill & Chapter Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold uppercase tracking-wider text-[#4A5568] dark:text-gray-300 block">
                                CHỌN KHÓA HỌC / KỸ NĂNG ÁP DỤNG
                            </label>
                            <select
                                value={selectedSkillId}
                                onChange={(e) => setSelectedSkillId(e.target.value)}
                                className="w-full p-3 border border-[#E2E4EB] dark:border-gray-700 rounded-xl text-xs font-bold bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                            >
                                {skillOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-extrabold uppercase tracking-wider text-[#4A5568] dark:text-gray-300 block">
                                CHỌN CHẶNG / CHƯƠNG BÀI HỌC
                            </label>
                            <select
                                value={selectedChapter}
                                onChange={(e) => setSelectedChapter(e.target.value)}
                                className="w-full p-3 border border-[#E2E4EB] dark:border-gray-700 rounded-xl text-xs font-bold bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                            >
                                <option value="1">Chặng 01: Kiến thức nền tảng cốt lõi</option>
                                <option value="2">Chặng 02: Kỹ năng nâng cao & Thực chiến</option>
                                <option value="3">Chặng 03: Tối ưu & Mở rộng hệ thống</option>
                                <option value="4">Chặng 04: Kiến trúc dự án chuyên sâu</option>
                            </select>
                        </div>
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
                        <label className="text-xs font-extrabold uppercase tracking-wider text-[#4A5568] dark:text-gray-300 block">
                            CHỌN NGUỒN VIDEO BÀI GIẢNG
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSourceType('YOUTUBE')}
                                className={`p-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${sourceType === 'YOUTUBE'
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 shadow-xs'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <LinkIcon className="w-4 h-4 text-red-500" /> Nhập Link YouTube
                            </button>

                            <button
                                type="button"
                                onClick={() => setSourceType('FILE')}
                                className={`p-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${sourceType === 'FILE'
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 shadow-xs'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Tải File Từ Máy Tính
                            </button>
                        </div>
                    </div>

                    {/* YouTube Link Field */}
                    {sourceType === 'YOUTUBE' && (
                        <div className="space-y-3 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <Input
                                label="ĐƯỜNG DẪN VIDEO YOUTUBE (URL / EMBED)"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                                iconRight={<LinkIcon className="w-4 h-4 text-gray-400" />}
                            />

                            {videoUrl && (
                                <div className="mt-2 aspect-video bg-black rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
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
                        <div className="space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                            <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-2xl p-6 text-center bg-white dark:bg-gray-800/80 space-y-3">
                                <FileVideo className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400" />
                                <div>
                                    <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100">
                                        Kéo thả hoặc bấm để chọn video từ máy tính
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
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
                                    <div className="pt-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
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
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 rounded-xl text-xs font-extrabold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                                    <span>Đã upload thành công lên Server: {videoUrl}</span>
                                </div>
                            )}

                            {videoUrl && sourceType === 'FILE' && (
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 mt-3">
                                    <video controls src={videoUrl} className="w-full h-full" />
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-gray-300 block mb-1">
                            MÔ TẢ BÀI HỌC & NỘI DUNG LÝ THUYẾT
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Nhập nội dung mô tả vắn tắt hoặc hướng dẫn thực hành cho bài học này..."
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Right Col: Gamification Config */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-6 h-fit">
                        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white border-b border-[#E2E4EB] dark:border-gray-800 pb-3 flex items-center gap-2">
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
                            iconRight={<Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        />

                        <div className="p-3 bg-[#FAFAF7] dark:bg-gray-800/60 rounded-xl text-[11px] text-gray-500 dark:text-gray-400 border border-[#E2E4EB] dark:border-gray-700">
                            Khi xuất bản, bài học sẽ hiển thị ngay trong playlist xem video của Học Viên thuộc khóa học đã chọn.
                        </div>

                        <Button type="submit" variant="indigo" fullWidth className="font-bold flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 border-none cursor-pointer">
                            <Save className="w-4 h-4" /> {editingLesson ? 'Lưu thay đổi bài học' : 'Xuất Bản Bài Học Đến Học Viên'}
                        </Button>

                        {editingLesson && (
                            <Button
                                type="button"
                                variant="outline"
                                fullWidth
                                onClick={() => {
                                    setEditingLesson(null)
                                    setTitle('')
                                    setVideoUrl('')
                                    setDescription('')
                                }}
                                className="font-bold text-xs cursor-pointer border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                            >
                                Hủy Chế Độ Chỉnh Sửa
                            </Button>
                        )}
                    </div>

                    {/* Admin Published Lessons History List */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                                Bài học trong hệ thống ({adminLessons.length})
                            </h3>
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                                Realtime Sync
                            </span>
                        </div>

                        {adminLessons.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Chưa có bài học nào trong hệ thống.</p>
                        ) : (
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {adminLessons.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                                            editingLesson?.id === item.id
                                                ? 'bg-indigo-50/80 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-400/40'
                                                : String(item.skill_id) === String(selectedSkillId)
                                                ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                                                : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between font-bold">
                                            <span className="text-[#3C4097] dark:text-indigo-400 truncate max-w-[180px]" title={item.title}>
                                                {item.title}
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditCustomLesson(item)}
                                                    className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 cursor-pointer"
                                                    title="Sửa bài học này"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCustomLesson(item.id)}
                                                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 cursor-pointer"
                                                    title="Xóa bài học này"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
                                            <span className="truncate max-w-[140px] font-medium">
                                                {item.skill_title || `Skill #${item.skill_id}`}
                                            </span>
                                            <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                                                +{item.xp_reward || item.xpReward || 50} XP
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            fullWidth
                            className="text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer dark:border-gray-700"
                            onClick={() => navigate(`/dashboard/video-learning?skill_id=${selectedSkillId}`)}
                        >
                            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Xem Giao Diện Học Viên (Skill #{selectedSkillId})
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
