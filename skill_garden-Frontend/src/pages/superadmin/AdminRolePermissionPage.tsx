import React, { useState } from 'react'
import { Key, Shield, Check, X, ToggleLeft, ToggleRight, Save } from 'lucide-react'
import { Button } from '../../components/ui/Button'

interface AdminPermissionRow {
    adminName: string
    role: string
    manageUsers: boolean
    manageSkills: boolean
    manageLessons: boolean
    manageQuizzes: boolean
    manageAchievements: boolean
    systemConfig: boolean
}

export const AdminRolePermissionPage: React.FC = () => {
    const [permissions, setPermissions] = useState<AdminPermissionRow[]>([
        {
            adminName: 'admin_master (Full Admin)',
            role: 'Super Admin / Master',
            manageUsers: true,
            manageSkills: true,
            manageLessons: true,
            manageQuizzes: true,
            manageAchievements: true,
            systemConfig: true
        },
        {
            adminName: 'lms_editor (Content Admin)',
            role: 'Content Editor',
            manageUsers: false,
            manageSkills: true,
            manageLessons: true,
            manageQuizzes: false,
            manageAchievements: false,
            systemConfig: false
        },
        {
            adminName: 'qa_reviewer (Quiz Admin)',
            role: 'Quiz & QA Evaluator',
            manageUsers: false,
            manageSkills: false,
            manageLessons: false,
            manageQuizzes: true,
            manageAchievements: true,
            systemConfig: false
        }
    ])

    const togglePermission = (index: number, key: keyof AdminPermissionRow) => {
        setPermissions(prev => prev.map((row, idx) => {
            if (idx === index) {
                return { ...row, [key]: !row[key] }
            }
            return row
        }))
    }

    const handleSave = () => {
        alert('Đã lưu cấu hình Phân Quyền Admin thành công!')
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Phân Quyền Chi Tiết Cho Admin
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cấp hoặc thu hồi các quyền quản lý thành phần hệ thống theo đúng Ma trận Phân quyền (FR-SA03).</p>
                </div>
                <Button variant="indigo" onClick={handleSave} className="font-bold flex items-center gap-2 bg-purple-700 hover:bg-purple-800 border-none">
                    <Save className="w-4 h-4" /> Lưu Ma Trận Phân Quyền
                </Button>
            </div>

            {/* Permission Matrix Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-[#E2E4EB] dark:border-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                        <tr>
                            <th className="p-4">Tài Khoản Admin</th>
                            <th className="p-4 text-center">Quản Lý User</th>
                            <th className="p-4 text-center">Quản Lý Skill</th>
                            <th className="p-4 text-center">Quản Lý Bài Học</th>
                            <th className="p-4 text-center">Quản Lý Quiz</th>
                            <th className="p-4 text-center">Thành Tích</th>
                            <th className="p-4 text-center">Cấu Hình System</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4EB] dark:divide-gray-800">
                        {permissions.map((p, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="p-4">
                                    <div className="font-extrabold text-gray-900 dark:text-gray-100">{p.adminName}</div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{p.role}</div>
                                </td>

                                {(['manageUsers', 'manageSkills', 'manageLessons', 'manageQuizzes', 'manageAchievements', 'systemConfig'] as const).map(key => (
                                    <td key={key} className="p-4 text-center">
                                        <button
                                            onClick={() => togglePermission(idx, key)}
                                            className="inline-flex items-center justify-center cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            {p[key] ? (
                                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded font-bold text-[11px] flex items-center gap-1">
                                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Cấp Quyền
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded font-bold text-[11px] flex items-center gap-1">
                                                    <X className="w-3.5 h-3.5 text-gray-400" /> Khóa Quyền
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
