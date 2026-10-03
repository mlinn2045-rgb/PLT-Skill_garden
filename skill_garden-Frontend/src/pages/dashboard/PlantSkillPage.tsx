import React, { useState } from 'react'
import { ArrowLeft, Check, Leaf, Sprout } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

import { gardenService } from '../../services/gardenService'

const skills = {
    '1': {
        title: 'Frontend React 19 Mastery',
        category: 'Frontend',
        description: 'Làm chủ React 19, Hooks, State Management, Server Components & Tailwind CSS.',
        plant: 'Cây Hoa Anh Đào',
        icon: '🌸',
        plantId: 1,
    },
    '2': {
        title: 'Backend NestJS & Node.js System',
        category: 'Backend',
        description: 'Xây dựng RESTful API, Microservices, Dependency Injection và Authentication chuẩn enterprise.',
        plant: 'Cây Cổ Thụ',
        icon: '🌳',
        plantId: 2,
    },
    '3': {
        title: 'Database SQL & MySQL Architect',
        category: 'Database',
        description: 'Thiết kế cơ sở dữ liệu quan hệ, viết SQL query phức tạp, tối ưu Index & Transaction.',
        plant: 'Cây Tre Trăm Đốt',
        icon: '🎋',
        plantId: 3,
    },
    '4': {
        title: 'Python & Data Analysis Core',
        category: 'AI/Python',
        description: 'Lập trình Python từ cơ bản đến nâng cao, xử lý dữ liệu với Pandas, NumPy & Matplotlib.',
        plant: 'Cây Xương Rồng Sa Mạc',
        icon: '🌵',
        plantId: 4,
    },
    '5': {
        title: 'Manual & Automation Testing',
        category: 'Testing',
        description: 'Quy trình kiểm thử phần mềm, viết Test Cases và Automation test với Playwright & Jest.',
        plant: 'Cây Thông Bền Bỉ',
        icon: '🌲',
        plantId: 5,
    },
    '6': {
        title: 'Flutter & React Native Mobile',
        category: 'Mobile',
        description: 'Phát triển ứng dụng di động đa nền tảng iOS & Android với UI/UX hiện đại.',
        plant: 'Cây Cảnh Bonsai',
        icon: '🪴',
        plantId: 6,
    },
} as const

const plantChoices = [
    { name: 'Cây Hoa Anh Đào', icon: '🌸', plantId: 1 },
    { name: 'Cây Cổ Thụ', icon: '🌳', plantId: 2 },
    { name: 'Cây Tre Trăm Đốt', icon: '🎋', plantId: 3 },
    { name: 'Cây Xương Rồng Sa Mạc', icon: '🌵', plantId: 4 },
    { name: 'Cây Thông Bền Bỉ', icon: '🌲', plantId: 5 },
    { name: 'Cây Cảnh Bonsai', icon: '🪴', plantId: 6 },
]

export const PlantSkillPage: React.FC = () => {
    const navigate = useNavigate()
    const { id = '1' } = useParams<{ id: string }>()
    const skill = skills[id as keyof typeof skills] ?? skills['1']
    const [plantName, setPlantName] = useState<string>(skill.plant)
    const [selectedPlant, setSelectedPlant] = useState<string>(skill.plant)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setIsSubmitting(true)
        try {
            localStorage.setItem('skillgarden_active_skill_id', String(id))
            localStorage.setItem('skillgarden_active_skill_name', skill.title)

            const saved = localStorage.getItem('skillgarden_planted_skills')
            const planted = saved ? JSON.parse(saved) : []
            if (!planted.includes(String(id))) {
                planted.push(String(id))
                localStorage.setItem('skillgarden_planted_skills', JSON.stringify(planted))
            }

            const chosen = plantChoices.find(p => p.name === selectedPlant)
            const plantId = chosen?.plantId || (skill as any).plantId || Number(id)
            await gardenService.plantSeed(Number(id), plantId, plantName || skill.title)
            window.dispatchEvent(new CustomEvent('skillgarden_tree_planted', { detail: { skillId: id } }))
        } catch (e) {
            console.error('Error planting seed:', e)
        } finally {
            setIsSubmitting(false)
            navigate(`/dashboard/garden`)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-16 pt-6 px-4 md:px-8 max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/skill-catalog')} className="font-bold flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại danh mục kỹ năng
            </Button>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#1B3624] to-[#2D7A4F] p-6 md:p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-4xl">{skill.icon}</div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">{skill.category}</span>
                            <h1 className="text-2xl font-extrabold">Gieo hạt: {skill.title}</h1>
                            <p className="text-sm text-emerald-100 mt-1">{skill.description}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    <div>
                        <h2 className="text-lg font-extrabold flex items-center gap-2"><Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Thiết lập cây kỹ năng</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chọn hạt giống để bắt đầu lộ trình học tập của bạn.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {plantChoices.map(choice => (
                            <button
                                key={choice.name}
                                type="button"
                                onClick={() => setSelectedPlant(choice.name)}
                                className={`p-4 rounded-2xl border text-center transition-colors cursor-pointer ${selectedPlant === choice.name ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:border-emerald-300 dark:hover:border-emerald-500 text-gray-800 dark:text-gray-200'}`}
                            >
                                <span className="text-3xl block">{choice.icon}</span>
                                <span className="text-xs font-bold mt-2 block">{choice.name}</span>
                                {selectedPlant === choice.name && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mt-2" />}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label htmlFor="plant-name" className="text-sm font-bold block mb-2 text-gray-900 dark:text-gray-100">Đặt tên cho cây</label>
                        <Input id="plant-name" required value={plantName} onChange={event => setPlantName(event.target.value)} placeholder="Ví dụ: Cây Testing của tôi" />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                        <Button type="button" variant="outline" onClick={() => navigate('/dashboard/skill-catalog')}>Hủy</Button>
                        <Button type="submit" variant="success" className="font-bold flex items-center gap-2"><Leaf className="w-4 h-4" /> Bắt đầu học skill này</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}