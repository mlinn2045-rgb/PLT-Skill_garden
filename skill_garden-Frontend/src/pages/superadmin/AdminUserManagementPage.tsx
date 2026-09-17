import React, { useState } from 'react'
import { ShieldCheck, Plus, UserPlus, Lock, Unlock, Edit, Trash2, Key, Search } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface AdminUser {
    id: number
    username: string
    tagId: string
    email: string
    role: string
    permissionsCount: number
    status: 'ACTIVE' | 'LOCKED'
    createdAt: string
}

export const AdminUserManagementPage: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([
        {
            id: 1,
            username: 'admin_master',
            tagId: '#ADM01',
            email: 'admin@pltsolutions.com',
            role: 'Full Admin',
            permissionsCount: 6,
            status: 'ACTIVE',
            createdAt: '01/09/2026'
        },
        {
            id: 2,
            username: 'lms_editor',
            tagId: '#ADM02',
            email: 'lms.admin@pltsolutions.com',
            role: 'Content Admin',
            permissionsCount: 3,
            status: 'ACTIVE',
            createdAt: '05/09/2026'
        },
        {
            id: 3,
            username: 'qa_reviewer',
            tagId: '#ADM03',
            email: 'qa.admin@pltsolutions.com',
            role: 'Quiz Admin',
            permissionsCount: 2,
            status: 'LOCKED',
            createdAt: '10/09/2026'
        }
    ])

    const toggleLock = (id: number) => {
        setAdmins(admins.map(a => a.id === id ? { ...a, status: a.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' } : a))
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-purple-600" /> Quản Lý Tài Khoản Quản Trị Viên (Admin)
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Tạo mới tài khoản Admin, cấp quyền quản lý nội dung và khóa/mở khóa tài khoản.</p>
                </div>
                <Button variant="indigo" className="font-bold flex items-center gap-2 bg-purple-700 hover:bg-purple-800 border-none">
                    <UserPlus className="w-4 h-4" /> Thêm Admin mới
                </Button>
            </div>

            {/* Admin Table */}
            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-[#E2E4EB] text-[#6B6D7A] uppercase tracking-wider font-bold">
                        <tr>
                            <th className="p-4">STT</th>
                            <th className="p-4">Username & Tag</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Vai Trò</th>
                            <th className="p-4">Quyền Hạn Cấp</th>
                            <th className="p-4">Trạng Thái</th>
                            <th className="p-4 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4EB]">
                        {admins.map((adm, idx) => (
                            <tr key={adm.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold">{idx + 1}</td>
                                <td className="p-4 font-bold text-[#20223A]">
                                    {adm.username} <span className="text-[11px] font-normal text-[#6B6D7A]">({adm.tagId})</span>
                                </td>
                                <td className="p-4 font-medium text-gray-600">{adm.email}</td>
                                <td className="p-4"><span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded font-bold">{adm.role}</span></td>
                                <td className="p-4 font-bold text-[#3C4097]">{adm.permissionsCount} Phân quyền</td>
                                <td className="p-4">
                                    <button onClick={() => toggleLock(adm.id)} className="flex items-center gap-1.5 font-bold cursor-pointer">
                                        {adm.status === 'ACTIVE' ? (
                                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1"><Unlock className="w-3.5 h-3.5 text-emerald-600" /> Active</span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-red-600" /> Locked</span>
                                        )}
                                    </button>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <Button variant="outline" size="sm" className="font-bold"><Edit className="w-3.5 h-3.5 mr-1" /> Sửa</Button>
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
