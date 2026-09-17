import React, { useState } from 'react'
import { Sprout, Plus, Edit, Trash2, Link } from 'lucide-react'
import { Button } from '../../components/ui/Button'

interface PlantType {
    id: number
    name: string
    icon: string
    category: string
    assignedSkill: string
    stages: string[]
    status: 'ACTIVE' | 'INACTIVE'
}

export const PlantManagementPage: React.FC = () => {
    const [plants, setPlants] = useState<PlantType[]>([
        {
            id: 1,
            name: 'Cây Hoa Anh Đào',
            icon: '🌸',
            category: 'Cây hoa',
            assignedSkill: 'Frontend React 19 Mastery',
            stages: ['Hạt mầm', 'Mầm hồng', 'Cây xòe cành', 'Nụ hoa', 'Nở rực rỡ'],
            status: 'ACTIVE'
        },
        {
            id: 2,
            name: 'Cây Cổ Thụ',
            icon: '🌳',
            category: 'Cây thân gỗ',
            assignedSkill: 'Backend NestJS System',
            stages: ['Hạt sồi', 'Chồi xanh', 'Cây con', 'Thân gỗ vững', 'Cổ thụ bóng mát'],
            status: 'ACTIVE'
        },
        {
            id: 3,
            name: 'Cây Tre Trăm Đốt',
            icon: '🎋',
            category: 'Cây tre',
            assignedSkill: 'Database SQL & Architect',
            stages: ['Măng non', 'Thân măng', 'Tre xanh', 'Khóm tre', 'Rừng tre rậm'],
            status: 'ACTIVE'
        },
        {
            id: 4,
            name: 'Cây Xương Rồng Sa Mạc',
            icon: '🌵',
            category: 'Cây mọng nước',
            assignedSkill: 'Python & Data Analysis',
            stages: ['Mầm gai', 'Cây nhỏ', 'Thân mọng', 'Đơm hoa vàng', 'Xương rồng cổ đại'],
            status: 'ACTIVE'
        }
    ])

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <Sprout className="w-6 h-6 text-emerald-600" /> Quản Lý Loại Cây & Sinh Trưởng Vườn
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Cấu hình hình ảnh, 5 giai đoạn phát triển và gán loại cây đại diện cho từng kỹ năng trong hệ thống.</p>
                </div>
                <Button variant="indigo" className="font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Thêm loại cây mới
                </Button>
            </div>

            {/* Plants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plants.map((plant) => (
                    <div key={plant.id} className="bg-white rounded-2xl p-6 border border-[#E2E4EB] shadow-xs space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl shadow-xs">
                                    {plant.icon}
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-[#6B6D7A] uppercase">{plant.category}</span>
                                    <h3 className="text-base font-extrabold text-[#20223A]">{plant.name}</h3>
                                </div>
                            </div>

                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                                {plant.status}
                            </span>
                        </div>

                        {/* Assigned Skill */}
                        <div className="bg-[#FAFAF7] p-3 rounded-xl border border-[#E2E4EB] flex items-center justify-between text-xs">
                            <span className="font-bold text-[#6B6D7A] flex items-center gap-1.5">
                                <Link className="w-3.5 h-3.5 text-[#3C4097]" /> Kỹ năng gán:
                            </span>
                            <span className="font-extrabold text-[#3C4097]">{plant.assignedSkill}</span>
                        </div>

                        {/* Stages list */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold uppercase text-[#6B6D7A] block">
                                5 GIAI ĐOẠN PHÁT TRIỂN:
                            </label>
                            <div className="grid grid-cols-5 gap-1.5">
                                {plant.stages.map((stg, idx) => (
                                    <div key={idx} className="p-2 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center space-y-1">
                                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold mx-auto flex items-center justify-center">
                                            {idx + 1}
                                        </div>
                                        <div className="text-[10px] font-bold text-emerald-900 truncate" title={stg}>
                                            {stg}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E4EB]">
                            <Button variant="outline" size="sm" className="font-bold">
                                <Edit className="w-3.5 h-3.5 mr-1" /> Chỉnh sửa giai đoạn
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 font-bold">
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
