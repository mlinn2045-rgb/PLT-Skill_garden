import React, { useEffect, useMemo, useState } from 'react'
import { Layers, Plus, Video, FileText, HelpCircle, Edit, Trash2, RefreshCw, X, Save, Link as LinkIcon, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { courseService, SkillItem } from '../../services/courseService'
import { apiClient } from '../../services/apiClient'
import { useNavigate } from 'react-router-dom'

interface AdminLesson {
    id: string | number
    title: string
    video_url?: string
    videoUrl?: string
    description?: string
    content_type: string
    xp_reward: number
    module_title?: string
    skill_id: number | string
    skill_title: string
    is_published: number
    is_default?: boolean
    is_custom?: boolean
    backendId?: number
}

const DEFAULT_SKILL_LESSONS: Record<string, Array<{ id: number; title: string; videoUrl: string; description: string }>> = {}

const DEFAULT_SKILL_NAMES_MAP: Record<string, string> = {
    '1': 'Frontend React 19 Mastery (Cây Hoa Anh Đào 🌸)',
    '2': 'Backend NestJS & Node.js System (Cây Cổ Thụ 🌳)',
    '3': 'Database SQL & Architect (Cây Tre Trăm Đốt 🎋)',
    '4': 'Python & Machine Learning (Cây Xương Rồng 🌵)',
    '5': 'Software Testing (Cây Hướng Dương 🌻)',
    '6': 'Flutter & React Native Mobile (Cây Dừa 🌴)',
}

const getSkillDisplayName = (skillId: string | number, apiSkills: SkillItem[] = []): string => {
    const sIdStr = String(skillId)
    const foundApi = apiSkills.find(s => String(s.id) === sIdStr)
    if (foundApi && foundApi.title && !foundApi.title.toLowerCase().startsWith('skill #')) {
        return foundApi.title
    }
    return DEFAULT_SKILL_NAMES_MAP[sIdStr] || `Kỹ Năng Kỹ Thuật #${sIdStr}`
}

export const LessonManagementPage: React.FC = () => {
    const navigate = useNavigate()
    const [skills, setSkills] = useState<SkillItem[]>([])
    const [selectedSkillId, setSelectedSkillId] = useState('')
    const [lessons, setLessons] = useState<AdminLesson[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    // Edit Modal State
    const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editVideoUrl, setEditVideoUrl] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editXpReward, setEditXpReward] = useState('50')
    const [isSavingEdit, setIsSavingEdit] = useState(false)

    const cleanLegacyMockData = () => {
        try {
            localStorage.removeItem('skillgarden_custom_lessons')
            localStorage.removeItem('skillgarden_default_lesson_overrides')
        } catch {
            // ignore
        }
    }

    const handleClearMockData = () => {
        if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu bài học mẫu để bắt đầu tự thêm bài học mới?')) return
        cleanLegacyMockData()
        window.dispatchEvent(new Event('skillgarden_lessons_updated'))
        void loadAllLessons()
        setSuccessMsg('🧹 Đã xóa toàn bộ dữ liệu bài học mẫu thành công! Bạn có thể bắt đầu tự thêm bài học mới.')
        setTimeout(() => setSuccessMsg(''), 5000)
    }

    const loadAllLessons = async (skillId = selectedSkillId, activeSkills = skills) => {
        cleanLegacyMockData()
        setIsLoading(true)
        setErrorMsg('')
        try {
            // 1. Fetch from backend
            let backendLessons: any[] = []
            try {
                const query = skillId ? `?skill_id=${encodeURIComponent(skillId)}` : ''
                const response = await apiClient.get<any[]>(`/admin/lessons.php${query}`)
                if (Array.isArray(response.data)) {
                    backendLessons = response.data
                }
            } catch {
                // Ignore backend fetch errors to fallback cleanly
            }

            const combined: AdminLesson[] = backendLessons.map((item) => {
                return {
                    id: item.id,
                    backendId: Number(item.id),
                    title: item.title,
                    video_url: item.video_url || item.videoUrl,
                    videoUrl: item.video_url || item.videoUrl,
                    description: item.description,
                    content_type: item.content_type || 'VIDEO',
                    xp_reward: Number(item.xp_reward) || 50,
                    module_title: item.module_title || 'Chương chính',
                    skill_id: item.skill_id,
                    skill_title: item.skill_title && !item.skill_title.toLowerCase().startsWith('skill #')
                        ? item.skill_title
                        : getSkillDisplayName(item.skill_id, activeSkills),
                    is_published: item.is_published ?? 1
                }
            })

            setLessons(combined)
        } catch (error: any) {
            setErrorMsg(error.message || 'Không thể tải danh sách bài học.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        courseService.getSkills().then(res => {
            setSkills(res)
            void loadAllLessons(selectedSkillId, res)
        }).catch(() => {
            setSkills([])
            void loadAllLessons(selectedSkillId, [])
        })
    }, [])

    useEffect(() => {
        void loadAllLessons(selectedSkillId, skills)
    }, [selectedSkillId])

    const availableSkills = useMemo(() => {
        const mergedMap = new Map<string, string>()

        Object.entries(DEFAULT_SKILL_NAMES_MAP).forEach(([id, name]) => {
            mergedMap.set(id, name)
        })

        skills.forEach(s => {
            if (s.title && !s.title.toLowerCase().startsWith('skill #')) {
                mergedMap.set(String(s.id), s.title)
            }
        })

        return Array.from(mergedMap.entries()).map(([id, title]) => ({ id, title }))
    }, [skills])

    const groupedLessons = useMemo(() => lessons.reduce<Record<string, AdminLesson[]>>((groups, lesson) => {
        const key = lesson.skill_title || getSkillDisplayName(lesson.skill_id, skills)
        groups[key] = groups[key] || []
        groups[key].push(lesson)
        return groups
    }, {}), [lessons, skills])

    const handleDelete = async (lesson: AdminLesson) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa bài học "${lesson.title}"?`)) return
        try {
            if (lesson.backendId) {
                await apiClient.delete(`/admin/lessons.php?id=${lesson.backendId}`)
            }
            window.dispatchEvent(new Event('skillgarden_lessons_updated'))
            await loadAllLessons()
            setSuccessMsg(`🎉 Đã xóa bài học "${lesson.title}" thành công!`)
            setTimeout(() => setSuccessMsg(''), 4000)
        } catch (error: any) {
            alert(error.message || 'Không thể xóa bài học.')
        }
    }

    const handleOpenEdit = (lesson: AdminLesson) => {
        setEditingLesson(lesson)
        setEditTitle(lesson.title || '')
        setEditVideoUrl(lesson.video_url || lesson.videoUrl || '')
        setEditDescription(lesson.description || '')
        setEditXpReward(String(lesson.xp_reward || 50))
    }

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingLesson) return
        if (!editTitle.trim()) {
            alert('Vui lòng nhập tên bài học!')
            return
        }
        if (!editVideoUrl.trim()) {
            alert('Vui lòng nhập đường dẫn video!')
            return
        }

        setIsSavingEdit(true)
        try {
            const updatedTitle = editTitle.trim()
            let updatedVideoUrl = editVideoUrl.trim()
            const updatedDesc = editDescription.trim()
            const updatedXp = Number(editXpReward) || 50

            // Extract YouTube ID if it is a YouTube link (watch, youtu.be, shorts, embed, live)
            const watchMatch = updatedVideoUrl.match(/[?&]v=([^&]+)/i) || updatedVideoUrl.match(/youtu\.be\/([^?&]+)/i) || updatedVideoUrl.match(/\/shorts\/([^?&]+)/i) || updatedVideoUrl.match(/\/embed\/([^?&]+)/i)
            if (watchMatch?.[1]) {
                updatedVideoUrl = `https://www.youtube.com/embed/${watchMatch[1]}`
            }

            // Update lesson via backend API (MySQL is the single source of truth)
            if (editingLesson.backendId) {
                await apiClient.patch('/admin/lessons.php', {
                    id: editingLesson.backendId,
                    title: updatedTitle,
                    video_url: updatedVideoUrl,
                    description: updatedDesc,
                    xp_reward: updatedXp
                })
            }

            // Clean any legacy localStorage data
            cleanLegacyMockData()

            window.dispatchEvent(new Event('skillgarden_lessons_updated'))
            setEditingLesson(null)
            await loadAllLessons()
            setSuccessMsg(`🎉 Đã cập nhật bài học "${updatedTitle}" thành công! Dữ liệu đã đồng bộ sang học viên.`)
            setTimeout(() => setSuccessMsg(''), 5000)
        } catch (err: any) {
            alert(err.message || 'Không thể lưu thay đổi bài học.')
        } finally {
            setIsSavingEdit(false)
        }
    }

    const typeIcon = (type: string) => type === 'PDF'
        ? <FileText className="w-4 h-4 text-emerald-600" />
        : type === 'QUIZ'
            ? <HelpCircle className="w-4 h-4 text-purple-600" />
            : <Video className="w-4 h-4 text-blue-600" />

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Layers className="w-6 h-6 text-[#3C4097] dark:text-indigo-400" /> Quản Lý Bài Học Theo Skill & Chỉnh Sửa Video
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Xem danh sách bài học thuộc từng Skill, chỉnh sửa Tên bài học và Link Video trực tiếp để cập nhật sang học viên.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleClearMockData} className="font-bold text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 cursor-pointer" title="Xóa bỏ toàn bộ bài học mẫu cũ trong bộ nhớ">
                        <Trash2 className="w-4 h-4 text-rose-500" /> Xóa Dữ Liệu Mẫu
                    </Button>
                    <Button variant="outline" onClick={() => void loadAllLessons()} disabled={isLoading} className="font-bold flex items-center gap-1.5 cursor-pointer dark:border-gray-700 dark:hover:bg-gray-800">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
                    </Button>
                    <Button variant="indigo" onClick={() => navigate('/dashboard/admin/create-video-lesson')} className="font-bold flex items-center gap-1.5 cursor-pointer">
                        <Plus className="w-4 h-4" /> Tạo Bài Học Mới
                    </Button>
                </div>
            </div>

            {/* Filter by Skill */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:max-w-md">
                    <label htmlFor="lesson-skill-filter" className="text-xs font-extrabold text-[#4A5568] dark:text-gray-300 shrink-0">LỌC THEO SKILL</label>
                    <select
                        id="lesson-skill-filter"
                        value={selectedSkillId}
                        onChange={(event) => setSelectedSkillId(event.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E4EB] dark:border-gray-700 bg-[#FAFAF7] dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-bold outline-none focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500"
                    >
                        <option value="">🎯 Tất cả Kỹ Năng ({availableSkills.length} Kỹ Năng)</option>
                        {availableSkills.map((skill) => (
                            <option key={skill.id} value={skill.id}>{skill.title}</option>
                        ))}
                    </select>
                </div>
                <span className="text-xs font-extrabold text-[#3C4097] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                    Tổng số: {lessons.length} bài học
                </span>
            </div>

            {/* Notifications */}
            {successMsg && (
                <div className="p-4 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 rounded-2xl text-xs font-black flex items-center gap-2 animate-fade-in shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            {/* Content List */}
            {isLoading ? (
                <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
                    Đang tải danh sách bài học...
                </div>
            ) : Object.keys(groupedLessons).length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                    Chưa có bài học nào thuộc skill này.
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedLessons).map(([skillTitle, skillLessons]) => (
                        <section key={skillTitle} className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-[#E2E4EB] dark:border-gray-800 pb-3">
                                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {skillTitle}
                                </h2>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-md">
                                    {skillLessons.length} bài học
                                </span>
                            </div>

                            <div className="space-y-3">
                                {skillLessons.map((lesson) => {
                                    const vUrl = lesson.video_url || lesson.videoUrl || ''
                                    return (
                                        <div
                                            key={lesson.id}
                                            className="p-4 bg-[#FAFAF7] dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700/70 hover:border-indigo-200 dark:hover:border-indigo-500/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-2xs"
                                        >
                                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg shrink-0 mt-0.5">
                                                    {typeIcon(lesson.content_type)}
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 truncate">
                                                            {lesson.title}
                                                        </p>
                                                        {lesson.is_default && (
                                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 rounded">
                                                                Bài học mặc định
                                                            </span>
                                                        )}
                                                        {lesson.is_custom && (
                                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded">
                                                                Admin Đã Thêm
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                        {lesson.description || 'Chưa có mô tả chi tiết cho bài học này.'}
                                                    </p>

                                                    {vUrl && (
                                                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                                                            <a
                                                                href={vUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:underline truncate max-w-md inline-flex items-center gap-1"
                                                            >
                                                                <span>{vUrl}</span>
                                                                <ExternalLink className="w-3 h-3 shrink-0" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-gray-200 dark:border-gray-700">
                                                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-[#3C4097] dark:text-indigo-300 rounded-lg text-xs font-black border border-indigo-100 dark:border-indigo-900">
                                                    +{lesson.xp_reward} XP
                                                </span>

                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(lesson)}
                                                        className="font-extrabold text-xs flex items-center gap-1.5 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 cursor-pointer"
                                                        title="Sửa Tên & Link Video"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" /> Sửa bài học
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => void handleDelete(lesson)}
                                                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 cursor-pointer"
                                                        title="Xóa bài học"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {/* EDIT LESSON MODAL */}
            {editingLesson && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 border border-[#E2E4EB] dark:border-gray-800 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-[#E2E4EB] dark:border-gray-800 pb-4">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Edit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Chỉnh Sửa Tên & Link Video Bài Học
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditingLesson(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 p-3 rounded-xl flex items-center justify-between text-xs font-extrabold text-indigo-950 dark:text-indigo-200">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Kỹ năng thuộc bài học:
                                </span>
                                <span className="bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-black shadow-2xs">
                                    {editingLesson.skill_title}
                                </span>
                            </div>

                            <Input
                                label="TÊN BÀI HỌC"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Nhập tên bài học..."
                                required
                            />

                            <Input
                                label="ĐƯỜNG DẪN VIDEO / LINK YOUTUBE (URL)"
                                value={editVideoUrl}
                                onChange={(e) => setEditVideoUrl(e.target.value)}
                                placeholder="https://www.youtube.com/embed/... hoặc link local video"
                                iconRight={<LinkIcon className="w-4 h-4 text-indigo-500" />}
                                required
                            />

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-gray-300 block mb-1">
                                    MÔ TẢ BÀI HỌC
                                </label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Mô tả nội dung bài học..."
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-[#E2E4EB] dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3C4097] dark:focus:ring-indigo-500"
                                />
                            </div>

                            <Input
                                label="XP THƯỞNG KHI HOÀN THÀNH"
                                type="number"
                                value={editXpReward}
                                onChange={(e) => setEditXpReward(e.target.value)}
                            />

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E4EB] dark:border-gray-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingLesson(null)}
                                    className="font-bold cursor-pointer dark:border-gray-700 dark:hover:bg-gray-800"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="indigo"
                                    disabled={isSavingEdit}
                                    className="font-bold flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 cursor-pointer"
                                >
                                    {isSavingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Lưu Thay Đổi</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
