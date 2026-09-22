import React from 'react'
import { ShieldCheck, Users, BookOpen, Activity, AlertCircle, TrendingUp, Sparkles, UserCheck, Key, Server } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

export const SuperAdminDashboardPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 pb-12 pt-6 px-6 max-w-7xl mx-auto space-y-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#1A1C2E] via-[#2A2D4A] to-[#1A1C2E] dark:from-gray-900 dark:via-purple-950/40 dark:to-gray-900 border border-transparent dark:border-gray-800 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 text-9xl opacity-10 pointer-events-none">
                    👑
                </div>
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-purple-500/20 px-3.5 py-1 rounded-full text-xs font-bold text-purple-300 border border-purple-400/30">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>SUPER ADMIN EXECUTIVE CONSOLE</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
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
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                        <span className="text-xs font-bold uppercase">Tổng Người Dùng</span>
                        <Users className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" />
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">1,280</div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> +12% tháng này
                    </span>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                        <span className="text-xs font-bold uppercase">Tài Khoản Admin</span>
                        <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">8</div>
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                        Đang hoạt động
                    </span>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                        <span className="text-xs font-bold uppercase">Khóa Học & Skill</span>
                        <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">6</div>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        48 Bài học video & Quiz
                    </span>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                        <span className="text-xs font-bold uppercase">Hoạt Động Hệ Thống</span>
                        <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">99.9%</div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Uptime ổn định
                    </span>
                </div>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: System Alerts & Admin Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-4">
                        <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                            <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Danh Sách Ban Quản Trị (Admin)
                        </h2>

                        <div className="space-y-3">
                            {[
                                { name: 'Admin Đăng Ký System', email: 'admin@pltsolutions.com', role: 'Full Admin', lastActive: '5 phút trước', status: 'ACTIVE' },
                                { name: 'Admin Nội Dung LMS', email: 'lms.admin@pltsolutions.com', role: 'Content Admin', lastActive: '1 giờ trước', status: 'ACTIVE' },
                                { name: 'Admin Kiểm Thử Quiz', email: 'qa.admin@pltsolutions.com', role: 'Quiz Admin', lastActive: '3 giờ trước', status: 'ACTIVE' }
                            ].map((adm, idx) => (
                                <div key={idx} className="p-4 bg-[#FAFAF7] dark:bg-gray-800/60 border border-[#E2E4EB] dark:border-gray-700/70 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-extrabold flex items-center justify-center text-sm border border-purple-300 dark:border-purple-800">
                                            {adm.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-extrabold text-gray-900 dark:text-gray-100">{adm.name}</h4>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">{adm.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-bold">
                                        <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-md">{adm.role}</span>
                                        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-[11px]">{adm.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col: System Status */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[#E2E4EB] dark:border-gray-800 shadow-xs space-y-4">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                        <Server className="w-5 h-5 text-[#3C4097] dark:text-indigo-400" /> Thông Số Máy Chủ MySQL & API
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                            <span className="text-gray-500 dark:text-gray-400 font-bold">Database Name</span>
                            <span className="font-mono font-extrabold text-gray-900 dark:text-white">skill_garden</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                            <span className="text-gray-500 dark:text-gray-400 font-bold">PHP Environment</span>
                            <span className="font-mono font-extrabold text-gray-900 dark:text-white">PHP 8.3 (Docker)</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                            <span className="text-gray-500 dark:text-gray-400 font-bold">Frontend Stack</span>
                            <span className="font-mono font-extrabold text-gray-900 dark:text-white">React 19 + Vite</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                            <span className="text-gray-500 dark:text-gray-400 font-bold">Security Standard</span>
                            <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400">AES-256 / Password Hash</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
