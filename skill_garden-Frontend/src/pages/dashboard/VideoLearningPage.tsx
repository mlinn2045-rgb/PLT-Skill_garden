import React, { useState, useEffect } from 'react'
import { Play, CheckCircle2, FileText, Download, ChevronRight, Lock, Video, HardDrive, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useSearchParams } from 'react-router-dom'

interface NoteItem {
    id: number
    time: string
    content: string
}

export const VideoLearningPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const skillId = searchParams.get('skill_id') || '1'

    const [activeTab, setActiveTab] = useState<'notes' | 'materials'>('notes')
    const [noteText, setNoteText] = useState('')

    // Current active lesson state
    const [currentLessonId, setCurrentLessonId] = useState<number>(2)
    const [currentVideoUrl, setCurrentVideoUrl] = useState('http://localhost:8000/uploads/videos/sample.mp4')
    const [currentLessonTitle, setCurrentLessonTitle] = useState('Bài 2: React Components & Props cơ bản')

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
        const newNote = { id: Date.now(), time: '06:30', content: noteText.trim() }
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

    const lessons = [
        { id: 1, title: '1. Giới thiệu tổng quan React 19 & JSX Syntax', duration: '12:45', status: 'completed', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 2, title: '2. React Components & Props cơ bản (File Tải lên)', duration: '18:20', status: 'active', videoUrl: 'http://localhost:8000/uploads/videos/sample.mp4' },
        { id: 3, title: '3. State Management với useState & useReducer', duration: '25:15', status: 'locked', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 4, title: '4. Side Effects & Lifecycle với useEffect Hook', duration: '20:00', status: 'locked', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]

    const isYouTubeUrl = (url: string) => {
        return url.includes('youtube.com') || url.includes('youtu.be')
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] dark:bg-gray-900 text-[#20223A] dark:text-gray-100 pb-12">
            {/* Header breadcrumb */}
            <div className="bg-white dark:bg-gray-800 border-b border-[#E2E4EB] dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#6B6D7A] dark:text-gray-400">
                    <span>Khóa học Frontend React</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Chương 1: Core Concepts</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-bold text-[#3C4097] dark:text-indigo-400">{currentLessonTitle}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#DCEFE1] dark:bg-emerald-950 text-[#2C6A3D] dark:text-emerald-300 text-xs font-bold rounded-full">
                        +50 XP Thưởng
                    </span>
                    <Button variant="indigo" size="sm" className="font-bold">
                        Đánh dấu hoàn thành
                    </Button>
                </div>
            </div>

            {/* Main content grid */}
            <div className="max-w-7xl mx-auto px-6 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Video Player & Tabs */}
                <div className="lg:col-span-2 space-y-6">
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
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <Download className="w-3.5 h-3.5" /> Tải về
                                    </Button>
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
                            <div
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
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
