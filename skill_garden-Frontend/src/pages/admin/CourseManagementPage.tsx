import React, { useState } from 'react'
import { BookOpen, Plus, Search, Edit3, Trash2, Sprout, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export const CourseManagementPage: React.FC = () => {
    const [courses, setCourses] = useState([
        { id: 1, title: 'Frontend React 19 Mastery', category: 'Frontend', plant: 'Cây Hoa Anh Đào', lessons: 12, status: 'Published' },
        { id: 2, title: 'Backend NestJS & Node.js System', category: 'Backend', plant: 'Cây Cổ Thụ', lessons: 18, status: 'Published' },
        { id: 3, title: 'Database SQL & MySQL Architect', category: 'Database', plant: 'Cây Tre', lessons: 10, status: 'Published' },
        { id: 4, title: 'Python & Data Analysis Core', category: 'AI/Python', plant: 'Cây Xương Rồng', lessons: 8, status: 'Draft' }
    ])

    const toggleStatus = (id: number) => {
        setCourses(courses.map(c => c.id === id ? { ...c, status: c.status === 'Published' ? 'Draft' : 'Published' } : c))
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#3C4097]" /> Quản Lý Danh Sách Khóa Học
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Quản lý danh mục khóa học, trạng thái xuất bản và gán loại cây sinh trưởng.</p>
                </div>
                <Button variant="indigo" className="font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tạo khóa học mới
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-[#E2E4EB] text-[#6B6D7A] uppercase tracking-wider font-bold">
                        <tr>
                            <th className="p-4">STT</th>
                            <th className="p-4">Tên Khóa Học</th>
                            <th className="p-4">Danh Mục</th>
                            <th className="p-4">Loại Cây Gán</th>
                            <th className="p-4">Số Bài Học</th>
                            <th className="p-4">Trạng Thái</th>
                            <th className="p-4 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4EB]">
                        {courses.map((c, idx) => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold">{idx + 1}</td>
                                <td className="p-4 font-bold text-[#20223A]">{c.title}</td>
                                <td className="p-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">{c.category}</span></td>
                                <td className="p-4 font-semibold text-emerald-700 flex items-center gap-1.5"><Sprout className="w-4 h-4" /> {c.plant}</td>
                                <td className="p-4 font-bold">{c.lessons} Bài</td>
                                <td className="p-4">
                                    <button onClick={() => toggleStatus(c.id)} className="flex items-center gap-1.5 font-bold cursor-pointer">
                                        {c.status === 'Published' ? (
                                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1"><ToggleRight className="w-4 h-4 text-emerald-600" /> Xuất bản</span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-1"><ToggleLeft className="w-4 h-4 text-gray-500" /> Nháp</span>
                                        )}
                                    </button>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <Button variant="outline" size="sm" className="font-bold"><Edit3 className="w-3.5 h-3.5 mr-1" /> Chỉnh sửa</Button>
                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 font-bold"><Trash2 className="w-3.5 h-3.5" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
