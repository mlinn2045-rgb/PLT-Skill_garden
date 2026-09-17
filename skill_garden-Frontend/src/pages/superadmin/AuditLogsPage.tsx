import React, { useState } from 'react'
import { ShieldAlert, Search, Filter, Clock, User, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'

interface AuditLogItem {
    id: number
    actor: string
    actorRole: string
    action: string
    target: string
    timestamp: string
    ipAddress: string
    severity: 'INFO' | 'WARNING' | 'CRITICAL'
}

export const AuditLogsPage: React.FC = () => {
    const [search, setSearch] = useState('')

    const logs: AuditLogItem[] = [
        {
            id: 1,
            actor: 'admin_master',
            actorRole: 'Super Admin',
            action: 'Phê duyệt tài khoản User',
            target: 'user_khoa@pltsolutions.com',
            timestamp: '16/09/2026 14:22:10',
            ipAddress: '192.168.1.15',
            severity: 'INFO'
        },
        {
            id: 2,
            actor: 'lms_editor',
            actorRole: 'Content Admin',
            action: 'Cập nhật nội dung Bài học Video',
            target: 'Lesson 03: React 19 Custom Hooks',
            timestamp: '16/09/2026 11:05:40',
            ipAddress: '192.168.1.28',
            severity: 'INFO'
        },
        {
            id: 3,
            actor: 'admin_master',
            actorRole: 'Super Admin',
            action: 'Thay đổi Ma trận Phân quyền Admin',
            target: 'Gán quyền ManageQuizzes cho qa_reviewer',
            timestamp: '15/09/2026 17:45:00',
            ipAddress: '192.168.1.15',
            severity: 'WARNING'
        },
        {
            id: 4,
            actor: 'SYSTEM',
            actorRole: 'System Daemon',
            action: 'Cập nhật tự động Level & Streak',
            target: 'Đã xử lý 1,280 hồ sơ học viên',
            timestamp: '15/09/2026 00:00:00',
            ipAddress: '127.0.0.1',
            severity: 'INFO'
        }
    ]

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-purple-600" /> Nhật Ký Hoạt Động Hệ Thống (Audit Logs)
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Ghi lại toàn bộ lịch sử thao tác quan trọng của Admin, Super Admin và Daemon hệ thống (FR-SA05).</p>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-[#E2E4EB] text-[#6B6D7A] uppercase tracking-wider font-bold">
                        <tr>
                            <th className="p-4">STT</th>
                            <th className="p-4">Người Thực Hiện</th>
                            <th className="p-4">Hành Động</th>
                            <th className="p-4">Đối Tượng Tác Động</th>
                            <th className="p-4">Thời Gian</th>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Mức Độ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4EB]">
                        {logs.map((log, idx) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold">{idx + 1}</td>
                                <td className="p-4">
                                    <div className="font-extrabold text-[#20223A]">{log.actor}</div>
                                    <div className="text-[11px] text-[#6B6D7A]">{log.actorRole}</div>
                                </td>
                                <td className="p-4 font-bold text-purple-800">{log.action}</td>
                                <td className="p-4 text-[#6B6D7A] font-medium">{log.target}</td>
                                <td className="p-4 font-mono text-[11px]">{log.timestamp}</td>
                                <td className="p-4 font-mono text-[11px] text-gray-500">{log.ipAddress}</td>
                                <td className="p-4">
                                    {log.severity === 'INFO' && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded">INFO</span>}
                                    {log.severity === 'WARNING' && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 font-bold rounded">WARNING</span>}
                                    {log.severity === 'CRITICAL' && <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded">CRITICAL</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
