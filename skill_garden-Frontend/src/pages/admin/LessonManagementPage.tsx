import React, { useState } from 'react'
import { Layers, Plus, GripVertical, Video, FileText, HelpCircle, Edit, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export const LessonManagementPage: React.FC = () => {
    const [modules, setModules] = useState([
        {
            id: 1,
            title: 'Chương 1: Core React Concepts',
            lessons: [
                { id: 101, title: 'Bài 1: Giới thiệu React 19 & JSX Syntax', type: 'VIDEO', xp: 50, growth: '5%' },
                { id: 102, title: 'Bài 2: React Components & Props cơ bản', type: 'VIDEO', xp: 50, growth: '5%' },
                { id: 103, title: 'Bài 3: Slide Tài liệu tổng quan Component', type: 'PDF', xp: 20, growth: '2%' }
            ]
        },
        {
            id: 2,
            title: 'Chương 2: State & Lifecycle Management',
            lessons: [
                { id: 201, title: 'Bài 4: State với useState Hook', type: 'VIDEO', xp: 50, growth: '5%' },
                { id: 202, title: 'Bài 5: Quiz Đánh giá State Management', type: 'QUIZ', xp: 100, growth: '15%' }
            ]
        }
    ])

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <Layers className="w-6 h-6 text-[#3C4097]" /> Quản Lý Bài Học Theo Chương
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Khóa học: <span className="font-bold text-[#3C4097]">Frontend React 19 Mastery</span></p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="font-bold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Thêm Chương Mới</Button>
                    <Button variant="indigo" className="font-bold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Tạo Bài Học Mới</Button>
                </div>
            </div>

            <div className="space-y-6">
                {modules.map((m) => (
                    <div key={m.id} className="bg-white rounded-2xl border border-[#E2E4EB] p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
                            <h2 className="text-base font-extrabold text-[#20223A] flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" /> {m.title}
                            </h2>
                            <span className="text-xs font-bold text-[#6B6D7A]">{m.lessons.length} Bài học</span>
                        </div>

                        <div className="space-y-2">
                            {m.lessons.map((l) => (
                                <div key={l.id} className="p-3 bg-[#FAFAF7] border border-[#E2E4EB] rounded-xl flex items-center justify-between hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                        {l.type === 'VIDEO' && <Video className="w-4 h-4 text-blue-600" />}
                                        {l.type === 'PDF' && <FileText className="w-4 h-4 text-emerald-600" />}
                                        {l.type === 'QUIZ' && <HelpCircle className="w-4 h-4 text-purple-600" />}
                                        <span className="text-xs font-bold text-[#20223A]">{l.title}</span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-bold">
                                        <span className="px-2 py-0.5 bg-indigo-50 text-[#3C4097] rounded">+{l.xp} XP</span>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-[#2C6A3D] rounded">+{l.growth} Cây</span>
                                        <div className="space-x-1">
                                            <Button variant="ghost" size="sm"><Edit className="w-3.5 h-3.5" /></Button>
                                            <Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
