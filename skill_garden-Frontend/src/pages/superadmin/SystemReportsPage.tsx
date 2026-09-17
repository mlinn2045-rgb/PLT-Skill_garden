import React from 'react'
import { BarChart3, TrendingUp, Users, BookOpen, Award, CheckCircle2, PieChart, Calendar } from 'lucide-react'

export const SystemReportsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs">
                <div>
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-purple-600" /> Báo Cáo & Thống Kê Tổng Thể System
                    </h1>
                    <p className="text-xs text-[#6B6D7A] mt-1">Phân tích xu hướng học tập, tỷ lệ hoàn thành bài học và lượng tài khoản đăng ký mới (FR-SA06).</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200 text-xs font-bold">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Tháng 9/2026</span>
                </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-[#6B6D7A] uppercase block">Skill Được Học Nhất</span>
                    <div className="text-xl font-extrabold text-[#20223A]">Frontend React 19 Mastery</div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-pink-500 h-full w-[85%]" />
                    </div>
                    <p className="text-[11px] text-[#6B6D7A]">450 Học viên đang theo học (85%)</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-[#6B6D7A] uppercase block">Tỷ Lệ Đạt Quiz</span>
                    <div className="text-xl font-extrabold text-emerald-700">78.4% Đạt Điểm Chuẩn</div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[78%]" />
                    </div>
                    <p className="text-[11px] text-[#6B6D7A]">Tổng 1,120 lượt nộp bài trắc nghiệm</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-[#6B6D7A] uppercase block">Tổng Cây Đã Thu Hoạch</span>
                    <div className="text-xl font-extrabold text-purple-700">340 Cây Trưởng Thành</div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full w-[65%]" />
                    </div>
                    <p className="text-[11px] text-[#6B6D7A]">Tương ứng 340 Skill hoàn thành 100%</p>
                </div>
            </div>

            {/* Detailed Analytics Rows */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-4">
                <h2 className="text-base font-extrabold text-[#20223A]">Thống Kê Chi Tiết Theo Kỹ Năng</h2>
                <div className="space-y-3 text-xs">
                    {[
                        { title: 'Frontend React 19 Mastery', students: 450, avgXp: 540, completion: '72%' },
                        { title: 'Backend NestJS & Node.js System', students: 380, avgXp: 620, completion: '64%' },
                        { title: 'Database SQL & MySQL Architect', students: 290, avgXp: 480, completion: '81%' },
                        { title: 'Python & Data Analysis Core', students: 160, avgXp: 310, completion: '45%' }
                    ].map((row, idx) => (
                        <div key={idx} className="p-4 bg-[#FAFAF7] border border-[#E2E4EB] rounded-xl flex items-center justify-between">
                            <span className="font-extrabold text-[#20223A] text-sm">{row.title}</span>
                            <div className="flex items-center gap-6 font-bold">
                                <div><span className="text-[#6B6D7A] font-normal block text-[10px]">Học Viên</span> {row.students}</div>
                                <div><span className="text-[#6B6D7A] font-normal block text-[10px]">XP Trung Bình</span> +{row.avgXp}</div>
                                <div className="text-emerald-700"><span className="text-[#6B6D7A] font-normal block text-[10px]">Tỷ Lệ Hoàn Thành</span> {row.completion}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
