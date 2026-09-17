import React, { useState, useEffect } from 'react'
import { FileText, Upload, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { adminService, PdfMaterial } from '../../services/adminService'

export const PDFMaterialsManagementPage: React.FC = () => {
    const [materials, setMaterials] = useState<PdfMaterial[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const [toastMsg, setToastMsg] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [title, setTitle] = useState('')
    const [fileUrl, setFileUrl] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchMaterials = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const data = await adminService.getMaterials()
            setMaterials(data)
        } catch (err: any) {
            setErrorMsg(err.message || 'Không thể tải danh sách tài liệu.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMaterials()
    }, [])

    const showToast = (msg: string) => {
        setToastMsg(msg)
        setTimeout(() => setToastMsg(''), 4000)
    }

    const handleCreateMaterial = async () => {
        if (!title || !fileUrl) {
            alert('Vui lòng điền đầy đủ Tiêu đề và URL file.')
            return
        }
        setIsSubmitting(true)
        try {
            await adminService.createMaterial({
                title,
                file_url: fileUrl,
                file_type: 'pdf',
                file_size_bytes: 2500000,
            })
            showToast('Đã thêm tài liệu PDF mới thành công!')
            setShowModal(false)
            setTitle('')
            setFileUrl('')
            fetchMaterials()
        } catch (err: any) {
            alert(err.message || 'Thêm tài liệu thất bại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return
        try {
            await adminService.deleteMaterial(id)
            showToast('Đã xóa tài liệu thành công.')
            fetchMaterials()
        } catch (err: any) {
            alert(err.message || 'Xóa tài liệu thất bại.')
        }
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-[#3C4097]" /> Quản Lý Tài Liệu PDF & Tài Nguyên (API Thật)
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Upload và quản lý các tài liệu tham khảo, Slide đính kèm từ CSDL MySQL.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchMaterials} disabled={isLoading} className="font-bold flex items-center gap-1">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
                    </Button>
                    <Button variant="indigo" onClick={() => setShowModal(true)} className="font-bold flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Upload Tài liệu PDF mới
                    </Button>
                </div>
            </div>

            {toastMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shadow-sm">
                    {toastMsg}
                </div>
            )}
            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-xs font-bold text-[#6B6D7A] space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#3C4097]" />
                        <p>Đang nạp danh sách tài liệu từ Backend...</p>
                    </div>
                ) : materials.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#6B6D7A]">
                        Chưa có tài liệu PDF nào trong hệ thống.
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-[#E2E4EB] text-[#6B6D7A] uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">STT</th>
                                <th className="p-4">Tên Tài Liệu</th>
                                <th className="p-4">Bài Học Liên Kết</th>
                                <th className="p-4">Đường Dẫn File</th>
                                <th className="p-4">Ngày Upload</th>
                                <th className="p-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E4EB]">
                            {materials.map((m, idx) => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold">{idx + 1}</td>
                                    <td className="p-4 font-bold text-[#20223A] flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-[#3C4097]" /> {m.title}
                                    </td>
                                    <td className="p-4 text-[#6B6D7A]">{m.lesson_title || 'Tất cả bài học'}</td>
                                    <td className="p-4 font-mono text-[#3C4097] truncate max-w-xs">{m.file_url}</td>
                                    <td className="p-4 text-[#6B6D7A]">{m.created_at ? new Date(m.created_at).toLocaleDateString('vi-VN') : 'Vừa tạo'}</td>
                                    <td className="p-4 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(m.id)}
                                            className="text-red-600 border-red-200 hover:bg-red-50 font-bold"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 border border-[#E2E4EB] max-w-md w-full space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Upload className="w-5 h-5 text-[#3C4097]" /> Upload Tài Liệu PDF Mới
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold block mb-1">Tiêu đề tài liệu *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ví dụ: Slide_Bai_1_React_Introduction.pdf"
                                    className="w-full p-2.5 border border-[#E2E4EB] rounded-xl focus:ring-2 focus:ring-[#3C4097] outline-none"
                                />
                            </div>
                            <div>
                                <label className="font-bold block mb-1">Đường dẫn File (URL) *</label>
                                <input
                                    type="text"
                                    value={fileUrl}
                                    onChange={(e) => setFileUrl(e.target.value)}
                                    placeholder="https://example.com/materials/react-slide.pdf"
                                    className="w-full p-2.5 border border-[#E2E4EB] rounded-xl focus:ring-2 focus:ring-[#3C4097] outline-none font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" disabled={isSubmitting} onClick={() => setShowModal(false)}>Hủy</Button>
                            <Button variant="indigo" disabled={isSubmitting} onClick={handleCreateMaterial} className="font-bold">
                                {isSubmitting ? 'Đang lưu...' : 'Thêm tài liệu'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
