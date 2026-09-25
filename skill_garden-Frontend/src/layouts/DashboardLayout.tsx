import React, { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    GitBranch,
    Sprout,
    CheckSquare,
    Award,
    User,
    Settings,
    Search,
    Flame,
    Zap,
    Bell,
    Menu,
    X,
    ShieldCheck,
    BookOpen,
    Layers,
    Video,
    HelpCircle,
    FileText,
    LogOut,
    Play,
    Moon,
    Sun
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { PltLogo } from '../components/ui/PltLogo'
import { WelcomeRewardModal } from '../components/ui/WelcomeRewardModal'
import { useAuthStore } from '../stores/authStore'
import { getStudentStats } from '../services/studentStats'

export const DashboardLayout: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [dismissedWelcomeModal, setDismissedWelcomeModal] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const { user, logout, isDarkMode, toggleDarkMode } = useAuthStore()
    const studentStats = getStudentStats(user?.email || 'guest')

    const displayXP = user?.total_xp ?? user?.xp ?? studentStats.xp
    const displayStreak = Math.max(user?.streak_days || 1, studentStats.streakDays)

    const notificationsList = [
        { id: '1', title: 'Chào mừng bạn đến với SkillGarden! 🌸', desc: 'Bạn đã nhận 100 XP khởi tạo hành trình.', time: 'Vừa xong', unread: true },
        { id: '2', title: 'Streak Ngày Mới ⚡', desc: 'Đăng nhập liên tục để giữ vững ngọn lửa học tập!', time: 'Hôm nay', unread: true },
        { id: '3', title: 'Hoàn thành bài test 🎯', desc: 'Bạn vừa đạt điểm tuyệt đối 100% bài Quiz.', time: 'Hôm qua', unread: false }
    ]

    const searchableItems = [
        { title: 'Frontend React 19 Mastery', category: 'Kỹ Năng', path: '/dashboard/learning-path/1' },
        { title: 'Backend NestJS & Node.js System', category: 'Kỹ Năng', path: '/dashboard/learning-path/2' },
        { title: 'Database SQL & MySQL Architect', category: 'Kỹ Năng', path: '/dashboard/learning-path/3' },
        { title: 'Bài 1: Tổng quan & Cấu trúc React 19', category: 'Bài Học Video', path: '/dashboard/video-learning?skill_id=1' },
        { title: 'Bài 2: Hooks & Custom Hooks Nâng Cao', category: 'Bài Học Video', path: '/dashboard/video-learning?skill_id=1' },
        { title: 'Phòng Quiz: Kiểm tra React 19 Core', category: 'Quiz', path: '/dashboard/quiz-room/1' },
        { title: 'Mục tiêu & Huy hiệu Học tập', category: 'Trang', path: '/dashboard/goals-badges' },
        { title: 'Khu Vườn Kỹ Năng 3D', category: 'Trang', path: '/dashboard/garden' }
    ]

    const searchResults = searchQuery.trim() === '' ? [] : searchableItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const isSuperAdmin = user?.role === 'SUPER_ADMIN'
    const isAdmin = user?.role === 'ADMIN'
    const isStudent = !isAdmin && !isSuperAdmin

    const showWelcomeModal = !dismissedWelcomeModal && isStudent && user?.has_claimed_welcome_xp === false

    const studentNavItems = [
        { label: 'Tổng quan Vườn', path: '/dashboard', icon: <Sprout className="w-5 h-5 text-emerald-600" /> },
        { label: 'Khu Vườn Kỹ Năng', path: '/dashboard/garden', icon: <Sprout className="w-5 h-5 text-emerald-600" /> },
        { label: 'Danh Mục Kỹ Năng', path: '/dashboard/skill-catalog', icon: <BookOpen className="w-5 h-5 text-blue-600" /> },
        { label: 'Bảng Xếp Hạng', path: '/dashboard/leaderboard', icon: <Award className="w-5 h-5 text-yellow-600" /> },
        { label: 'Lộ trình học tập', path: '/dashboard/learning-path/1', icon: <GitBranch className="w-5 h-5 text-indigo-600" /> },
        { label: 'Bài học Video LMS', path: '/dashboard/video-learning?skill_id=1', icon: <Play className="w-5 h-5 text-red-500" /> },
        { label: 'Phòng làm Quiz', path: '/dashboard/quiz-room/1', icon: <CheckSquare className="w-5 h-5 text-amber-500" /> },
        { label: 'Mục tiêu & Huy hiệu', path: '/dashboard/goals-badges', icon: <Award className="w-5 h-5 text-purple-600" /> },
    ]

    const adminNavItems = [
        { label: 'Duyệt học viên', path: '/dashboard/admin/approvals', icon: <ShieldCheck className="w-5 h-5" /> },
        { label: 'Quản lý khóa học', path: '/dashboard/admin/courses', icon: <BookOpen className="w-5 h-5" /> },
        { label: 'Quản lý bài học', path: '/dashboard/admin/lessons', icon: <Layers className="w-5 h-5" /> },
        { label: 'Tạo bài học & Video', path: '/dashboard/admin/create-video-lesson', icon: <Video className="w-5 h-5" /> },
        { label: 'Ngân hàng Quiz', path: '/dashboard/admin/quiz-bank', icon: <HelpCircle className="w-5 h-5" /> },
        { label: 'Tài liệu PDF', path: '/dashboard/admin/pdf-materials', icon: <FileText className="w-5 h-5" /> },
        { label: 'Quản lý Loại Cây', path: '/dashboard/admin/plants', icon: <Sprout className="w-5 h-5 text-emerald-600" /> },
        { label: 'Quản lý Thành Tích', path: '/dashboard/admin/achievements', icon: <Award className="w-5 h-5 text-yellow-600" /> },
        { label: 'Cấu hình Gamification', path: '/dashboard/admin/gamification', icon: <Settings className="w-5 h-5 text-purple-600" /> },
    ]

    const superAdminNavItems = [
        { label: 'Super Admin Overview', path: '/dashboard/superadmin', icon: <ShieldCheck className="w-5 h-5 text-purple-600" /> },
        { label: 'Quản lý Admin', path: '/dashboard/superadmin/users', icon: <User className="w-5 h-5 text-purple-600" /> },
        { label: 'Phân quyền Admin', path: '/dashboard/superadmin/permissions', icon: <ShieldCheck className="w-5 h-5 text-purple-600" /> },
        { label: 'Báo cáo Hệ thống', path: '/dashboard/superadmin/reports', icon: <BookOpen className="w-5 h-5 text-[#3F49C8]" /> },
        { label: 'Nhật ký Audit Logs', path: '/dashboard/superadmin/audit-logs', icon: <FileText className="w-5 h-5 text-gray-600" /> },
        { label: 'Cấu hình System', path: '/dashboard/superadmin/config', icon: <Settings className="w-5 h-5 text-purple-600" /> },
    ]

    const currentNavItems = isSuperAdmin ? superAdminNavItems : isAdmin ? adminNavItems : studentNavItems

    const bottomNavItems = [
        { label: 'Hồ sơ cá nhân', path: '/dashboard/profile', icon: <User className="w-5 h-5" /> },
        { label: 'Cài đặt', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
    ]

    /**
     * Exact & strict active route detector.
     * Prevents '/dashboard' from staying active when on other pages.
     */
    const isRouteActive = (itemPath: string) => {
        const basePath = itemPath.split('?')[0]
        const currentPath = location.pathname

        // Root dashboard and overview paths must match EXACTLY
        if (basePath === '/dashboard' || basePath === '/dashboard/superadmin') {
            return currentPath === basePath || currentPath === `${basePath}/`
        }

        // Course & video learning dynamic routes
        if (basePath.startsWith('/dashboard/learning-path')) {
            return currentPath.startsWith('/dashboard/learning-path')
        }
        if (basePath.startsWith('/dashboard/video-learning')) {
            return currentPath.startsWith('/dashboard/video-learning') || currentPath.startsWith('/dashboard/video-lesson')
        }
        if (basePath.startsWith('/dashboard/quiz-room')) {
            return currentPath.startsWith('/dashboard/quiz-room')
        }

        // Specific sub-route match (e.g. /dashboard/garden, /dashboard/skill-catalog, /dashboard/profile, /dashboard/admin/courses)
        return currentPath === basePath || currentPath.startsWith(`${basePath}/`)
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#FBFDFB] dark:bg-gray-950 flex text-[#1A2E22] dark:text-gray-100 font-sans">

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-white dark:bg-gray-900 border-r border-[#E6ECE6] dark:border-gray-800 flex-col justify-between p-5 sticky top-0 h-screen z-20 shrink-0">
                <div className="space-y-6">
                    {/* Logo */}
                    <Link to={isAdmin ? '/dashboard/admin/approvals' : '/dashboard'} className="flex items-center gap-3 px-1 py-1 group hover:opacity-90 transition-opacity">
                        <PltLogo height={38} />
                        <div className="h-7 w-px bg-[#E2E8F0] dark:bg-gray-700 mx-0.5" />
                        <div>
                            <div className="text-base font-black text-[#1A2E22] dark:text-white tracking-tight leading-none">SkillGarden</div>
                            <div className="text-[10px] font-bold text-[#2F3C96] dark:text-indigo-400 uppercase tracking-wider leading-none mt-1">
                                {isAdmin ? 'ADMIN CONSOLE' : 'PLT Solutions'}
                            </div>
                        </div>
                    </Link>

                    {/* Role Header Indicator */}
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${isAdmin ? 'bg-indigo-50 border-indigo-200 text-[#3C4097] dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300' : 'bg-[#DCEFE1] border-emerald-200 text-[#2C6A3D] dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                        }`}>
                        <div className="flex items-center gap-2">
                            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
                            <span>{isAdmin ? 'Quản Trị Viên' : 'Học Viên PLT'}</span>
                        </div>
                        <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-current">
                            {user?.role || 'USER'}
                        </span>
                    </div>

                    {/* Navigation links */}
                    <nav className="space-y-1">
                        {currentNavItems.map((item) => {
                            const active = isRouteActive(item.path)
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${active
                                        ? 'bg-[#3F49C8] text-white shadow-sm font-bold dark:bg-indigo-600'
                                        : 'text-[#4A5568] dark:text-gray-300 hover:bg-[#F3F6F3] dark:hover:bg-gray-800 hover:text-[#1A2E22] dark:hover:text-white'
                                        }`}
                                >
                                    <span className={active ? 'text-white' : 'text-[#718096] dark:text-gray-400'}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Nav */}
                <div className="pt-4 border-t border-[#E6ECE6] dark:border-gray-800 space-y-1">
                    {bottomNavItems.map((item) => {
                        const active = isRouteActive(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${active
                                    ? 'bg-[#3F49C8] text-white shadow-sm font-bold dark:bg-indigo-600'
                                    : 'text-[#4A5568] dark:text-gray-300 hover:bg-[#F3F6F3] dark:hover:bg-gray-800 hover:text-[#1A2E22] dark:hover:text-white'
                                    }`}
                            >
                                <span className={active ? 'text-white' : 'text-[#718096] dark:text-gray-400'}>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-all mt-2 cursor-pointer"
                    >
                        <LogOut className="w-5 h-5 text-red-500" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Drawer Backdrop & Sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 lg:hidden backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-72 bg-white dark:bg-gray-900 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Link to={isAdmin ? '/dashboard/admin/approvals' : '/dashboard'} className="flex items-center gap-2">
                                    <PltLogo height={32} />
                                    <span className="font-bold text-base text-[#1A2E22] dark:text-white">SkillGarden</span>
                                </Link>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>

                            <nav className="space-y-1">
                                {currentNavItems.map((item) => {
                                    const active = isRouteActive(item.path)
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${active ? 'bg-[#3F49C8] text-white font-bold dark:bg-indigo-600' : 'text-[#4A5568] dark:text-gray-300 hover:bg-[#F3F6F3] dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <span className={active ? 'text-white' : 'text-[#718096] dark:text-gray-400'}>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-[#E6ECE6] dark:border-gray-800 space-y-1">
                            {bottomNavItems.map((item) => {
                                const active = isRouteActive(item.path)
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${active ? 'bg-[#3F49C8] text-white font-bold dark:bg-indigo-600' : 'text-[#4A5568] dark:text-gray-300 hover:bg-[#F3F6F3] dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <span className={active ? 'text-white' : 'text-[#718096] dark:text-gray-400'}>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-all mt-2"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Header Bar */}
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-[#E6ECE6] dark:border-gray-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10">

                    <div className="flex items-center gap-3 flex-1 max-w-md">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-[#4A5568] dark:text-gray-300 hover:bg-[#F3F6F3] dark:hover:bg-gray-800"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Global Search Bar */}
                        <div className="relative w-full max-w-sm hidden sm:block">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096] dark:text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isAdmin ? "Tìm học viên, khóa học, quiz..." : "Tìm bài học, kỹ năng, quiz..."}
                                className="w-full h-9 pl-9 pr-12 rounded-full bg-[#F7FAF7] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 text-xs text-[#1A2E22] dark:text-white placeholder:text-[#A0AEC0] focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#2D7A4F] transition-all"
                            />

                            {/* Live Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-11 left-0 right-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-2 z-50 space-y-1">
                                    <div className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase">Kết quả tìm kiếm ({searchResults.length})</div>
                                    {searchResults.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                navigate(item.path)
                                                setSearchQuery('')
                                            }}
                                            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between transition-colors"
                                        >
                                            <span className="text-xs font-bold text-[#1A2E22] dark:text-white truncate">{item.title}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2">
                                                {item.category}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Stat Badges & Profile */}
                    <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">

                        {isAdmin ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold leading-none">
                                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                <span className="inline-flex items-center">Chế độ Quản trị</span>
                            </div>
                        ) : (
                            <>
                                {/* Streak Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF5F5] dark:bg-rose-950/60 border border-[#FEB2B2] dark:border-rose-800 text-[#E53E3E] dark:text-rose-300 text-xs font-bold shadow-2xs leading-none">
                                    <Flame className="w-4 h-4 fill-[#E53E3E] shrink-0" />
                                    <span className="hidden sm:inline-flex items-center">{displayStreak} Ngày Streak</span>
                                    <span className="sm:hidden inline-flex items-center">{displayStreak}d</span>
                                </div>

                                {/* XP Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-2xs leading-none">
                                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                                    <span className="inline-flex items-center">{displayXP.toLocaleString('vi-VN')} XP</span>
                                </div>
                            </>
                        )}

                        {/* Dark/Light Mode Toggle Button */}
                        <button
                            onClick={toggleDarkMode}
                            title={isDarkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
                            className="p-2 rounded-xl text-[#4A5568] dark:text-amber-400 hover:bg-[#F3F6F3] dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                        </button>

                        {/* Notifications Bell & Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative p-2 rounded-xl text-[#4A5568] dark:text-gray-300 hover:bg-[#F3F6F3] dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
                            </button>

                            {/* Notification Floating Menu */}
                            {isNotificationOpen && (
                                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl p-4 z-50 space-y-3">
                                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <span className="text-xs font-black text-[#1A2E22] dark:text-white flex items-center gap-1.5">
                                            <Bell className="w-4 h-4 text-[#3F49C8]" /> Thông Báo SkillGarden
                                        </span>
                                        <button
                                            onClick={() => setIsNotificationOpen(false)}
                                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                        >
                                            Đóng
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {notificationsList.map(n => (
                                            <div
                                                key={n.id}
                                                className={`p-3 rounded-2xl border text-xs space-y-1 transition-all ${n.unread
                                                    ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900'
                                                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between font-bold text-[#1A2E22] dark:text-white">
                                                    <span>{n.title}</span>
                                                    <span className="text-[10px] text-gray-400 font-normal">{n.time}</span>
                                                </div>
                                                <p className="text-[11px] text-gray-600 dark:text-gray-400">{n.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div
                            onClick={() => navigate('/dashboard/profile')}
                            className="flex items-center gap-2 pl-2 border-l border-[#E6ECE6] dark:border-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <Avatar
                                name={user?.full_name || 'User'}
                                src={(user?.email && localStorage.getItem('skillgarden_avatar_' + user.email)) || user?.avatar_url || undefined}
                                size="sm"
                            />
                            <div className="hidden md:block text-left">
                                <div className="text-xs font-bold text-[#1A2E22] dark:text-white">
                                    <span>{user?.full_name || 'User'}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
                    <Outlet />
                </main>
            </div>

            {/* 100XP Welcome Gift Popup */}
            <WelcomeRewardModal
                isOpen={Boolean(showWelcomeModal)}
                onClose={() => setDismissedWelcomeModal(true)}
            />

        </div>
    )
}
