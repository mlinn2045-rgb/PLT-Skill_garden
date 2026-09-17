import React, { useState } from 'react'
import { Play, CheckCircle2, FileText, Download, Bookmark, Award, ChevronRight, Lock } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export const VideoLearningPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'notes' | 'materials'>('notes')
    const [noteText, setNoteText] = useState('')
    const [notesList, setNotesList] = useState([
        { id: 1, time: '02:45', content: 'Cần lưu ý cơ chế Virtual DOM của React giúp tối ưu render.' },
        { id: 2, time: '05:10', content: 'Hàm useState trả về 1 tuple gồm state và hàm setState.' }
    ])

    const handleAddNote = () => {
        if (!noteText.trim()) return
        setNotesList([...notesList, { id: Date.now(), time: '06:30', content: noteText }])
        setNoteText('')
    }

    const lessons = [
        { id: 1, title: '1. Giới thiệu tổng quan React 19 & JSX Syntax', duration: '12:45', status: 'completed' },
        { id: 2, title: '2. React Components & Props cơ bản', duration: '18:20', status: 'active' },
        { id: 3, title: '3. State Management với useState & useReducer', duration: '25:15', status: 'locked' },
        { id: 4, title: '4. Side Effects & Lifecycle với useEffect Hook', duration: '20:00', status: 'locked' }
    ]

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12">
            {/* Header breadcrumb */}
            <div className="bg-white border-b border-[#E2E4EB] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#6B6D7A]">
                    <span>Khóa học Frontend React</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Chương 1: Core Concepts</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-bold text-[#3C4097]">Bài 2: React Components & Props</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#DCEFE1] text-[#2C6A3D] text-xs font-bold rounded-full">
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
                    {/* Video Player Box */}
                    <div className="bg-black rounded-2xl aspect-video overflow-hidden relative shadow-xl flex items-center justify-center border border-[#E2E4EB]">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
                            title="React 19 Video Lesson"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* Lesson Info */}
                    <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-sm space-y-4">
                        <h1 className="text-2xl font-bold text-[#20223A]">
                            Bài 2: React Components & Props cơ bản
                        </h1>
                        <p className="text-sm text-[#6B6D7A] leading-relaxed">
                            Trong bài học này, chúng ta sẽ cùng tìm hiểu cách thiết kế các Component độc lập, tái sử dụng và cách truyền nhận dữ liệu thông qua Props trong React 19.
                        </p>

                        {/* Tabs */}
                        <div className="flex border-b border-[#E2E4EB] pt-2">
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'notes'
                                        ? 'border-[#3C4097] text-[#3C4097]'
                                        : 'border-transparent text-[#6B6D7A] hover:text-[#20223A]'
                                    }`}
                            >
                                Ghi chú cá nhân ({notesList.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('materials')}
                                className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'materials'
                                        ? 'border-[#3C4097] text-[#3C4097]'
                                        : 'border-transparent text-[#6B6D7A] hover:text-[#20223A]'
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
                                        placeholder="Nhập ghi chú tại thời điểm video này..."
                                        className="flex-1 px-4 py-2 bg-gray-50 border border-[#E2E4EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3C4097]"
                                    />
                                    <Button variant="indigo" onClick={handleAddNote}>Lưu ghi chú</Button>
                                </div>
                                <div className="space-y-2">
                                    {notesList.map((n) => (
                                        <div key={n.id} className="p-3 bg-gray-50 rounded-xl flex items-start justify-between text-xs">
                                            <span className="font-mono bg-[#3C4097] text-white px-2 py-0.5 rounded font-bold">{n.time}</span>
                                            <p className="flex-1 mx-3 text-[#20223A] font-medium">{n.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 pt-2">
                                <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-[#3C4097]" />
                                        <div>
                                            <p className="text-xs font-bold">Slide_Bai_2_React_Props.pdf</p>
                                            <p className="text-[11px] text-[#6B6D7A]">Dung lượng: 2.4 MB</p>
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
                <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-sm space-y-4 h-fit">
                    <h2 className="text-lg font-bold text-[#20223A]">Nội dung khóa học</h2>
                    <div className="space-y-2">
                        {lessons.map((item) => (
                            <div
                                key={item.id}
                                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${item.status === 'active'
                                        ? 'border-[#3C4097] bg-[#F4F5FF]'
                                        : 'border-[#E2E4EB] hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-[#6FAF7B]" />}
                                    {item.status === 'active' && <Play className="w-5 h-5 text-[#3C4097] fill-[#3C4097]" />}
                                    {item.status === 'locked' && <Lock className="w-5 h-5 text-gray-400" />}
                                    <div>
                                        <p className="text-xs font-bold text-[#20223A]">{item.title}</p>
                                        <span className="text-[11px] text-[#6B6D7A]">{item.duration}</span>
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
