import React, { useState } from 'react'
import { Award, Plus, Edit, Trash2, Sparkles, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface Achievement {
    id: number
    title: string
    description: string
    icon: string
    condition: string
    xpReward: number
    unlockedCount: number
    status: 'ACTIVE' | 'INACTIVE'
}

export const AchievementManagementPage: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([
        {
            id: 1,
            title: 'Hạt Giống Tri Thức',
            description: 'Hoàn thành bài học đầu tiên trên hệ thống SkillGarden.',
            icon: '🌱',
            condition: 'Hoàn thành 1 bài học bất kỳ',
            xpReward: 50,
            unlockedCount: 142,
            status: 'ACTIVE'
        },
        {
            id: 2,
            title: 'Chiến Sĩ Streak 7 Ngày',
            description: 'Duy trì chuỗi học tập liên tục trong 7 ngày không ngắt quãng.',
            icon: '🔥',
            condition: 'Streak >= 7 ngày',
            xpReward: 150,
            unlockedCount: 89,
            status: 'ACTIVE'
        },
        {
            id: 3,
            title: 'Bậc Thầy Quiz',
            description: 'Đạt điểm tối đa 100% trong một bài kiểm tra Quiz.',
            icon: '🎯',
            condition: 'Đạt 100/100 điểm Quiz',
            xpReward: 100,
            unlockedCount: 64,
            status: 'ACTIVE'
        },
        {
            id: 4,
            title: 'Thu Hoạch Cây Đầu Tiên',
            description: 'Nâng cấp 1 mầm cây kỹ năng đến giai đoạn trưởng thành hoàn chỉnh 100%.',
            icon: '🌸',
            condition: 'Đạt 100% tiến độ 1 Skill',
            xpReward: 300,
            unlockedCount: 35,
            status: 'ACTIVE'
        }
    ])

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <Award className="w-6 h-6 text-yellow-600" /> Quản Lý Thành Tích & Huy Hiệu
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Tạo và điều chỉnh các danh hiệu, quy tắc mở khóa và mức thưởng XP cho học viên.</p>
                </div>
                <Button variant="indigo" className="font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tạo thành tích mới
                </Button>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-[#E2E4EB] text-[#6B6D7A] uppercase tracking-wider font-bold">
                        <tr>
                            <th className="p-4">STT</th>
                            <th className="p-4">Tên Thành Tích</th>
                            <th className="p-4">Điều Kiện Mở Khóa</th>
                            <th className="p-4">XP Thưởng</th>
                            <th className="p-4">Đã Đạt (Học Viên)</th>
                            <th className="p-4">Trạng Thái</th>
                            <th className="p-4 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4EB]">
                        {achievements.map((ach, idx) => (
                            <tr key={ach.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold">{idx + 1}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0">
                                            {ach.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-[#20223A]">{ach.title}</h4>
                                            <p className="text-[11px] text-[#6B6D7A] max-w-xs">{ach.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 font-semibold text-purple-700 bg-purple-50/50 rounded-lg">{ach.condition}</td>
                                <td className="p-4 font-bold text-emerald-700">+{ach.xpReward} XP</td>
                                <td className="p-4 font-bold text-[#3C4097]">{ach.unlockedCount} Học viên</td>
                                <td className="p-4">
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                                        {ach.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <Button variant="outline" size="sm" className="font-bold"><Edit className="w-3.5 h-3.5 mr-1" /> Chỉnh sửa</Button>
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
