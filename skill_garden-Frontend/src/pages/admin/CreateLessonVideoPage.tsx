import React, { useState } from 'react'
import { Video, Save, Upload, Link, Sparkles, Sprout, CheckCircle2, FileVideo, HardDrive, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { apiClient } from '../../services/apiClient'

export const CreateLessonVideoPage: React.FC = () => {
    const [title, setTitle] = useState('')
    const [sourceType, setSourceType] = useState<'YOUTUBE' | 'FILE'>('YOUTUBE')
    const [videoUrl, setVideoUrl] = useState('')
    const [xpReward, setXpReward] = useState('50')
    const [growthImpact, setGrowthImpact] = useState('5.0')
    const [description, setDescription] = useState('')

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)
            setUploadSuccess(false)
        }
    }

    const handleUploadLocalVideo = async () => {
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
                setVideoUrl(res.url)
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

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (!videoUrl.trim()) {
            alert('Vui lòng nhập link YouTube hoặc upload file video từ máy!')
            return
        }
        alert(`Tạo bài học thành công!\nLoại Nguồn: ${sourceType}\nURL Video: ${videoUrl}`)
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-5xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs">
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                    <Video className="w-6 h-6 text-[#3C4097]" /> Tạo Bài Học & Quản Lý Video (Đa Nguồn)
                </h1>
                <p className="text-xs text-[#6B6D7A] mt-1">Lựa chọn tải file Video từ máy tính hoặc nhúng link YouTube trực tiếp.</p>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left 2 cols: Content Info */}
                <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-xs space-y-6">
                    <Input
                        label="TIÊU ĐỀ BÀI HỌC"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Bài 2: React Components & Props"
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
                                <Link className="w-4 h-4 text-red-500" /> Nhập Link YouTube
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
                                iconRight={<Link className="w-4 h-4 text-gray-400" />}
                            />

                            {videoUrl && (
                                <div className="mt-2 aspect-video bg-black rounded-xl overflow-hidden border border-gray-300">
                                    <iframe
                                        className="w-full h-full"
                                        src={videoUrl.includes('embed') ? videoUrl : `https://www.youtube.com/embed/${videoUrl.split('v=')[1] || ''}`}
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
                                    className="w-full font-bold flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 border-none"
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
                            placeholder="Nhập nội dung mô tả vắn tắt hoặc hướng dẫn thực hành..."
                            className="w-full p-3 border border-[#E2E4EB] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3C4097]"
                        />
                    </div>
                </div>

                {/* Right Col: Gamification Config */}
                <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-xs space-y-6 h-fit">
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
                        Tác động sinh trưởng sẽ cộng dồn trực tiếp vào mầm cây kỹ năng thuộc khóa học khi học viên xem video.
                    </div>

                    <Button type="submit" variant="indigo" fullWidth className="font-bold flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 border-none">
                        <Save className="w-4 h-4" /> Lưu bài học
                    </Button>
                </div>
            </form>
        </div>
    )
}
