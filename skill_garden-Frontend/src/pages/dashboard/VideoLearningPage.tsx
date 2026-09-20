import React, { useState, useEffect, useRef } from 'react'
import { Play, CheckCircle2, FileText, Download, ChevronRight, Lock, Video, HardDrive, Trash2, HelpCircle, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { getChapterProgress, isChapterUnlocked, updateChapterProgress } from '../../services/learningProgress'
import { useAuthStore } from '../../stores/authStore'
import { apiClient } from '../../services/apiClient'

interface NoteItem {
    id: number
    time: string
    content: string
}

declare global {
    interface Window {
        YT?: any
        onYouTubeIframeAPIReady?: () => void
    }
}

const normalizeVideoSourceUrl = (rawUrl?: string): string => {
    const url = (rawUrl || '').trim()
    if (!url) return url

    if (url.includes('youtube.com/watch?v=')) {
        const videoIdMatch = url.match(/[?&]v=([^&]+)/i)
        if (videoIdMatch?.[1]) {
            return `https://www.youtube-nocookie.com/embed/${videoIdMatch[1]}?rel=0`
        }
    }

    if (url.includes('youtu.be/')) {
        const videoIdMatch = url.match(/youtu\.be\/([^?]+)/i)
        if (videoIdMatch?.[1]) {
            return `https://www.youtube-nocookie.com/embed/${videoIdMatch[1]}?rel=0`
        }
    }

    if (url.includes('/uploads/videos/')) {
        return url.includes('/public/uploads/videos/') ? url : url.replace('/uploads/videos/', '/public/uploads/videos/')
    }

    return url
}

const getYouTubeVideoId = (url: string): string => {
    const match = url.match(/\/embed\/([^?]+)/i)
    return match?.[1] || ''
}

export const VideoLearningPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const skillId = searchParams.get('skill_id') || '1'
    const initialChapterId = searchParams.get('chapter') || '1'
    const { user } = useAuthStore()
    const userKey = user?.email || 'guest'

    const [activeTab, setActiveTab] = useState<'notes' | 'materials'>('notes')
    const [noteText, setNoteText] = useState('')
    const [currentVideoTime, setCurrentVideoTime] = useState(0)
    const [maxWatchedTime, setMaxWatchedTime] = useState(0)
    const [videoFinished, setVideoFinished] = useState(false)
    const [replayMode, setReplayMode] = useState(false)
    const [volume, setVolume] = useState(100)
    const [toastMsg, setToastMsg] = useState('')
    const videoRef = useRef<HTMLVideoElement>(null)
    const youtubeContainerRef = useRef<HTMLDivElement>(null)
    const youtubePlayerRef = useRef<any>(null)
    const currentVideoTimeRef = useRef(0)

    // Current active lesson state
    const [currentLessonId, setCurrentLessonId] = useState<number>(1)
    const [currentVideoUrl, setCurrentVideoUrl] = useState('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0')
    const [currentLessonTitle, setCurrentLessonTitle] = useState('1. Giới thiệu tổng quan React 19 & JSX Syntax')
    const [currentDescription, setCurrentDescription] = useState(
        'Trong bài học này, chúng ta sẽ cùng tìm hiểu cách thiết kế các Component độc lập, tái sử dụng và cách truyền nhận dữ liệu thông qua Props trong React 19.'
    )

    const firstAvailableChapterId = isChapterUnlocked(skillId, initialChapterId, userKey) ? initialChapterId : '1'
    const [activeChapterId, setActiveChapterId] = useState(firstAvailableChapterId)
    const [chapterProgress, setChapterProgress] = useState(() => getChapterProgress(skillId, firstAvailableChapterId, userKey))

    // Admin created custom lessons list for this skill
    const [customLessons, setCustomLessons] = useState<any[]>([])

    const storageKey = `skillgarden_notes_skill_${skillId}_lesson_${currentLessonId}`

    const [notesList, setNotesList] = useState<NoteItem[]>(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
            try { return JSON.parse(saved) } catch { }
        }
        return [
            { id: 1, time: '02:45', content: 'Cần lưu ý cơ chế Virtual DOM của React giúp tối ưu render.' },
            { id: 2, time: '05:10', content: 'Hàm useState trả về 1 tuple gồm state và hàm setState.' }
        ]
    })

    // Load published lessons from the backend so every user sees admin updates.
    useEffect(() => {
        let isMounted = true

        const loadLessons = async () => {
            try {
                const response = await apiClient.get<any[]>(`/lessons.php?skill_id=${encodeURIComponent(skillId)}`)
                if (isMounted && Array.isArray(response.data)) {
                    setCustomLessons(response.data.map((item) => ({
                        id: Number(item.id),
                        title: item.title,
                        duration: item.video_duration_seconds
                            ? `${Math.floor(Number(item.video_duration_seconds) / 60).toString().padStart(2, '0')}:${(Number(item.video_duration_seconds) % 60).toString().padStart(2, '0')}`
                            : '15:00',
                        videoUrl: normalizeVideoSourceUrl(item.video_url),
                        description: item.description,
                    })))
                    return
                }
            } catch {
                // Use local data while the backend is unavailable.
            }

            try {
                const saved = localStorage.getItem('skillgarden_custom_lessons') || '[]'
                const parsed = JSON.parse(saved)
                if (isMounted && Array.isArray(parsed)) {
                    setCustomLessons(parsed.filter((item: any) => String(item.skillId) === String(skillId)))
                }
            } catch {
                if (isMounted) setCustomLessons([])
            }
        }

        void loadLessons()
        return () => { isMounted = false }
    }, [skillId])

    useEffect(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
            try {
                setNotesList(JSON.parse(saved))
            } catch {
                setNotesList([])
            }
        } else {
            setNotesList([
                { id: 1, time: '02:45', content: 'Cần lưu ý cơ chế Virtual DOM của React giúp tối ưu render.' },
                { id: 2, time: '05:10', content: 'Hàm useState trả về 1 tuple gồm state và hàm setState.' }
            ])
        }
    }, [storageKey])

    const handleAddNote = () => {
        if (!noteText.trim()) return
        const noteTime = currentVideoTimeRef.current
        const newNote = { id: Date.now(), time: formatVideoTime(noteTime), content: noteText.trim() }
        const updated = [newNote, ...notesList]
        setNotesList(updated)
        localStorage.setItem(storageKey, JSON.stringify(updated))
        setNoteText('')
    }

    const handleDeleteNote = (id: number) => {
        const updated = notesList.filter(n => n.id !== id)
        setNotesList(updated)
        localStorage.setItem(storageKey, JSON.stringify(updated))
    }

    const handleCompleteVideo = () => {
        if (!videoFinished) {
            setToastMsg('Bạn cần xem xong video')
            setTimeout(() => setToastMsg(''), 4000)
            return
        }
        const updated = updateChapterProgress(skillId, { videoCompleted: true }, activeChapterId, userKey)
        setChapterProgress(updated)
        setVideoFinished(true)
        setToastMsg('🎉 Đã xem xong video! Bài Quiz của bài học này đã được MỞ KHÓA!')
        setTimeout(() => setToastMsg(''), 5000)
    }

    const handleVideoEnded = () => {
        setVideoFinished(true)
        setToastMsg('Bạn đã xem xong video. Hãy bấm Đánh Dấu Đã Xem Xong Video để tiếp tục.')
        setTimeout(() => setToastMsg(''), 5000)
    }

    const handleReplayVideo = () => {
        setReplayMode(true)
        setCurrentVideoTime(0)
        currentVideoTimeRef.current = 0
    }

    const handleVideoTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = event.currentTarget
        const currentTime = video.currentTime
        if (!replayMode && currentTime > maxWatchedTime + 1) {
            video.currentTime = maxWatchedTime
            return
        }

        const nextTime = Math.floor(currentTime)
        setCurrentVideoTime(nextTime)
        currentVideoTimeRef.current = nextTime
        setMaxWatchedTime((watchedTime) => Math.max(watchedTime, currentTime))
    }

    const handleVideoSeeking = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = event.currentTarget
        if (!replayMode && video.currentTime > maxWatchedTime) {
            video.currentTime = maxWatchedTime
        }
    }

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextVolume = Number(event.target.value)
        setVolume(nextVolume)
        if (videoRef.current) {
            videoRef.current.volume = nextVolume / 100
        }
        youtubePlayerRef.current?.setVolume?.(nextVolume)
    }

    const handleCompletePdf = () => {
        const updated = updateChapterProgress(skillId, { pdfCompleted: true }, activeChapterId, userKey)
        setChapterProgress(updated)
    }

    const formatVideoTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
        const seconds = (totalSeconds % 60).toString().padStart(2, '0')
        return `${minutes}:${seconds}`
    }

    const handleDownloadMaterial = () => {
        const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 102 >>
stream
BT
/F1 18 Tf
72 720 Td
(${currentLessonTitle.replace(/[()\\]/g, '\\$&')}) Tj
/F1 12 Tf
0 -32 Td
(Tai lieu hoc tap SkillGarden) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`
        const downloadUrl = URL.createObjectURL(new Blob([pdfContent], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `SkillGarden-${skillId}-tai-lieu.pdf`
        link.click()
        URL.revokeObjectURL(downloadUrl)
    }

    const defaultLessons = [
        { id: 1, title: '1. Giới thiệu tổng quan React 19 & JSX Syntax', duration: '12:45', status: 'completed', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: '' },
        { id: 2, title: '2. React Components & Props cơ bản (File Tải lên)', duration: '18:20', status: 'active', videoUrl: 'http://localhost:8000/uploads/videos/sample.mp4', description: '' },
        { id: 3, title: '3. State Management với useState & useReducer', duration: '25:15', status: 'locked', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: '' },
        { id: 4, title: '4. Side Effects & Lifecycle với useEffect Hook', duration: '20:00', status: 'locked', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: '' }
    ]

    const formattedCustomLessons = customLessons.map((item, idx) => ({
        id: 100 + idx,
        title: `${defaultLessons.length + idx + 1}. ${item.title} (Admin Thêm 🚀)`,
        duration: item.duration || '15:00',
        status: 'active',
        videoUrl: normalizeVideoSourceUrl(item.videoUrl),
        description: item.description,
        isAdminAdded: true
    }))

    const lessons = skillId === '1'
        ? [...defaultLessons, ...formattedCustomLessons]
        : formattedCustomLessons

    const lessonItems = lessons.map((item, index) => {
        const lessonChapterId = String(index + 1)
        const progress = getChapterProgress(skillId, lessonChapterId, userKey)
        const unlocked = isChapterUnlocked(skillId, lessonChapterId, userKey)
        return {
            ...item,
            chapterId: lessonChapterId,
            progress,
            status: progress.quizCompleted ? 'completed' : unlocked ? 'active' : 'locked',
        }
    })

    const isYouTubeUrl = (url: string) => {
        return url.includes('youtube.com') || url.includes('youtube-nocookie.com') || url.includes('youtu.be')
    }

    useEffect(() => {
        if (!isYouTubeUrl(currentVideoUrl)) return

        const createPlayer = () => {
            const videoId = getYouTubeVideoId(currentVideoUrl)
            if (!videoId || !youtubeContainerRef.current || !window.YT?.Player) return

            youtubePlayerRef.current?.destroy?.()
            youtubePlayerRef.current = new window.YT.Player(youtubeContainerRef.current, {
                videoId,
                playerVars: {
                    controls: replayMode ? 1 : 0,
                    disablekb: replayMode ? 0 : 1,
                    rel: 0,
                },
                events: {
                    onReady: (event: any) => event.target.setVolume(volume),
                    onStateChange: (event: any) => {
                        if (event.data === 0) setVideoFinished(true)
                    },
                },
            })

            const syncYouTubeTime = window.setInterval(() => {
                const player = youtubePlayerRef.current
                if (!player?.getCurrentTime) return
                const nextTime = Math.floor(player.getCurrentTime())
                if (nextTime !== currentVideoTimeRef.current) {
                    currentVideoTimeRef.current = nextTime
                    setCurrentVideoTime(nextTime)
                }
            }, 250)

            return () => window.clearInterval(syncYouTubeTime)
        }

        let cleanupPlayerTime: (() => void) | undefined
        if (window.YT?.Player) {
            cleanupPlayerTime = createPlayer()
        } else {
            const previousReady = window.onYouTubeIframeAPIReady
            window.onYouTubeIframeAPIReady = () => {
                previousReady?.()
                cleanupPlayerTime = createPlayer()
            }
            const script = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
            if (!script) {
                const youtubeScript = document.createElement('script')
                youtubeScript.src = 'https://www.youtube.com/iframe_api'
                document.body.appendChild(youtubeScript)
            }
        }

        return () => {
            cleanupPlayerTime?.()
            youtubePlayerRef.current?.destroy?.()
            youtubePlayerRef.current = null
        }
    }, [currentVideoUrl, replayMode])

    return (
        <div className="min-h-screen bg-[#FAFAF7] dark:bg-gray-900 text-[#20223A] dark:text-gray-100 pb-12">
            {/* Toast alert */}
            {toastMsg && (
                <div className="bg-emerald-600 text-white text-xs font-black p-4 text-center sticky top-0 z-50 shadow-md animate-bounce flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>{toastMsg}</span>
                    <Button
                        size="sm"
                        variant="primary"
                        className="bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-black ml-3"
                        onClick={() => navigate(`/dashboard/quiz-room/${skillId}?chapter=${activeChapterId}`)}
                    >
                        Làm Bài Quiz Ngay 📝
                    </Button>
                </div>
            )}

            {/* Header breadcrumb */}
            <div className="bg-white dark:bg-gray-800 border-b border-[#E2E4EB] dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-[#6B6D7A] dark:text-gray-400">
                    <span>Khóa học</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Kỹ năng #{skillId}</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-bold text-[#3C4097] dark:text-indigo-400 truncate max-w-[250px]">{currentLessonTitle}</span>
                </div>

                <div className="flex items-center gap-3">
                    {chapterProgress.videoCompleted && chapterProgress.pdfCompleted ? (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã Xem Xong Video
                            </span>

                            <Button
                                variant="indigo"
                                size="sm"
                                className="font-black text-xs flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md animate-pulse cursor-pointer"
                                onClick={() => navigate(`/dashboard/quiz-room/${skillId}?chapter=${activeChapterId}`)}
                            >
                                <HelpCircle className="w-4 h-4 text-yellow-300" />
                                <span>Làm Quiz Ngay (+100 XP)</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="indigo" size="sm" className="font-bold cursor-pointer" onClick={handleCompleteVideo}>
                                Đánh Dấu Đã Xem Xong Video
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="font-bold text-xs opacity-60 flex items-center gap-1 cursor-not-allowed"
                                title="Xem xong video để mở khóa Quiz"
                            >
                                <Lock className="w-3.5 h-3.5" /> Quiz (Đang khóa)
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main content grid */}
            <div className="max-w-7xl mx-auto px-6 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Video Player & Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dynamic Video Player Box */}
                    <div className="bg-black rounded-2xl aspect-video overflow-hidden relative shadow-xl flex items-center justify-center border border-[#E2E4EB] dark:border-gray-700">
                        {isYouTubeUrl(currentVideoUrl) ? (
                            <div
                                ref={youtubeContainerRef}
                                className="w-full h-full"
                                aria-label={currentLessonTitle}
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                controls
                                controlsList="nodownload"
                                className="w-full h-full object-contain"
                                src={currentVideoUrl}
                                onTimeUpdate={handleVideoTimeUpdate}
                                onSeeking={handleVideoSeeking}
                                onEnded={handleVideoEnded}
                            >
                                Trình duyệt của bạn không hỗ trợ phát file video này.
                            </video>
                        )}
                    </div>

                    {/* Lesson Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-700 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-[#20223A] dark:text-white">
                                {currentLessonTitle}
                            </h1>
                            <span className="text-xs font-extrabold px-3 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                {isYouTubeUrl(currentVideoUrl) ? <Video className="w-3.5 h-3.5 text-red-500" /> : <HardDrive className="w-3.5 h-3.5 text-emerald-600" />}
                                {isYouTubeUrl(currentVideoUrl) ? 'Nguồn YouTube' : 'Nguồn File Tải Lên'}
                            </span>
                        </div>

                        <p className="text-sm text-[#6B6D7A] dark:text-gray-300 leading-relaxed">
                            {currentDescription}
                        </p>

                        <label className="flex items-center gap-3 text-xs font-bold text-[#6B6D7A] dark:text-gray-300">
                            <span>Âm lượng</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-40 accent-[#3C4097] cursor-pointer"
                                aria-label="Điều chỉnh âm lượng video"
                            />
                            <span className="w-9 text-right">{volume}%</span>
                        </label>

                        {videoFinished && !replayMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="font-bold cursor-pointer"
                                onClick={handleReplayVideo}
                            >
                                <Play className="w-4 h-4" /> Ôn lại video và bật tua
                            </Button>
                        )}

                        {/* Direct Quiz Call to Action Banner when Unlocked */}
                        {chapterProgress.videoCompleted && chapterProgress.pdfCompleted && (
                            <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-yellow-500" /> BÀI QUIZ ĐÃ ĐƯỢC MỞ KHÓA!
                                    </h3>
                                    <p className="text-xs text-[#4A5568] dark:text-gray-300">
                                        Hãy làm bài quiz ngay để củng cố kiến thức và nhận ngay <strong>+100 XP</strong> cho mầm cây kỹ năng.
                                    </p>
                                </div>
                                <Button
                                    variant="indigo"
                                    className="font-extrabold text-xs shrink-0 cursor-pointer shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                    onClick={() => navigate(`/dashboard/quiz-room/${skillId}?chapter=${activeChapterId}`)}
                                >
                                    Vào Làm Quiz Ngay 📝
                                </Button>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex border-b border-[#E2E4EB] dark:border-gray-700 pt-2">
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors cursor-pointer ${activeTab === 'notes'
                                    ? 'border-[#3C4097] text-[#3C4097] dark:text-indigo-400 dark:border-indigo-400'
                                    : 'border-transparent text-[#6B6D7A] dark:text-gray-400 hover:text-[#20223A]'
                                    }`}
                            >
                                Ghi chú cá nhân ({notesList.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('materials')}
                                className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors cursor-pointer ${activeTab === 'materials'
                                    ? 'border-[#3C4097] text-[#3C4097] dark:text-indigo-400 dark:border-indigo-400'
                                    : 'border-transparent text-[#6B6D7A] dark:text-gray-400 hover:text-[#20223A]'
                                    }`}
                            >
                                Tài liệu PDF đính kèm (2)
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'notes' ? (
                            <div className="space-y-4 pt-2">
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-[#3C4097] dark:text-indigo-400">
                                        Thời điểm đang xem: {formatVideoTime(currentVideoTime)}
                                    </span>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                            placeholder="Nhập ghi chú cá nhân cho bài học này..."
                                            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-[#E2E4EB] dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3C4097] dark:text-white"
                                        />
                                        <Button variant="indigo" onClick={handleAddNote}>Lưu ghi chú</Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {notesList.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic py-2">Chưa có ghi chú nào cho bài học này. Hãy nhập ghi chú đầu tiên!</p>
                                    ) : (
                                        notesList.map((n) => (
                                            <div key={n.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-between text-xs border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="font-mono bg-[#3C4097] text-white px-2 py-0.5 rounded font-bold shrink-0">{n.time}</span>
                                                    <p className="text-[#20223A] dark:text-gray-200 font-medium">{n.content}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteNote(n.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                                                    title="Xóa ghi chú"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 pt-2">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" />
                                        <div>
                                            <p className="text-xs font-bold text-[#20223A] dark:text-white">Slide_Bai_2_React_Props.pdf</p>
                                            <p className="text-[11px] text-[#6B6D7A] dark:text-gray-400">Dung lượng: 2.4 MB</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" size="sm" className="flex items-center gap-1 cursor-pointer" onClick={handleDownloadMaterial}>
                                            <Download className="w-3.5 h-3.5" /> Tải về
                                        </Button>
                                        <Button type="button" variant={chapterProgress.pdfCompleted ? 'success' : 'indigo'} size="sm" className="cursor-pointer" onClick={handleCompletePdf} disabled={!chapterProgress.videoCompleted}>
                                            {chapterProgress.pdfCompleted ? 'Đã đọc xong' : 'Đã đọc xong tài liệu'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Playlist / Syllabus */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-700 shadow-xs space-y-4 h-fit">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                        <h2 className="text-lg font-bold text-[#20223A] dark:text-white">Nội dung khóa học</h2>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                            {lessons.length} Bài học
                        </span>
                    </div>

                    <div className="space-y-2">
                        {lessonItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    if (item.status === 'locked') {
                                        setToastMsg('Bạn cần hoàn thành video, PDF và Quiz của bài trước để mở bài này.')
                                        setTimeout(() => setToastMsg(''), 4000)
                                        return
                                    }
                                    setActiveChapterId(item.chapterId)
                                    setChapterProgress(item.progress)
                                    setCurrentLessonId(item.id)
                                    setCurrentVideoUrl(normalizeVideoSourceUrl(item.videoUrl))
                                    setCurrentLessonTitle(item.title)
                                    setCurrentVideoTime(0)
                                    currentVideoTimeRef.current = 0
                                    setMaxWatchedTime(0)
                                    setVideoFinished(false)
                                    setReplayMode(false)
                                    if (item.description) {
                                        setCurrentDescription(item.description)
                                    }
                                }}
                                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${currentLessonTitle === item.title
                                    ? 'border-[#3C4097] bg-[#F4F5FF] dark:bg-indigo-950/60 dark:border-indigo-400 shadow-xs'
                                    : 'border-[#E2E4EB] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-[#6FAF7B] dark:text-emerald-400" />}
                                    {item.status === 'active' && <Play className="w-5 h-5 text-[#3C4097] fill-[#3C4097] dark:text-indigo-400 dark:fill-indigo-400" />}
                                    {item.status === 'locked' && <Lock className="w-5 h-5 text-gray-400" />}
                                    <div>
                                        <p className="text-xs font-bold text-[#20223A] dark:text-white flex items-center gap-1">
                                            <span>{item.title}</span>
                                        </p>
                                        <span className="text-[11px] text-[#6B6D7A] dark:text-gray-400">{item.duration}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
