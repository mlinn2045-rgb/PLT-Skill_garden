import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    CheckCircle2,
    Lock,
    PlayCircle,
    Award,
    Download,
    MessageSquare,
    Calendar,
    ArrowRight,
    Sprout
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { useAuthStore } from '../../stores/authStore'
import { getChapterProgress, getSkillGrowth } from '../../services/learningProgress'
import { getStudentStats } from '../../services/studentStats'
import { apiClient } from '../../services/apiClient'

const learningPaths = {
    '1': {
        title: 'Frontend React 19 Mastery',
        subtitle: 'React 19 & Front-end Career Path 2026',
        description: 'Làm chủ React 19, Hooks, State Management, Server Components và Tailwind CSS qua các bài học thực chiến.',
        goal: 'Junior/Mid Front-end Engineer @ PLT Solutions Lab',
        nextLesson: 'React Hooks & State Management trong ứng dụng thực tế',
        activeChapter: 'React 19, Hooks & Quản lý trạng thái',
        activeDescription: 'Xây dựng tư duy Component-driven, làm chủ React 19, Custom Hooks và quản lý State toàn cục với Zustand.',
        unlockedChapter: 'Server Components, Next.js & tối ưu trải nghiệm người dùng',
    },
    '2': {
        title: 'Backend NestJS & Node.js System',
        subtitle: 'Backend Engineering Career Path 2026',
        description: 'Xây dựng RESTful API, Microservices, Dependency Injection và Authentication theo tiêu chuẩn enterprise.',
        goal: 'Junior/Mid Backend Engineer @ PLT Solutions Lab',
        nextLesson: 'Dependency Injection & Module Architecture trong NestJS',
        activeChapter: 'NestJS Core & kiến trúc Backend',
        activeDescription: 'Thiết kế module, controller, service và hệ thống xác thực có thể mở rộng bằng NestJS và Node.js.',
        unlockedChapter: 'Microservices, Queues & triển khai hệ thống',
    },
    '3': {
        title: 'Database SQL & MySQL Architect',
        subtitle: 'Database Engineering Career Path 2026',
        description: 'Thiết kế cơ sở dữ liệu quan hệ, viết SQL query phức tạp và tối ưu Index, Transaction cho hệ thống lớn.',
        goal: 'Database Engineer @ PLT Solutions Lab',
        nextLesson: 'Index, Query Plan & tối ưu truy vấn MySQL',
        activeChapter: 'SQL chuyên sâu & thiết kế dữ liệu',
        activeDescription: 'Thực hành chuẩn hóa dữ liệu, JOIN, transaction và chiến lược index cho các truy vấn thực tế.',
        unlockedChapter: 'Database Architecture & High Availability',
    },
    '4': {
        title: 'Python & Data Analysis Core',
        subtitle: 'Python Data Career Path 2026',
        description: 'Học Python từ nền tảng đến phân tích dữ liệu với Pandas, NumPy và Matplotlib qua các bài tập trực quan.',
        goal: 'Python Data Analyst @ PLT Solutions Lab',
        nextLesson: 'DataFrame, Filtering & GroupBy với Pandas',
        activeChapter: 'Python Core & xử lý dữ liệu',
        activeDescription: 'Nắm chắc cú pháp Python, cấu trúc dữ liệu và quy trình làm sạch dữ liệu cho bài toán phân tích.',
        unlockedChapter: 'Trực quan hóa dữ liệu & Machine Learning Foundation',
    },
    '5': {
        title: 'Manual & Automation Testing',
        subtitle: 'Software Testing Career Path 2026',
        description: 'Nắm vững quy trình kiểm thử, thiết kế Test Case và tự động hóa với Playwright, Jest.',
        goal: 'QA Automation Engineer @ PLT Solutions Lab',
        nextLesson: 'Viết Test Case và chiến lược kiểm thử hiệu quả',
        activeChapter: 'Manual Testing & Test Design',
        activeDescription: 'Thực hành phân tích yêu cầu, thiết kế Test Case và xây dựng quy trình kiểm thử có thể đo lường.',
        unlockedChapter: 'Playwright Automation & CI Testing',
    },
    '6': {
        title: 'Flutter & React Native Mobile',
        subtitle: 'Cross-platform Mobile Career Path 2026',
        description: 'Xây dựng ứng dụng mobile đa nền tảng với Flutter, React Native và UI/UX hiện đại.',
        goal: 'Mobile Engineer @ PLT Solutions Lab',
        nextLesson: 'Thiết kế màn hình mobile và quản lý state',
        activeChapter: 'Mobile UI & State Management',
        activeDescription: 'Tạo giao diện responsive cho iOS và Android, kết nối dữ liệu và quản lý trạng thái ứng dụng.',
        unlockedChapter: 'Navigation, API Integration & Release',
    },
} as const

export const LearningPathPage: React.FC = () => {
    const { id = '1' } = useParams<{ id: string }>()
    const path = learningPaths[id as keyof typeof learningPaths] ?? learningPaths['1']
    const { user } = useAuthStore()
    const userKey = user?.email || 'guest'
    const studentStats = getStudentStats(userKey)
    const displayName = user?.full_name || user?.email?.split('@')[0] || 'Học viên'
    const displayLevel = Math.max(user?.level || 0, studentStats.xp > 0 ? Math.floor(studentStats.xp / 100) + 1 : 0)
    const growthLabel = displayLevel > 0 ? (displayLevel >= 5 ? 'Cây trưởng thành' : 'Mầm Tri Thức') : 'Hạt giống mới gieo'
    const chapterProgress = getChapterProgress(id, '1', userKey)
    const chapter2Progress = getChapterProgress(id, '2', userKey)
    const chapter3Progress = getChapterProgress(id, '3', userKey)
    const activeChapterId = chapterProgress.quizCompleted ? '2' : '1'
    const activeChapterProgress = activeChapterId === '2' ? chapter2Progress : chapterProgress
    const skillGrowth = getSkillGrowth(id, userKey)
    const learningProgress = skillGrowth.progress
    const chapter2Unlocked = chapterProgress.quizCompleted
    const chapter3Unlocked = chapter2Progress.quizCompleted
    const chapterPercent = (progress: typeof chapterProgress) => {
        if (progress.quizCompleted) return 100
        if (progress.videoCompleted && progress.pdfCompleted) return 75
        if (progress.videoCompleted || progress.pdfCompleted) return 50
        return 0
    }
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'locked'>('all')

    const [dbLessons, setDbLessons] = useState<any[]>([])

    useEffect(() => {
        let isMounted = true
        apiClient.get<any[]>(`/lessons.php?skill_id=${encodeURIComponent(id)}`)
            .then(res => {
                if (isMounted) {
                    const list = Array.isArray(res.data) ? res.data : []
                    setDbLessons(list)
                }
            })
            .catch(() => {
                if (isMounted) setDbLessons([])
            })
        return () => { isMounted = false }
    }, [id])

    const lesson1 = dbLessons[0]
    const lesson2 = dbLessons[1]

    const totalLessonsCount = dbLessons.length

    return (
        <div className="space-y-8 pb-12">

            {/* Top Banner Header */}
            <div className="bg-[#E6FFFA]/50 dark:bg-emerald-950/30 border border-[#68D391]/30 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#68D391]/20 to-[#3F49C8]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                    <div className="lg:col-span-8 space-y-4">
                        <Badge variant="skill" className="bg-white/80 dark:bg-emerald-900/80 border-[#2D7A4F]/30 dark:border-emerald-700 text-[#2D7A4F] dark:text-emerald-300">
                            <Sprout className="w-3.5 h-3.5" /> LỘ TRÌNH CHUẨN HÓA DOANH NGHIỆP PLT SOLUTIONS
                        </Badge>

                        <h1 className="text-2xl sm:text-4xl font-black text-[#1A2E22] dark:text-white tracking-tight">
                            {path.title} <span className="text-[#3F49C8] dark:text-indigo-400 font-normal">({path.subtitle})</span>
                        </h1>

                        <p className="text-sm text-[#4A5568] dark:text-gray-300 leading-relaxed max-w-2xl">
                            {path.description}
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                            <Avatar name={displayName} levelBadge={String(displayLevel)} size="md" />
                            <div>
                                <div className="text-xs font-bold text-[#1A2E22] dark:text-white flex items-center gap-2">
                                    <span>{displayName}</span>
                                    <span className="text-[#2D7A4F] dark:text-emerald-300 font-mono text-[11px] bg-[#E6FFFA] dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-[#68D391]/40 dark:border-emerald-800">
                                        Cấp {displayLevel} • {growthLabel}
                                    </span>
                                </div>
                                <span className="text-[11px] text-[#718096] dark:text-gray-400">Mục tiêu: {path.goal}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Progress Widget */}
                    <div className="lg:col-span-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl p-5 border border-[#E6ECE6] dark:border-gray-800 shadow-md space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4A5568] dark:text-gray-300">TIẾN ĐỘ SINH TRƯỞNG</span>
                            <span className="text-xs font-extrabold text-[#3F49C8] dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">{learningProgress}% hoàn thành</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-gray-200 dark:text-gray-700"
                                        strokeWidth="4"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-[#3F49C8] dark:text-indigo-400"
                                        strokeDasharray={`${learningProgress}, 100`}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span className="absolute text-sm font-extrabold font-mono text-[#1A2E22] dark:text-white">{learningProgress}%</span>
                            </div>
                            <div>
                                <div className="text-xs text-[#718096] dark:text-gray-300"><strong className="dark:text-white">{learningProgress ? '1' : '0'} / {totalLessonsCount}</strong> bài học</div>
                                <div className="text-xs text-[#718096] dark:text-gray-300 mt-0.5 font-mono"><strong className="dark:text-white">{learningProgress ? '100' : '0'} XP</strong> tích lũy</div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-1">
                            <Link to={`/dashboard/video-learning?skill_id=${id}&chapter=${activeChapterId}`}>
                                <Button variant="indigo" fullWidth size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
                                    Tiếp tục chặng hiện tại
                                </Button>
                            </Link>
                            <Button variant="outline" fullWidth size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                                Tải đề cương PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Left Timeline + Right Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Chapters Timeline */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Tab Filter */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#E6ECE6]">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === 'all' ? 'bg-[#3F49C8] text-white shadow-xs' : 'bg-gray-100 text-[#4A5568] hover:bg-gray-200'
                                    }`}
                            >
                                Tất cả các Chặng (5)
                            </button>
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === 'active' ? 'bg-[#3F49C8] text-white shadow-xs' : 'bg-gray-100 text-[#4A5568] hover:bg-gray-200'
                                    }`}
                            >
                                • Đang diễn ra
                            </button>
                            <button
                                onClick={() => setActiveTab('locked')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === 'locked' ? 'bg-[#3F49C8] text-white shadow-xs' : 'bg-gray-100 text-[#4A5568] hover:bg-gray-200'
                                    }`}
                            >
                                🔒 Sắp mở khóa
                            </button>
                        </div>

                        <span className="text-xs text-[#718096]">Đồng bộ theo kỳ hạn: <strong>Q2/2026</strong></span>
                    </div>

                    {/* Timeline Nodes Container */}
                    <div className="relative space-y-8 before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-gradient-to-b before:from-[#68D391] before:via-[#3F49C8] before:to-gray-200">

                        {/* Chapter 01 - Completed */}
                        <div className="relative flex items-start gap-4 group">
                            <div className={`w-12 h-12 rounded-full ${chapterProgress.quizCompleted ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'} ${chapterProgress.quizCompleted ? 'text-white' : 'text-gray-500 dark:text-gray-400'} flex items-center justify-center font-bold text-lg ring-4 ring-white dark:ring-gray-900 shadow-md z-10 shrink-0`}>
                                {chapterProgress.quizCompleted ? <CheckCircle2 className="w-6 h-6" /> : '01'}
                            </div>
                            <Card className="flex-1 p-5 border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                        {chapterProgress.quizCompleted ? 'CHẶNG 01 • HOÀN THÀNH' : 'CHẶNG 01 • CHƯA HOÀN THÀNH'}
                                    </span>
                                    <span className="text-xs font-mono text-[#718096] dark:text-gray-400">{totalLessonsCount} Bài học • 4 Quiz Labs</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1A2E22] dark:text-white">
                                    Nền tảng Web Hiện đại (Modern Semantic HTML5 & CSS3)
                                </h3>
                                <p className="text-xs text-[#4A5568] dark:text-gray-300 leading-relaxed mt-1">
                                    Làm chủ cấu trúc chuẩn SEO, Accessibility WCAG AA, kiến trúc layout Flexbox/CSS Grid nâng cao, và chuẩn hóa Design System cùng Tailwind CSS theo dự án doanh nghiệp.
                                </p>

                                {/* Lesson 1 Box */}
                                <div className="mt-4 bg-emerald-50/50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                            <PlayCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">BÀI HỌC VIDEO</span>
                                            <h4 className="text-xs font-bold text-[#1A2E22] dark:text-white">{lesson1?.title || 'Bài 1: Nền tảng Semantic HTML5 & CSS3'}</h4>
                                        </div>
                                    </div>

                                    <Link to={chapterProgress.quizCompleted ? `/dashboard/video-learning?skill_id=${id}&chapter=1&lesson=1` : `/dashboard/video-learning?skill_id=${id}&chapter=1`}>
                                        <Button variant={chapterProgress.quizCompleted ? 'outline' : 'indigo'} size="sm" className="font-bold">
                                            {totalLessonsCount > 0 ? (chapterProgress.quizCompleted ? 'Ôn lại' : 'Bắt đầu học lesson 1') : 'Chưa có bài học'}
                                        </Button>
                                    </Link>
                                </div>

                                <div className="mt-4 pt-3 border-t border-[#E6ECE6] dark:border-gray-800 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                                        <Award className="w-4 h-4" />
                                        <span>Chứng chỉ Nền tảng Front-end Level 1 (Đánh giá: 98/100)</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Chapter 02 - Active Now (72%) */}
                        <div className="relative flex items-start gap-4 group">
                            <div className={`w-12 h-12 rounded-full ${chapter2Unlocked && learningProgress > 0 ? 'bg-[#3F49C8] text-white ring-indigo-100 dark:ring-indigo-950' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-white dark:ring-gray-900'} flex items-center justify-center font-bold text-sm ring-4 shadow-md z-10 shrink-0`}>
                                {chapter2Unlocked ? `${learningProgress}%` : '02'}
                            </div>
                            <Card className="flex-1 p-6 border-2 border-[#3F49C8] dark:border-indigo-500 shadow-md bg-gradient-to-r from-white via-indigo-50/30 to-white dark:from-gray-900 dark:via-indigo-950/40 dark:to-gray-900">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3F49C8] dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                                        {chapter2Unlocked ? (chapter2Progress.quizCompleted ? 'CHẶNG 02 • HOÀN THÀNH' : 'CHẶNG 02 • ĐANG HỌC 🌱') : 'CHẶNG 02 • ĐANG KHÓA'}
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <Sprout className="w-3.5 h-3.5" /> {chapter2Unlocked ? 'Cây kỹ năng đang đâm chồi' : 'Hoàn thành quiz chặng 1 để mở khóa'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-extrabold text-[#1A2E22] dark:text-white">
                                    {path.activeChapter}
                                </h3>

                                <p className="text-xs text-[#4A5568] dark:text-gray-300 leading-relaxed mt-2">
                                    {path.activeDescription}
                                </p>

                                {/* Next Lesson Box */}
                                <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-[#3F49C8]/30 dark:border-indigo-500/40 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-[#3F49C8] dark:bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                            <PlayCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#718096] dark:text-gray-400">BÀI HỌC TIẾP THEO</span>
                                            <h4 className="text-xs font-bold text-[#1A2E22] dark:text-white">{lesson2?.title || 'Chưa có bài học ở Chặng 2'}</h4>
                                        </div>
                                    </div>

                                    {chapter2Unlocked ? (
                                        <Link to={`/dashboard/video-learning?skill_id=${id}&chapter=2`}>
                                            <Button variant="indigo" size="sm">Vào học ngay &rsaquo;</Button>
                                        </Link>
                                    ) : (
                                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">🔒 Chưa mở khóa</span>
                                    )}
                                </div>

                                <div className="mt-3 text-[11px] text-[#718096] dark:text-gray-400 flex items-center gap-1">
                                    <span>ℹ️</span> {learningProgress > 0 ? 'Hoàn thành thêm bài học và quiz để cây tiếp tục sinh trưởng' : 'Bắt đầu từ lesson 1 để gieo hạt giống kỹ năng'}
                                </div>
                            </Card>
                        </div>

                        {/* Chapter 03 - Unlocked/Start Exploring */}
                        <div className="relative flex items-start gap-4 group">
                            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-lg ring-4 ring-white dark:ring-gray-900 shadow-xs z-10 shrink-0">
                                🌱
                            </div>
                            <Card className="flex-1 p-5 border-[#E6ECE6] dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                                        {chapter3Unlocked ? 'CHẶNG 03 • ĐÃ MỞ KHÓA • BẮT ĐẦU KHÁM PHÁ' : 'CHẶNG 03 • ĐANG KHÓA'}
                                    </span>
                                    <span className="text-xs font-mono text-[#718096] dark:text-gray-400">Tiến độ: 3 / 28 bài học (15%)</span>
                                </div>

                                <h3 className="text-lg font-bold text-[#1A2E22] dark:text-white">
                                    {path.unlockedChapter}
                                </h3>

                                <p className="text-xs text-[#4A5568] dark:text-gray-300 leading-relaxed mt-1">
                                    Chuyển đổi tư duy Component-driven, React 19 Compiler, Custom Hooks kiến trúc sạch, quản lý State toàn cục với Zustand và Server State caching tốc độ cao với TanStack Query v5.
                                </p>

                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    <Badge variant="skill">React 19</Badge>
                                    <Badge variant="skill">Zustand</Badge>
                                    <Badge variant="skill">TanStack Query</Badge>
                                    <Badge variant="skill">SSR & Next.js App Router</Badge>
                                </div>

                                <div className="mt-4 pt-3 border-t border-[#E6ECE6] dark:border-gray-800 flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#3F49C8] dark:text-indigo-400 flex items-center gap-1">
                                        {chapter3Unlocked ? 'Xem chi tiết đề cương ›' : 'Hoàn thành quiz chặng 2 để mở khóa'}
                                    </span>
                                    {chapter3Unlocked && (
                                        <Link to={`/dashboard/video-learning?skill_id=${id}&chapter=3`}>
                                            <Button variant="indigo" size="sm">Vào học ngay &rsaquo;</Button>
                                        </Link>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Chapter 04 - Locked */}
                        <div className="relative flex items-start gap-4 opacity-75">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center font-bold text-lg ring-4 ring-white dark:ring-gray-900 shadow-xs z-10 shrink-0">
                                <Lock className="w-5 h-5" />
                            </div>
                            <Card className="flex-1 p-5 bg-gray-50/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 px-2.5 py-0.5 rounded-md">
                                        CHẶNG 04 • ĐANG KHÓA
                                    </span>
                                    <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                        🔒 Cần hoàn thành 80% Chặng 2 & 3
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                                    TypeScript Chuyên nghiệp & Kiến trúc Ứng dụng Lớn
                                </h3>

                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-1">
                                    Xây dựng hệ thống Type an toàn tuyệt đối với Generics, Mapped Types, Design Patterns (Factory, Strategy, Observer) và quy chuẩn Unit / Integration Testing toàn diện với Vitest & Playwright.
                                </p>
                            </Card>
                        </div>

                        {/* Chapter 05 - Capstone Project */}
                        <div className="relative flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg ring-4 ring-white dark:ring-gray-900 shadow-xs z-10 shrink-0">
                                🏆
                            </div>
                            <Card className="flex-1 p-5 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 rounded-md">
                                        CHẶNG 05 • ĐÍCH ĐẾN VÀNG
                                    </span>
                                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                                        🎯 Cơ hội tuyển dụng trực tiếp
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-[#1A2E22] dark:text-white">
                                    Đồ án Tốt nghiệp Thực chiến & Phỏng vấn Tuyển dụng PLT Solutions
                                </h3>

                                <p className="text-xs text-[#4A5568] dark:text-gray-300 leading-relaxed mt-1">
                                    Phát triển một giải pháp Enterprise Dashboard hoàn chỉnh theo tiêu chuẩn PLT Solutions Architecture, bảo vệ trước Hội đồng Công nghệ và nhận lời mời gia nhập đội ngũ R&D chính thức.
                                </p>

                                <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-amber-200 dark:border-amber-800/80 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">🌱</div>
                                    <div className="text-xs">
                                        <strong className="text-[#1A2E22] dark:text-white block font-bold">Đặc quyền Kỹ sư SkillGarden:</strong>
                                        <span className="text-[#718096] dark:text-gray-300">Bảo chứng đầu ra việc làm, cấp chứng chỉ Blockchain NFT vĩnh viễn và mentor 1-on-1 cùng Senior Tech Leads.</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>

                </div>

                {/* Right Column: Widgets */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Climate Buff Widget */}
                    <Card className="p-5 bg-gradient-to-br from-[#E6FFFA] to-emerald-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-[#68D391]/40 dark:border-emerald-800/80">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2D7A4F] dark:text-emerald-300 flex items-center gap-1.5">
                                🌡️ Ví khí hậu lộ trình
                            </span>
                            <span className="text-xs font-mono font-extrabold bg-[#2D7A4F] dark:bg-emerald-700 text-white px-2 py-0.5 rounded-md">
                                Buff x1.2 XP
                            </span>
                        </div>
                        <p className="text-xs text-[#4A5568] dark:text-gray-200 leading-relaxed">
                            Bạn đang duy trì chuỗi học tập lý tưởng! Khi khí hậu mầm mở giúp các nhánh kiến thức JavaScript hấp thu dinh dưỡng nhanh hơn 20%.
                        </p>

                        <div className="flex items-center justify-between gap-1 mt-4 pt-3 border-t border-[#68D391]/30 dark:border-emerald-800/50">
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                                <div
                                    key={day}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${idx < 6 ? 'bg-[#2D7A4F] text-white' : 'bg-white dark:bg-gray-800 border border-[#2D7A4F] text-[#2D7A4F] dark:text-emerald-400'
                                        }`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Mentor Companion Widget */}
                    <Card className="p-5 bg-white dark:bg-gray-900 border border-[#E6ECE6] dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4A5568] dark:text-gray-300 flex items-center gap-1.5">
                                👥 Cố vấn đồng hành
                            </span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#3F49C8] dark:bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0">
                                TĐ
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#1A2E22] dark:text-white">Trần Đình Duy</h4>
                                <p className="text-[11px] text-[#718096] dark:text-gray-400">Principal Engineer @ PLT Solutions</p>
                            </div>
                        </div>

                        <div className="mt-3 bg-[#F7FAF7] dark:bg-gray-800/80 p-3 rounded-xl text-xs text-[#4A5568] dark:text-gray-200 italic border border-[#E6ECE6] dark:border-gray-700">
                            "Anh Khoa chú ý kỹ thuật xử lý Cancel Token và Race Conditions trong Async JS nhé, chặng React phía trước sẽ tận dụng liên tục!"
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <Button variant="outline" size="sm" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                                Đặt câu hỏi
                            </Button>
                            <Button variant="outline" size="sm" icon={<Calendar className="w-3.5 h-3.5" />}>
                                Đặt lịch 1:1
                            </Button>
                        </div>
                    </Card>

                    {/* Verified Items & Credentials */}
                    <Card className="p-5 bg-white dark:bg-gray-900 border border-[#E6ECE6] dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4A5568] dark:text-gray-300 flex items-center gap-1.5">
                                🛡️ Bảo chứng & Vật phẩm
                            </span>
                            <span className="text-xs font-mono font-bold text-[#718096] dark:text-gray-400">2 / 6 Vật phẩm</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                                <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">🎓</div>
                                <div className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">Foundational NFT</div>
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Đã kích hoạt</div>
                            </div>
                            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center space-y-1">
                                <div className="w-8 h-8 mx-auto rounded-lg bg-[#3F49C8] dark:bg-indigo-600 text-white flex items-center justify-center font-bold">⚡</div>
                                <div className="text-[11px] font-bold text-[#3F49C8] dark:text-indigo-300">JS Async Expert</div>
                                <div className="text-[10px] text-[#3F49C8] dark:text-indigo-400">Đang cày cuốc</div>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-center space-y-1 opacity-60">
                                <div className="w-8 h-8 mx-auto rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold">🔒</div>
                                <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300">React Architect</div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">Khóa</div>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-center space-y-1 opacity-60">
                                <div className="w-8 h-8 mx-auto rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold">🎖️</div>
                                <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300">PLT Fellow 2026</div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">Khóa</div>
                            </div>
                        </div>
                    </Card>

                    {/* Mastered Skills List */}
                    <Card className="p-5 bg-white dark:bg-gray-900 border border-[#E6ECE6] dark:border-gray-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5568] dark:text-gray-300 mb-3">
                            🌿 Tiến độ bộ kỹ năng
                        </h4>
                        <div className="space-y-3">
                            {[
                                { name: 'Semantic HTML5 & SEO Standards', pct: chapterPercent(chapterProgress) },
                                { name: 'Responsive CSS Grid & Flexbox', pct: chapterPercent(chapterProgress) },
                                { name: 'Tailwind Utility-First Architecture', pct: chapterPercent(chapterProgress) },
                                { name: path.activeChapter, pct: chapterPercent(chapter2Progress) },
                                { name: path.unlockedChapter, pct: chapterPercent(chapter3Progress) },
                            ].map((sk) => (
                                <div key={sk.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-[#1A2E22] dark:text-white">{sk.name}</span>
                                        <span className="font-mono font-bold text-[#2D7A4F] dark:text-emerald-400">{sk.pct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#68D391] to-[#2D7A4F] rounded-full"
                                            style={{ width: `${sk.pct}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>

            </div>

        </div>
    )
}
