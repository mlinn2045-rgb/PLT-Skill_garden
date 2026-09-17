import React, { useState, useEffect } from 'react'
import { BarChart3, RefreshCw, Users, BookOpen, Trophy, Sprout } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { superAdminService, SystemReportData } from '../../services/superAdminService'

export const SystemReportsPage: React.FC = () => {
    const [report, setReport] = useState<SystemReportData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    const fetchReports = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const data = await superAdminService.getSystemReports()
            setReport(data)
        } catch (err: any) {
            setErrorMsg(err.message || 'Không thể tải báo cáo thống kê.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [])

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-purple-600" /> Báo Cáo & Thống Kê Tổng Thể System (API Thật)
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Phân tích dữ liệu thời gian thực từ CSDL MySQL (FR-SA06).</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchReports} disabled={isLoading} className="font-bold flex items-center gap-1">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại báo cáo
                </Button>
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            {isLoading ? (
                <div className="p-12 text-center text-xs font-bold text-[#6B6D7A] space-y-2 bg-white rounded-2xl border border-[#E2E4EB]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                    <p>Đang nạp dữ liệu thống kê từ Backend...</p>
                </div>
            ) : report ? (
                <>
                    {/* Metrics Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-3">
                            <span className="text-xs font-bold text-[#6B6D7A] uppercase flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-indigo-600" /> Học Viên Hệ Thống
                            </span>
                            <div className="text-2xl font-extrabold text-[#20223A]">{report.users.total} Người dùng</div>
                            <p className="text-[11px] text-[#6B6D7A]">
                                Active: {report.users.active} | Chờ duyệt: {report.users.pending} | Admin: {report.users.admins}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-3">
                            <span className="text-xs font-bold text-[#6B6D7A] uppercase flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-emerald-600" /> Học Tập LMS
                            </span>
                            <div className="text-2xl font-extrabold text-emerald-700">{report.learning.total_skills} Kỹ năng</div>
                            <p className="text-[11px] text-[#6B6D7A]">
                                Tổng {report.learning.total_lessons} bài học | {report.learning.completed_lessons} lượt hoàn thành
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-3">
                            <span className="text-xs font-bold text-[#6B6D7A] uppercase flex items-center gap-1.5">
                                <Trophy className="w-4 h-4 text-amber-500" /> Tỷ Lệ Đạt Quiz
                            </span>
                            <div className="text-2xl font-extrabold text-amber-600">{report.quizzes.pass_rate_percent}%</div>
                            <p className="text-[11px] text-[#6B6D7A]">
                                {report.quizzes.passed_attempts} / {report.quizzes.total_attempts} lượt thi đạt chuẩn
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-3">
                            <span className="text-xs font-bold text-[#6B6D7A] uppercase flex items-center gap-1.5">
                                <Sprout className="w-4 h-4 text-purple-600" /> Cây Thu Hoạch
                            </span>
                            <div className="text-2xl font-extrabold text-purple-700">{report.garden.mature_trees} Cây cổ thụ</div>
                            <p className="text-[11px] text-[#6B6D7A]">
                                Trên tổng số {report.garden.total_trees} mầm cây đang sinh trưởng
                            </p>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    )
}
