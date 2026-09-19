import React, { useEffect, useRef, useState } from 'react'
import { Play, CheckCircle2, FileText, Download, Bookmark, Award, ChevronRight, Lock } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { getChapterProgress, isChapterUnlocked, updateChapterProgress } from '../../services/learningProgress'
import { useAuthStore } from '../../stores/authStore'

interface YouTubePlayer {
    getCurrentTime: () => number
    destroy: () => void
}

interface YouTubeApi {
    Player: new (element: HTMLIFrameElement, options: { events: { onReady: () => void } }) => YouTubePlayer
}

declare global {
    interface Window {
        YT?: YouTubeApi
        onYouTubeIframeAPIReady?: () => void
    }
}

const lessonBySkill = {
    '1': {
        course: 'Khóa học Frontend React',
        chapter: 'Chương 1: Core Concepts',
        title: 'Bài 2: React Components & Props cơ bản',
        description: 'Thiết kế Component độc lập, tái sử dụng và truyền nhận dữ liệu thông qua Props trong React 19.',
        lessons: ['Giới thiệu React 19 & JSX', 'React Components & Props', 'State Management với useState', 'Side Effects với useEffect'],
    },
    '2': {
        course: 'Khóa học Backend NestJS',
        chapter: 'Chương 1: NestJS Core',
        title: 'Bài 2: Dependency Injection & Module Architecture',
        description: 'Tổ chức module, controller và service để xây dựng backend NestJS có thể mở rộng.',
        lessons: ['Node.js và NestJS nền tảng', 'Dependency Injection & Modules', 'Controllers và Services', 'Authentication với JWT'],
    },
    '3': {
        course: 'Khóa học Database SQL',
        chapter: 'Chương 1: SQL chuyên sâu',
        title: 'Bài 2: Index, Query Plan & tối ưu truy vấn MySQL',
        description: 'Đọc Query Plan, thiết kế Index và tối ưu các truy vấn MySQL trong hệ thống thực tế.',
        lessons: ['SQL nền tảng và JOIN', 'Index và Query Plan', 'Transaction và Locking', 'Thiết kế schema thực tế'],
    },
    '4': {
        course: 'Khóa học Python Data Analysis',
        chapter: 'Chương 1: Python Core',
        title: 'Bài 2: DataFrame, Filtering & GroupBy với Pandas',
        description: 'Làm sạch, lọc và tổng hợp dữ liệu bằng DataFrame và GroupBy trong Pandas.',
        lessons: ['Python và cấu trúc dữ liệu', 'DataFrame và Filtering', 'GroupBy và Aggregation', 'Trực quan hóa dữ liệu'],
    },
    '5': {
        course: 'Khóa học Software Testing',
        chapter: 'Chương 1: Manual Testing',
        title: 'Bài 2: Viết Test Case và chiến lược kiểm thử',
        description: 'Phân tích yêu cầu và viết Test Case rõ ràng, có khả năng bao phủ các luồng quan trọng.',
        lessons: ['Tổng quan quy trình QA', 'Viết Test Case', 'Bug Report hiệu quả', 'Playwright Automation'],
    },
    '6': {
        course: 'Khóa học Mobile đa nền tảng',
        chapter: 'Chương 1: Mobile UI',
        title: 'Bài 2: Thiết kế UI và quản lý state mobile',
        description: 'Xây dựng giao diện responsive và quản lý state cho ứng dụng Flutter hoặc React Native.',
        lessons: ['Kiến trúc ứng dụng mobile', 'UI responsive và navigation', 'State management', 'Kết nối REST API'],
    },
} as const

export const VideoLearningPage: React.FC = () => {
    const { id = '1' } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const chapterId = searchParams.get('chapter') || '1'
    const isReviewMode = searchParams.has('lesson')
    const { user } = useAuthStore()
    const userKey = user?.email || 'guest'
    const chapterUnlocked = isChapterUnlocked(id, chapterId, userKey)
    const lesson = lessonBySkill[id as keyof typeof lessonBySkill] ?? lessonBySkill['1']
    const notesStorageKey = `skillgarden-video-notes-${id}`
    const [activeTab, setActiveTab] = useState<'notes' | 'materials'>('notes')
    const [noteText, setNoteText] = useState('')
    const [currentVideoTime, setCurrentVideoTime] = useState(0)
    const videoFrameRef = useRef<HTMLIFrameElement>(null)
    const [chapterProgress, setChapterProgress] = useState(() => getChapterProgress(id, chapterId, userKey))
    const [notesList, setNotesList] = useState(() => {
        const defaultNotes = [
            { id: 1, time: '02:45', content: 'Cần lưu ý cơ chế Virtual DOM của React giúp tối ưu render.' },
            { id: 2, time: '05:10', content: 'Hàm useState trả về 1 tuple gồm state và hàm setState.' }
        ]
        const savedNotes = localStorage.getItem(notesStorageKey)
        if (!savedNotes) return defaultNotes

        try {
            const parsedNotes = JSON.parse(savedNotes)
            return Array.isArray(parsedNotes) ? parsedNotes : defaultNotes
        } catch {
            localStorage.removeItem(notesStorageKey)
            return defaultNotes
        }
    })

    useEffect(() => {
        localStorage.setItem(notesStorageKey, JSON.stringify(notesList))
    }, [notesList, notesStorageKey])

    useEffect(() => {
        let player: YouTubePlayer | undefined
        let timeUpdateInterval: number | undefined

        const initializePlayer = () => {
            if (!videoFrameRef.current || !window.YT) return
            player = new window.YT.Player(videoFrameRef.current, {
                events: {
                    onReady: () => {
                        timeUpdateInterval = window.setInterval(() => {
                            setCurrentVideoTime(Math.floor(player?.getCurrentTime() || 0))
                        }, 500)
                    },
                },
            })
        }

        if (window.YT) {
            initializePlayer()
        } else {
            const script = document.querySelector<HTMLScriptElement>('script[data-youtube-iframe-api]')
            if (script) {
                window.onYouTubeIframeAPIReady = initializePlayer
            } else {
                const apiScript = document.createElement('script')
                apiScript.src = 'https://www.youtube.com/iframe_api'
                apiScript.async = true
                apiScript.dataset.youtubeIframeApi = 'true'
                window.onYouTubeIframeAPIReady = initializePlayer
                document.body.appendChild(apiScript)
            }
        }

        return () => {
            if (timeUpdateInterval) window.clearInterval(timeUpdateInterval)
            player?.destroy()
        }
    }, [])

    const handleAddNote = () => {
        if (!noteText.trim()) return
        setNotesList([...notesList, { id: Date.now(), time: formatVideoTime(currentVideoTime), content: noteText }])
        setNoteText('')
    }

    const handleCompleteVideo = () => {
        setChapterProgress(updateChapterProgress(id, { videoCompleted: true }, chapterId, userKey))
    }

    const handleCompletePdf = () => {
        setChapterProgress(updateChapterProgress(id, { pdfCompleted: true }, chapterId, userKey))
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
(${lesson.title.replace(/[()\\]/g, '\\$&')}) Tj
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
        link.download = `SkillGarden-${id}-tai-lieu.pdf`
        link.click()
        URL.revokeObjectURL(downloadUrl)
    }

    const lessons = lesson.lessons.map((title, index) => ({
        id: index + 1,
        title: `${index + 1}. ${title}`,
        duration: ['12:45', '18:20', '25:15', '20:00'][index],
        status: index === 0
            ? chapterProgress.videoCompleted ? 'completed' : 'active'
            : index === 1 && chapterProgress.videoCompleted ? 'active' : 'locked'
    }))

    if (!chapterUnlocked) {
        return (
            <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12">
                <div className="max-w-2xl mx-auto px-6 pt-12">
                    <div className="bg-white rounded-2xl p-8 border border-amber-200 shadow-md text-center space-y-5">
                        <Lock className="w-10 h-10 mx-auto text-amber-600" />
                        <h1 className="text-2xl font-extrabold">Chặng học đang bị khóa</h1>
                        <p className="text-sm text-[#6B6D7A]">Hãy hoàn thành quiz của chặng trước để mở chặng này.</p>
                        <Link to={`/dashboard/learning-path/${id}`}>
                            <Button variant="indigo">Về lộ trình học tập</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
>>>>>>> b774379 (fix FE)

    const isYouTubeUrl = (url: string) => {
        return url.includes('youtube.com') || url.includes('youtu.be')
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] dark:bg-gray-900 text-[#20223A] dark:text-gray-100 pb-12">
            {/* Header breadcrumb */}
<<<<<<< HEAD
            <div className="bg-white dark:bg-gray-800 border-b border-[#E2E4EB] dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#6B6D7A] dark:text-gray-400">
                    <span>Khóa học Frontend React</span>
=======
            <div className="bg-white border-b border-[#E2E4EB] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#6B6D7A]">
                    <span>{lesson.course}</span>
>>>>>>> b774379 (fix FE)
                    <ChevronRight className="w-4 h-4" />
                    <span>{lesson.chapter}</span>
                    <ChevronRight className="w-4 h-4" />
<<<<<<< HEAD
                    <span className="font-bold text-[#3C4097] dark:text-indigo-400">{currentLessonTitle}</span>
=======
                    <span className="font-bold text-[#3C4097]">{lesson.title}</span>
>>>>>>> b774379 (fix FE)
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#DCEFE1] dark:bg-emerald-950 text-[#2C6A3D] dark:text-emerald-300 text-xs font-bold rounded-full">
                        +50 XP Thưởng
                    </span>
                    <Button variant={chapterProgress.videoCompleted ? 'success' : 'indigo'} size="sm" className="font-bold" onClick={handleCompleteVideo}>
                        {chapterProgress.videoCompleted ? 'Video đã hoàn thành' : 'Đánh dấu hoàn thành'}
                    </Button>
                </div>
            </div>

            {/* Main content grid */}
            <div className="max-w-7xl mx-auto px-6 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Video Player & Tabs */}
                <div className="lg:col-span-2 space-y-6">
<<<<<<< HEAD
                    {/* Dynamic Video Player Box */}
                    <div className="bg-black rounded-2xl aspect-video overflow-hidden relative shadow-xl flex items-center justify-center border border-[#E2E4EB] dark:border-gray-700">
                        {isYouTubeUrl(currentVideoUrl) ? (
                            <iframe
                                className="w-full h-full"
                                src={currentVideoUrl}
                                title={currentLessonTitle}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <video
                                controls
                                controlsList="nodownload"
                                className="w-full h-full object-contain"
                                src={currentVideoUrl}
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
                            Trong bài học này, chúng ta sẽ cùng tìm hiểu cách thiết kế các Component độc lập, tái sử dụng và cách truyền nhận dữ liệu thông qua Props trong React 19.
=======
                    {/* Video Player Box */}
                    <div className="bg-black rounded-2xl aspect-video overflow-hidden relative shadow-xl flex items-center justify-center border border-[#E2E4EB]">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&controls=${isReviewMode ? 1 : 0}&disablekb=${isReviewMode ? 0 : 1}&fs=${isReviewMode ? 1 : 0}&rel=0&playsinline=1&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                            title={`${lesson.title} - SkillGarden video lesson`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            referrerPolicy="strict-origin-when-cross-origin"
                            ref={videoFrameRef}
                        ></iframe>
                    </div>

                    {/* Lesson Info */}
                    <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-sm space-y-4">
                        <h1 className="text-2xl font-bold text-[#20223A]">
                            {lesson.title}
                        </h1>
                        <p className="text-sm text-[#6B6D7A] leading-relaxed">
                            {lesson.description}
>>>>>>> b774379 (fix FE)
                        </p>

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
                                    <span className="text-xs font-bold text-[#3C4097]">
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
                                                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
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
                                    <Button type="button" variant="outline" size="sm" className="flex items-center gap-1" onClick={handleDownloadMaterial}>
                                        <Download className="w-3.5 h-3.5" /> Tải về
                                    </Button>
                                    <Button type="button" variant={chapterProgress.pdfCompleted ? 'success' : 'indigo'} size="sm" onClick={handleCompletePdf}>
                                        {chapterProgress.pdfCompleted ? 'Đã đọc xong' : 'Đã đọc xong tài liệu'}
                                    </Button>
                                    {chapterProgress.videoCompleted && chapterProgress.pdfCompleted && (
                                        <Link to={`/dashboard/quiz-room/${id}?chapter=${chapterId}`}>
                                            <Button type="button" variant="indigo" size="sm">Làm quiz chặng này</Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Playlist / Syllabus */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-700 shadow-xs space-y-4 h-fit">
                    <h2 className="text-lg font-bold text-[#20223A] dark:text-white">Nội dung khóa học</h2>
                    <div className="space-y-2">
                        {lessons.map((item) => (
                            <Link
                                to={`/dashboard/video-lesson/${id}?lesson=${item.id}`}
                                key={item.id}
                                onClick={() => {
                                    setCurrentLessonId(item.id)
                                    setCurrentVideoUrl(item.videoUrl)
                                    setCurrentLessonTitle(item.title)
                                }}
                                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${currentLessonTitle === item.title
                                    ? 'border-[#3C4097] bg-[#F4F5FF] dark:bg-indigo-950/60 dark:border-indigo-400'
                                    : 'border-[#E2E4EB] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-[#6FAF7B] dark:text-emerald-400" />}
                                    {item.status === 'active' && <Play className="w-5 h-5 text-[#3C4097] fill-[#3C4097] dark:text-indigo-400 dark:fill-indigo-400" />}
                                    {item.status === 'locked' && <Lock className="w-5 h-5 text-gray-400" />}
                                    <div>
                                        <p className="text-xs font-bold text-[#20223A] dark:text-white">{item.title}</p>
                                        <span className="text-[11px] text-[#6B6D7A] dark:text-gray-400">{item.duration}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
