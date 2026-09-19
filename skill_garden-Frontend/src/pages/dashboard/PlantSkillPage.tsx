import React, { useState } from 'react'
import { ArrowLeft, Check, Leaf, Sprout } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const skills = {
    '5': {
        title: 'Manual & Automation Testing',
        category: 'Testing',
        description: 'Quy trình kiểm thử phần mềm, viết Test Cases và Automation test với Playwright & Jest.',
        plant: 'Cây Hoa Hướng Dương',
        icon: '🌻',
    },
    '6': {
        title: 'Flutter & React Native Mobile',
        category: 'Mobile',
        description: 'Phát triển ứng dụng di động đa nền tảng iOS & Android với UI/UX hiện đại.',
        plant: 'Cây Dừa Nhiệt Đới',
        icon: '🌴',
    },
} as const

const plantChoices = [
    { name: 'Cây Hoa Hướng Dương', icon: '🌻' },
    { name: 'Cây Dừa Nhiệt Đới', icon: '🌴' },
    { name: 'Cây Tre Trăm Đốt', icon: '🎋' },
]

export const PlantSkillPage: React.FC = () => {
    const navigate = useNavigate()
    const { id = '5' } = useParams<{ id: string }>()
    const skill = skills[id as keyof typeof skills] ?? skills['5']
    const [plantName, setPlantName] = useState<string>(skill.plant)
    const [selectedPlant, setSelectedPlant] = useState<string>(skill.plant)

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        navigate(`/dashboard/learning-path/${id}`)
    }

    return (
        <div className="min-h-screen bg-[#F7F9F7] text-[#1A2E22] pb-16 pt-6 px-4 md:px-8 max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/skill-catalog')} className="font-bold flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại danh mục kỹ năng
            </Button>

            <div className="bg-white rounded-3xl border border-[#E6ECE6] shadow-sm overflow-hidden">
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
                        <h2 className="text-lg font-extrabold flex items-center gap-2"><Sprout className="w-5 h-5 text-emerald-600" /> Thiết lập cây kỹ năng</h2>
                        <p className="text-xs text-[#718096] mt-1">Chọn hạt giống để bắt đầu lộ trình học tập của bạn.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {plantChoices.map(choice => (
                            <button
                                key={choice.name}
                                type="button"
                                onClick={() => setSelectedPlant(choice.name)}
                                className={`p-4 rounded-2xl border text-center transition-colors ${selectedPlant === choice.name ? 'border-emerald-500 bg-emerald-50' : 'border-[#E6ECE6] hover:border-emerald-300'}`}
                            >
                                <span className="text-3xl block">{choice.icon}</span>
                                <span className="text-xs font-bold mt-2 block">{choice.name}</span>
                                {selectedPlant === choice.name && <Check className="w-4 h-4 text-emerald-600 mx-auto mt-2" />}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label htmlFor="plant-name" className="text-sm font-bold block mb-2">Đặt tên cho cây</label>
                        <Input id="plant-name" required value={plantName} onChange={event => setPlantName(event.target.value)} placeholder="Ví dụ: Cây Testing của tôi" />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[#E6ECE6] pt-5">
                        <Button type="button" variant="outline" onClick={() => navigate('/dashboard/skill-catalog')}>Hủy</Button>
                        <Button type="submit" variant="success" className="font-bold flex items-center gap-2"><Leaf className="w-4 h-4" /> Bắt đầu học skill này</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}