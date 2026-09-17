import React from 'react'
import { ShieldCheck, Users, BookOpen, Activity, AlertCircle, TrendingUp, Sparkles, UserCheck, Key, Server } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

export const SuperAdminDashboardPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#FAFAF7] text-[#20223A] pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#1A1C2E] via-[#2A2D4A] to-[#1A1C2E] p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 text-9xl opacity-10 pointer-events-none">
                    👑
                </div>
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-purple-500/20 px-3.5 py-1 rounded-full text-xs font-bold text-purple-300 border border-purple-400/30">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>SUPER ADMIN EXECUTIVE CONSOLE</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        Tổng Quan Hệ Thống SkillGarden 🌐
                    </h1>
                    <p className="text-xs md:text-sm text-gray-300 max-w-2xl leading-relaxed">
                        Bảng điều khiển quản trị tối cao PLT Solutions. Giám sát toàn bộ tài khoản Admin, người dùng, hạ tầng máy chủ và phân quyền hệ thống.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md shrink-0">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                        <div className="text-xs font-extrabold text-white">Hạ Tầng Hoạt Động</div>
                        <div className="text-[11px] text-emerald-300 font-semibold">100% Online • Normal Load</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#6B6D7A]">
                        <span className="text-xs font-bold uppercase">Tổng Người Dùng</span>
                        <Users className="w-5 h-5 text-[#3C4097]" />
                    </div>
                    <div className="text-3xl font-black text-[#20223A]">1,280</div>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> +12% tháng này
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#6B6D7A]">
                        <span className="text-xs font-bold uppercase">Tài Khoản Admin</span>
                        <UserCheck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-3xl font-black text-[#20223A]">8</div>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        Đang hoạt động
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#6B6D7A]">
                        <span className="text-xs font-bold uppercase">Khóa Học & Skill</span>
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-black text-[#20223A]">6</div>
                    <span className="text-[11px] font-bold text-[#6B6D7A]">
                        48 Bài học video & Quiz
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#6B6D7A]">
                        <span className="text-xs font-bold uppercase">Hoạt Động Hệ Thống</span>
                        <Activity className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-3xl font-black text-[#20223A]">99.9%</div>
                    <span className="text-[11px] font-bold text-emerald-600">
                        Uptime ổn định
                    </span>
                </div>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: System Alerts & Admin Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-4">
                        <h2 className="text-base font-extrabold text-[#20223A] flex items-center gap-2">
                            <Key className="w-5 h-5 text-purple-600" /> Danh Sách Ban Quản Trị (Admin)
                        </h2>

                        <div className="space-y-3">
                            {[
                                { name: 'Admin Đăng Ký System', email: 'admin@pltsolutions.com', role: 'Full Admin', lastActive: '5 phút trước', status: 'ACTIVE' },
                                { name: 'Admin Nội Dung LMS', email: 'lms.admin@pltsolutions.com', role: 'Content Admin', lastActive: '1 giờ trước', status: 'ACTIVE' },
                                { name: 'Admin Kiểm Thử Quiz', email: 'qa.admin@pltsolutions.com', role: 'Quiz Admin', lastActive: '3 giờ trước', status: 'ACTIVE' }
                            ].map((adm, idx) => (
                                <div key={idx} className="p-4 bg-[#FAFAF7] border border-[#E2E4EB] rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-extrabold flex items-center justify-center text-sm border border-purple-300">
                                            {adm.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-extrabold text-[#20223A]">{adm.name}</h4>
                                            <p className="text-[11px] text-[#6B6D7A]">{adm.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-bold">
                                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md">{adm.role}</span>
                                        <span className="text-emerald-700 font-extrabold text-[11px]">{adm.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col: System Status */}
                <div className="bg-white p-6 rounded-2xl border border-[#E2E4EB] shadow-xs space-y-4">
                    <h2 className="text-base font-extrabold text-[#20223A] flex items-center gap-2">
                        <Server className="w-5 h-5 text-[#3C4097]" /> Thông Số Máy Chủ MySQL & API
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-[#6B6D7A] font-bold">Database Name</span>
                            <span className="font-mono font-extrabold text-[#20223A]">skill_garden</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-[#6B6D7A] font-bold">PHP Environment</span>
                            <span className="font-mono font-extrabold text-[#20223A]">PHP 8.2 (Laragon)</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-[#6B6D7A] font-bold">Frontend Stack</span>
                            <span className="font-mono font-extrabold text-[#20223A]">React 19 + Vite</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-[#6B6D7A] font-bold">Security Standard</span>
                            <span className="font-mono font-extrabold text-emerald-700">AES-256 / Password Hash</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
