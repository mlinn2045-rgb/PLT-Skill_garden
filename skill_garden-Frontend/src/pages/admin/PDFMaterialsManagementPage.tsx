import React, { useState, useEffect } from 'react'
import { FileText, Upload, Trash2, RefreshCw, Edit, Link as LinkIcon, HardDrive, FileUp, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { adminService, PdfMaterial } from '../../services/adminService'
import { apiClient } from '../../services/apiClient'
import { useAuthStore } from '../../stores/authStore'

export const PDFMaterialsManagementPage: React.FC = () => {
    const { user } = useAuthStore()
    const isLmsAdmin = user?.role === 'SUPER_ADMIN' || (user?.role === 'ADMIN' && (
        (user.email || '').toLowerCase().includes('lms') ||
        (user.full_name || '').toLowerCase().includes('lms')
    ))

    const [materials, setMaterials] = useState<PdfMaterial[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const [toastMsg, setToastMsg] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [editingMaterial, setEditingMaterial] = useState<PdfMaterial | null>(null)
    const [title, setTitle] = useState('')
    const [fileUrl, setFileUrl] = useState('')
    const [uploadType, setUploadType] = useState<'URL' | 'FILE'>('URL')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [fileSizeBytes, setFileSizeBytes] = useState<number>(2500000)
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

    const resetModalState = () => {
        setShowModal(false)
        setTitle('')
        setFileUrl('')
        setEditingMaterial(null)
        setUploadType('URL')
        setSelectedFile(null)
        setUploadSuccess(false)
        setIsUploading(false)
        setUploadProgress(0)
        setFileSizeBytes(2500000)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)
            setUploadSuccess(false)
            if (!title) {
                setTitle(file.name)
            }
        }
    }

    const handleUploadLocalPdf = async () => {
        if (!isLmsAdmin) {
            alert('Chỉ tài khoản Admin LMS mới có quyền tải file PDF lên máy chủ!')
            return
        }
        if (!selectedFile) return
        setIsUploading(true)
        setUploadProgress(20)

        try {
            const formData = new FormData()
            formData.append('pdf_file', selectedFile)

            setUploadProgress(50)
            const res: any = await apiClient.post('/admin/upload-pdf.php', formData)

            setUploadProgress(100)
            if (res && res.success && (res.url || res.data?.url)) {
                const pdfUrl = res.url || res.data?.url
                const pdfName = res.original_name || res.data?.original_name || selectedFile.name
                const pdfSize = res.size_bytes || res.data?.size_bytes || selectedFile.size

                setFileUrl(pdfUrl)
                setFileSizeBytes(pdfSize)
                if (!title) {
                    setTitle(pdfName)
                }
                setUploadSuccess(true)
                showToast('Tải file PDF lên máy chủ thành công!')
            } else {
                alert(res?.message || 'Tải file PDF thất bại.')
            }
        } catch (err: any) {
            alert(err.message || 'Lỗi kết nối khi tải file PDF từ máy.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleCreateMaterial = async () => {
        if (!title.trim() || !fileUrl.trim()) {
            alert('Vui lòng điền đầy đủ Tiêu đề và URL file (hoặc upload file từ máy).')
            return
        }
        setIsSubmitting(true)
        try {
            const payload = { title: title.trim(), file_url: fileUrl.trim(), file_type: 'pdf', file_size_bytes: fileSizeBytes }
            if (editingMaterial) {
                await adminService.updateMaterial(editingMaterial.id, payload)
                showToast('Đã cập nhật tài liệu PDF thành công!')
            } else {
                await adminService.createMaterial(payload)
                showToast('Đã thêm tài liệu PDF mới thành công!')
            }
            resetModalState()
            fetchMaterials()
        } catch (err: any) {
            alert(err.message || 'Thêm tài liệu thất bại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (material: PdfMaterial) => {
        setEditingMaterial(material)
        setTitle(material.title)
        setFileUrl(material.file_url)
        setUploadType('URL')
        setShowModal(true)
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
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <FileText className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Quản Lý Tài Liệu PDF & Giáo Trình
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload hoặc liên kết các tài liệu học tập, slide PDF cho học viên tải về.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={fetchMaterials} disabled={isLoading} className="font-bold flex items-center gap-1 dark:border-gray-700 dark:hover:bg-gray-800">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
                    </Button>
                    <Button
                        variant="indigo"
                        onClick={() => {
                            if (!isLmsAdmin) {
                                alert('Chỉ tài khoản Admin LMS mới có quyền upload tài liệu PDF!')
                                return
                            }
                            resetModalState()
                            setShowModal(true)
                        }}
                        disabled={!isLmsAdmin}
                        className={`font-bold flex items-center gap-2 ${!isLmsAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Upload className="w-4 h-4" /> {isLmsAdmin ? 'Upload Tài liệu PDF mới' : '🔒 Cần quyền Admin LMS'}
                    </Button>
                </div>
            </div>

            {!isLmsAdmin && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs">
                    <span className="text-lg">🔒</span>
                    <div>
                        <div className="font-extrabold text-amber-950 dark:text-amber-200 text-sm">Giới hạn phân quyền Admin LMS</div>
                        <p className="mt-0.5 text-amber-800 dark:text-amber-300/90">Chỉ tài khoản Quản trị LMS (LMS Content Admin) mới có quyền Upload và Xóa tài liệu PDF trong hệ thống.</p>
                    </div>
                </div>
            )}

            {toastMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold shadow-sm">
                    {toastMsg}
                </div>
            )}
            {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-xs font-bold text-gray-500 dark:text-gray-400 space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#3C4097] dark:text-indigo-400" />
                        <p>Đang nạp danh sách tài liệu từ Backend...</p>
                    </div>
                ) : materials.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400">
                        Chưa có tài liệu PDF nào trong hệ thống.
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-[#E2E4EB] dark:border-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">STT</th>
                                <th className="p-4">Tên Tài Liệu</th>
                                <th className="p-4">Bài Học Liên Kết</th>
                                <th className="p-4">Đường Dẫn File</th>
                                <th className="p-4">Ngày Upload</th>
                                <th className="p-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E4EB] dark:divide-gray-800">
                            {materials.map((m, idx) => (
                                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 font-bold text-gray-600 dark:text-gray-400">{idx + 1}</td>
                                    <td className="p-4 font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-[#3C4097] dark:text-indigo-400" /> {m.title}
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{m.lesson_title || 'Tất cả bài học'}</td>
                                    <td className="p-4 font-mono text-[#3C4097] dark:text-indigo-400 truncate max-w-xs">{m.file_url}</td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleDateString('vi-VN') : 'Vừa tạo'}</td>
                                    <td className="p-4 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(m)}
                                            className="text-[#3C4097] dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-bold mr-2"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(m.id)}
                                            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold"
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

            {/* Upload / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E2E4EB] dark:border-gray-800 max-w-lg w-full space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Upload className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" /> {editingMaterial ? 'Sửa Tài Liệu PDF' : 'Upload Tài Liệu PDF Mới'}
                        </h3>

                        {/* Source Type Selector */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <button
                                type="button"
                                onClick={() => setUploadType('URL')}
                                className={`p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${uploadType === 'URL'
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 shadow-xs'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <LinkIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Nhập Đường Dẫn URL
                            </button>

                            <button
                                type="button"
                                onClick={() => setUploadType('FILE')}
                                className={`p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${uploadType === 'FILE'
                                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 shadow-xs'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Tải File Từ Máy Tính
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold block mb-1 text-[#4A5568] dark:text-gray-300">Tiêu đề tài liệu *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ví dụ: Slide_Bai_1_React_Introduction.pdf"
                                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            {uploadType === 'URL' ? (
                                <div>
                                    <label className="font-bold block mb-1 text-[#4A5568] dark:text-gray-300">Đường dẫn File (URL) *</label>
                                    <input
                                        type="text"
                                        value={fileUrl}
                                        onChange={(e) => setFileUrl(e.target.value)}
                                        placeholder="https://example.com/materials/react-slide.pdf"
                                        className="w-full p-2.5 bg-white dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500 outline-none font-mono"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                    <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl p-5 text-center bg-white dark:bg-gray-800/80 space-y-2">
                                        <FileUp className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400" />
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100">Bấm để chọn file PDF từ máy tính</p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Hỗ trợ các file .pdf, .doc, .docx, .ppt (Tối đa 100MB)</p>
                                        </div>

                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="local-pdf-input"
                                        />
                                        <label
                                            htmlFor="local-pdf-input"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors shadow-xs"
                                        >
                                            <Upload className="w-3.5 h-3.5" /> Chọn File PDF
                                        </label>

                                        {selectedFile && (
                                            <div className="pt-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                                <span>Đã chọn: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedFile && !uploadSuccess && (
                                        <Button
                                            type="button"
                                            variant="indigo"
                                            onClick={handleUploadLocalPdf}
                                            disabled={isUploading}
                                            className="w-full font-bold flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 border-none cursor-pointer"
                                        >
                                            {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {isUploading ? `Đang Tải Lên Server (${uploadProgress}%)...` : 'Tải File PDF Lên Máy Chủ'}
                                        </Button>
                                    )}

                                    {uploadSuccess && (
                                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 rounded-lg text-xs font-extrabold flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                                            <span className="truncate">Đã upload lên Server: {fileUrl}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E4EB] dark:border-gray-800">
                            <Button variant="outline" disabled={isSubmitting} onClick={resetModalState} className="dark:border-gray-700 dark:hover:bg-gray-800">Hủy</Button>
                            <Button variant="indigo" disabled={Boolean(isSubmitting || (uploadType === 'FILE' && selectedFile !== null && !uploadSuccess && !fileUrl))} onClick={handleCreateMaterial} className="font-bold">
                                {isSubmitting ? 'Đang lưu...' : editingMaterial ? 'Lưu thay đổi' : 'Thêm tài liệu'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
