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
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <BookOpen className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Quản Lý Danh Sách Khóa Học
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quản lý danh mục khóa học, trạng thái xuất bản và gán loại cây sinh trưởng.</p>
                </div>
                <Button variant="indigo" className="font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tạo khóa học mới
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-[#E2E4EB] dark:border-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
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
                    <tbody className="divide-y divide-[#E2E4EB] dark:divide-gray-800">
                        {courses.map((c, idx) => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="p-4 font-bold text-gray-600 dark:text-gray-400">{idx + 1}</td>
                                <td className="p-4 font-bold text-gray-900 dark:text-gray-100">{c.title}</td>
                                <td className="p-4"><span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded font-bold">{c.category}</span></td>
                                <td className="p-4 font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><Sprout className="w-4 h-4" /> {c.plant}</td>
                                <td className="p-4 font-bold text-gray-700 dark:text-gray-300">{c.lessons} Bài</td>
                                <td className="p-4">
                                    <button onClick={() => toggleStatus(c.id)} className="flex items-center gap-1.5 font-bold cursor-pointer">
                                        {c.status === 'Published' ? (
                                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full flex items-center gap-1"><ToggleRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Xuất bản</span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full flex items-center gap-1"><ToggleLeft className="w-4 h-4 text-gray-500" /> Nháp</span>
                                        )}
                                    </button>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <Button variant="outline" size="sm" className="font-bold dark:border-gray-700 dark:hover:bg-gray-800"><Edit3 className="w-3.5 h-3.5 mr-1" /> Chỉnh sửa</Button>
                                    <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold"><Trash2 className="w-3.5 h-3.5" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
