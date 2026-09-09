import React, { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Target,
    GitBranch,
    Sprout,
    CheckSquare,
    Flag,
    Award,
    User,
    Settings,
    Search,
    Flame,
    Zap,
    Bell,
    ChevronDown,
    Menu,
    X
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { PltLogo } from '../components/ui/PltLogo'

export const DashboardLayout: React.FC = () => {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navItems = [
        { label: 'Tổng quan', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Kỹ năng', path: '/dashboard/skill/1', icon: <Target className="w-5 h-5" /> },
        { label: 'Lộ trình học', path: '/dashboard/learning-path/1', icon: <GitBranch className="w-5 h-5" /> },
        { label: 'Khu vườn', path: '/dashboard/garden', icon: <Sprout className="w-5 h-5" /> },
        { label: 'Bài kiểm tra', path: '/dashboard/quiz', icon: <CheckSquare className="w-5 h-5" /> },
        { label: 'Mục tiêu', path: '/dashboard/goals', icon: <Flag className="w-5 h-5" /> },
        { label: 'Thành tích & Huy hiệu', path: '/dashboard/badges', icon: <Award className="w-5 h-5" /> },
    ]

    const bottomNavItems = [
        { label: 'Hồ sơ cá nhân', path: '/dashboard/profile', icon: <User className="w-5 h-5" /> },
        { label: 'Cài đặt', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
    ]

    return (
        <div className="min-h-screen bg-[#FBFDFB] flex text-[#1A2E22] font-sans">

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-white border-r border-[#E6ECE6] flex-col justify-between p-5 sticky top-0 h-screen z-20 shrink-0">
                <div className="space-y-6">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3 px-1 py-1 group hover:opacity-90 transition-opacity">
                        <PltLogo height={38} />
                        <div className="h-7 w-px bg-[#E2E8F0] mx-0.5" />
                        <div>
                            <div className="text-base font-black text-[#1A2E22] tracking-tight leading-none">SkillGarden</div>
                            <div className="text-[10px] font-bold text-[#2F3C96] uppercase tracking-wider leading-none mt-1">PLT Solutions</div>
                        </div>
                    </Link>

                    {/* Navigation links */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${isActive
                                        ? 'bg-[#3F49C8] text-white shadow-sm font-bold'
                                        : 'text-[#4A5568] hover:bg-[#F3F6F3] hover:text-[#1A2E22]'
                                        }`}
                                >
                                    <span className={isActive ? 'text-white' : 'text-[#718096]'}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Nav */}
                <div className="pt-4 border-t border-[#E6ECE6] space-y-1">
                    {bottomNavItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path)
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${isActive
                                    ? 'bg-[#3F49C8] text-white shadow-sm font-bold'
                                    : 'text-[#4A5568] hover:bg-[#F3F6F3] hover:text-[#1A2E22]'
                                    }`}
                            >
                                <span className={isActive ? 'text-white' : 'text-[#718096]'}>{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        )
                    })}
                </div>
            </aside>

            {/* Mobile Drawer Backdrop & Sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 lg:hidden backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Link to="/dashboard" className="flex items-center gap-2">
                                    <PltLogo height={32} />
                                    <div className="h-6 w-px bg-[#E2E8F0] mx-0.5" />
                                    <span className="font-bold text-base text-[#1A2E22]">SkillGarden</span>
                                </Link>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${isActive ? 'bg-[#3F49C8] text-white font-bold' : 'text-[#4A5568] hover:bg-[#F3F6F3]'
                                            }`
                                        }
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-[#E6ECE6] space-y-1">
                            {bottomNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${isActive ? 'bg-[#3F49C8] text-white font-bold' : 'text-[#4A5568] hover:bg-[#F3F6F3]'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Header Bar */}
                <header className="h-16 bg-white border-b border-[#E6ECE6] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10">

                    <div className="flex items-center gap-3 flex-1 max-w-md">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-[#4A5568] hover:bg-[#F3F6F3]"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Global Search Bar */}
                        <div className="relative w-full max-w-sm hidden sm:block">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" />
                            <input
                                type="text"
                                placeholder="Tìm bài học, kỹ năng, quiz..."
                                className="w-full h-9 pl-9 pr-12 rounded-full bg-[#F7FAF7] border border-[#E2E8F0] text-xs text-[#1A2E22] placeholder:text-[#A0AEC0] focus:outline-none focus:bg-white focus:border-[#2D7A4F] transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold font-mono text-[#A0AEC0] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded-md">
                                Ctrl K
                            </span>
                        </div>
                    </div>

                    {/* User Stat Badges & Profile */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Streak Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF5F5] border border-[#FEB2B2] text-[#E53E3E] text-xs font-bold shadow-2xs">
                            <Flame className="w-4 h-4 fill-[#E53E3E]" />
                            <span className="hidden sm:inline">7 Ngày Streak</span>
                            <span className="sm:hidden">7d</span>
                        </div>

                        {/* XP Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shadow-2xs">
                            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                            <span>1.250 XP</span>
                        </div>

                        {/* Level Badge */}
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6FFFA] border border-[#68D391]/40 text-[#2D7A4F] text-xs font-bold">
                            <Sprout className="w-4 h-4" />
                            <span>Cấp 8 (Mầm tri thức)</span>
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-xl text-[#4A5568] hover:bg-[#F3F6F3] transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center gap-2 pl-2 border-l border-[#E6ECE6] cursor-pointer hover:opacity-80 transition-opacity">
                            <Avatar name="Minh Tuấn" levelBadge="8" size="sm" />
                            <div className="hidden md:block text-left">
                                <div className="text-xs font-bold text-[#1A2E22] flex items-center gap-1">
                                    <span>Minh Tuấn</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-[#718096]" />
                                </div>
                            </div>
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>

        </div>
    )
}
