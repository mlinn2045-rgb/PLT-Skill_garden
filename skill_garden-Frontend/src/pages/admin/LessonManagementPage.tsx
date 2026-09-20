import React, { useEffect, useMemo, useState } from 'react'
import { Layers, Plus, Video, FileText, HelpCircle, Edit, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { courseService, SkillItem } from '../../services/courseService'
import { apiClient } from '../../services/apiClient'
import { useNavigate } from 'react-router-dom'

interface AdminLesson {
    id: number
    title: string
    content_type: string
    xp_reward: number
    module_title?: string
    skill_id: number
    skill_title: string
    is_published: number
}

export const LessonManagementPage: React.FC = () => {
    const navigate = useNavigate()
    const [skills, setSkills] = useState<SkillItem[]>([])
    const [selectedSkillId, setSelectedSkillId] = useState('')
    const [lessons, setLessons] = useState<AdminLesson[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    const loadLessons = async (skillId = selectedSkillId) => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const query = skillId ? `?skill_id=${encodeURIComponent(skillId)}` : ''
            const response = await apiClient.get<AdminLesson[]>(`/admin/lessons.php${query}`)
            setLessons(response.data || [])
        } catch (error: any) {
            setErrorMsg(error.message || 'Không thể tải danh sách bài học.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        courseService.getSkills().then(setSkills).catch(() => setSkills([]))
        void loadLessons('')
    }, [])

    const groupedLessons = useMemo(() => lessons.reduce<Record<string, AdminLesson[]>>((groups, lesson) => {
        const key = lesson.skill_title || `Skill #${lesson.skill_id}`
        groups[key] = groups[key] || []
        groups[key].push(lesson)
        return groups
    }, {}), [lessons])

    const handleDelete = async (lesson: AdminLesson) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa bài "${lesson.title}"?`)) return
        try {
            await apiClient.delete(`/admin/lessons.php?id=${lesson.id}`)
            await loadLessons()
        } catch (error: any) {
            alert(error.message || 'Không thể xóa bài học.')
        }
    }

    const typeIcon = (type: string) => type === 'PDF'
        ? <FileText className="w-4 h-4 text-emerald-600" />
        : type === 'QUIZ'
            ? <HelpCircle className="w-4 h-4 text-purple-600" />
            : <Video className="w-4 h-4 text-blue-600" />

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <Layers className="w-6 h-6 text-[#3C4097]" /> Quản Lý Bài Học Theo Skill
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Chọn skill để xem, sửa hoặc xóa bài học thuộc đúng lộ trình.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => void loadLessons()} disabled={isLoading} className="font-bold flex items-center gap-1.5"><RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại</Button>
                    <Button variant="indigo" onClick={() => navigate('/dashboard/admin/create-video-lesson')} className="font-bold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Tạo Bài Học Mới</Button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E4EB] shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
                <label htmlFor="lesson-skill-filter" className="text-xs font-extrabold text-[#4A5568]">LỌC THEO SKILL</label>
                <select id="lesson-skill-filter" value={selectedSkillId} onChange={(event) => { setSelectedSkillId(event.target.value); void loadLessons(event.target.value) }} className="w-full sm:max-w-md px-3 py-2 rounded-xl border border-[#E2E4EB] bg-[#FAFAF7] text-sm font-bold outline-none focus:ring-2 focus:ring-[#3C4097]">
                    <option value="">Tất cả skill</option>
                    {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.title}</option>)}
                </select>
                <span className="text-xs text-[#718096]">{lessons.length} bài học</span>
            </div>

            {errorMsg && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">{errorMsg}</div>}
            {isLoading ? <div className="p-12 text-center bg-white rounded-2xl border border-[#E2E4EB] text-xs font-bold text-[#6B6D7A]">Đang tải bài học...</div> : Object.keys(groupedLessons).length === 0 ? <div className="p-12 text-center bg-white rounded-2xl border border-[#E2E4EB] text-xs text-[#6B6D7A]">Skill này chưa có bài học.</div> : <div className="space-y-6">
                {Object.entries(groupedLessons).map(([skillTitle, skillLessons]) => <section key={skillTitle} className="bg-white rounded-2xl border border-[#E2E4EB] p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3"><h2 className="text-base font-extrabold">{skillTitle}</h2><span className="text-xs font-bold text-[#6B6D7A]">{skillLessons.length} bài học</span></div>
                    <div className="space-y-2">{skillLessons.map((lesson) => <div key={lesson.id} className="p-3 bg-[#FAFAF7] border border-[#E2E4EB] rounded-xl flex items-center justify-between gap-3"><div className="flex items-center gap-3 min-w-0">{typeIcon(lesson.content_type)}<div className="min-w-0"><p className="text-xs font-bold truncate">{lesson.title}</p><p className="text-[11px] text-[#718096]">{lesson.module_title || 'Chưa phân chương'} • {lesson.is_published ? 'Đã xuất bản' : 'Bản nháp'}</p></div></div><div className="flex items-center gap-2 shrink-0"><span className="px-2 py-0.5 bg-indigo-50 text-[#3C4097] rounded text-xs font-bold">+{lesson.xp_reward} XP</span><Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/admin/create-video-lesson?edit=${lesson.id}`)} title="Sửa bài học"><Edit className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => void handleDelete(lesson)} className="text-red-600" title="Xóa bài học"><Trash2 className="w-3.5 h-3.5" /></Button></div></div>)}</div>
                </section>)}
            </div>}
        </div>
    )
}
