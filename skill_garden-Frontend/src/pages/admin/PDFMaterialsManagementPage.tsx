import React, { useState } from 'react'
import { FileText, Upload, Download, Eye, Trash2, Search, Link } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export const PDFMaterialsManagementPage: React.FC = () => {
    const [materials, setMaterials] = useState([
        { id: 1, name: 'Slide_Bai_2_React_Props.pdf', lesson: 'Bài 2: React Components & Props', size: '2.4 MB', date: '15/09/2026' },
        { id: 2, name: 'Tai_Lieu_State_Management_Full.pdf', lesson: 'Bài 4: State với useState Hook', size: '4.1 MB', date: '14/09/2026' }
    ])

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-[#3C4097]" /> Quản Lý Tài Liệu PDF & Tài Nguyên
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Upload và quản lý các tài liệu tham khảo, Slide đính kèm bài học.</p>
                </div>
                <Button variant="indigo" className="font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload Tài liệu PDF mới
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-[#E2E4EB] text-[#6B6D7A] uppercase tracking-wider font-bold">
                        <tr>
                            <th className="p-4">STT</th>
                            <th className="p-4">Tên Tài Liệu</th>
                            <th className="p-4">Bài Học Liên Kết</th>
                            <th className="p-4">Dung Lượng</th>
                            <th className="p-4">Ngày Upload</th>
                            <th className="p-4 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4EB]">
                        {materials.map((m, idx) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold">{idx + 1}</td>
                                <td className="p-4 font-bold text-[#20223A] flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#3C4097]" /> {m.name}
                                </td>
                                <td className="p-4 text-[#6B6D7A]">{m.lesson}</td>
                                <td className="p-4 font-mono font-bold text-[#3C4097]">{m.size}</td>
                                <td className="p-4 text-[#6B6D7A]">{m.date}</td>
                                <td className="p-4 text-right space-x-2">
                                    <Button variant="outline" size="sm" className="font-bold"><Eye className="w-3.5 h-3.5 mr-1" /> Xem trước</Button>
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
