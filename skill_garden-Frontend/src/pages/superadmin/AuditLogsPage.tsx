import React, { useState, useEffect } from 'react'
import { ShieldAlert, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { superAdminService, AuditLogItem } from '../../services/superAdminService'

export const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    const fetchLogs = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const res = await superAdminService.getAuditLogs(1, 50)
            setLogs(res.items || [])
        } catch (err: any) {
            setErrorMsg(err.message || 'Không thể tải nhật ký thao tác.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-purple-600" /> Nhật Ký Hoạt Động Hệ Thống (Audit Logs - API Thật)
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">
                        Ghi lại toàn bộ lịch sử thao tác quan trọng của Admin, Super Admin và Daemon từ CSDL MySQL (FR-SA05).
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading} className="font-bold flex items-center gap-1">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại Nhật Ký
                </Button>
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-xs font-bold text-[#6B6D7A] space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                        <p>Đang nạp dữ liệu Nhật ký từ Backend...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#6B6D7A]">
                        Chưa có nhật ký ghi nhận thao tác nào.
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-[#E2E4EB] text-[#6B6D7A] uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-4">STT</th>
                                <th className="p-4">Người Thực Hiện</th>
                                <th className="p-4">Hành Động</th>
                                <th className="p-4">Đối Tượng Tác Động</th>
                                <th className="p-4">Thời Gian</th>
                                <th className="p-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E4EB]">
                            {logs.map((log, idx) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold">{idx + 1}</td>
                                    <td className="p-4">
                                        <div className="font-extrabold text-[#20223A]">{log.full_name || log.username || 'System Admin'}</div>
                                        <div className="text-[11px] text-[#6B6D7A]">{log.role || 'ADMIN'}</div>
                                    </td>
                                    <td className="p-4 font-bold text-purple-800">{log.action}</td>
                                    <td className="p-4 text-[#6B6D7A] font-medium">{log.details || log.target_entity || 'N/A'}</td>
                                    <td className="p-4 font-mono text-[11px]">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                                    <td className="p-4 font-mono text-[11px] text-gray-500">{log.ip_address || '127.0.0.1'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
