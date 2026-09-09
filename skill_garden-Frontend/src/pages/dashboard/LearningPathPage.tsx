import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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

export const LearningPathPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'locked'>('all')

    return (
        <div className="space-y-8 pb-12">

            {/* Top Banner Header */}
            <div className="bg-[#E6FFFA]/50 border border-[#68D391]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#68D391]/20 to-[#3F49C8]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                    <div className="lg:col-span-8 space-y-4">
                        <Badge variant="skill" className="bg-white/80 border-[#2D7A4F]/30 text-[#2D7A4F]">
                            <Sprout className="w-3.5 h-3.5" /> LỘ TRÌNH CHUẨN HÓA DOANH NGHIỆP PLT SOLUTIONS
                        </Badge>

                        <h1 className="text-2xl sm:text-4xl font-black text-[#1A2E22] tracking-tight">
                            Kỹ sư Front-end Toàn Diện <span className="text-[#3F49C8] font-normal">(Front-end Career Path 2026)</span>
                        </h1>

                        <p className="text-sm text-[#4A5568] leading-relaxed max-w-2xl">
                            Hành trình từ người mới bắt đầu đến khi tự tay kiến tạo các ứng dụng web quy mô lớn, làm chủ hệ sinh thái React, TypeScript, Next.js và tích hợp AI vào quy trình sản xuất phần mềm.
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                            <Avatar name="Anh Khoa" levelBadge="8" size="md" />
                            <div>
                                <div className="text-xs font-bold text-[#1A2E22] flex items-center gap-2">
                                    <span>Anh Khoa</span>
                                    <span className="text-[#2D7A4F] font-mono text-[11px] bg-[#E6FFFA] px-2 py-0.5 rounded-full border border-[#68D391]/40">
                                        Cấp 8 • Mầm Tri Thức
                                    </span>
                                </div>
                                <span className="text-[11px] text-[#718096]">Mục tiêu: Junior/Mid Front-end Engineer @ PLT Solutions Lab</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Progress Widget */}
                    <div className="lg:col-span-4 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-[#E6ECE6] shadow-md space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4A5568]">TIẾN ĐỘ SINH TRƯỞNG</span>
                            <span className="text-xs font-extrabold text-[#3F49C8] bg-indigo-50 px-2 py-0.5 rounded-md">Chặng 2 / 5</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-gray-200"
                                        strokeWidth="4"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-[#3F49C8]"
                                        strokeDasharray="62, 100"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span className="absolute text-sm font-extrabold font-mono text-[#1A2E22]">62%</span>
                            </div>
                            <div>
                                <div className="text-xs text-[#718096]"><strong>68 / 110</strong> bài học</div>
                                <div className="text-xs text-[#718096] mt-0.5 font-mono"><strong>1.850 XP</strong> tích lũy</div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-1">
                            <Link to="/dashboard/skill/1">
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
                            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg ring-4 ring-white shadow-md z-10 shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <Card className="flex-1 p-5 border-emerald-200 hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                        CHẶNG 01 • HOÀN THÀNH XUẤT SẮC
                                    </span>
                                    <span className="text-xs font-mono text-[#718096]">24/24 Bài học • 4 Quiz Labs</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1A2E22]">
                                    Nền tảng Web Hiện đại (Modern Semantic HTML5 & CSS3)
                                </h3>
                                <p className="text-xs text-[#4A5568] leading-relaxed mt-1">
                                    Làm chủ cấu trúc chuẩn SEO, Accessibility WCAG AA, kiến trúc layout Flexbox/CSS Grid nâng cao, và chuẩn hóa Design System cùng Tailwind CSS theo dự án doanh nghiệp.
                                </p>

                                <div className="mt-4 pt-3 border-t border-[#E6ECE6] flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                        <Award className="w-4 h-4" />
                                        <span>Chứng chỉ Nền tảng Front-end Level 1 (Đánh giá: 98/100)</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Chapter 02 - Active Now (72%) */}
                        <div className="relative flex items-start gap-4 group">
                            <div className="w-12 h-12 rounded-full bg-[#3F49C8] text-white flex items-center justify-center font-bold text-sm ring-4 ring-indigo-100 shadow-md z-10 shrink-0">
                                72%
                            </div>
                            <Card className="flex-1 p-6 border-2 border-[#3F49C8] shadow-md bg-gradient-to-r from-white to-indigo-50/30">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3F49C8] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                                        CHẶNG 02 • ĐANG DIỄN RA 🌱
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                        <Sprout className="w-3.5 h-3.5" /> Cây JS đang đâm chồi sum suê
                                    </span>
                                </div>

                                <h3 className="text-xl font-extrabold text-[#1A2E22]">
                                    JavaScript Chuyên sâu, ESNext & Mô hình Bất đồng bộ
                                </h3>

                                <p className="text-xs text-[#4A5568] leading-relaxed mt-2">
                                    Hiểu sâu bản chất JavaScript Runtime, Execution Context, Event Loop, cùng như kỹ thuật giải quyết bài toán xử lý Concurrent Async với Promise.
                                </p>

                                {/* Next Lesson Box */}
                                <div className="mt-4 bg-white p-4 rounded-xl border border-[#3F49C8]/30 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-[#3F49C8] text-white flex items-center justify-center shrink-0">
                                            <PlayCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#718096]">BÀI HỌC TIẾP THEO</span>
                                            <h4 className="text-xs font-bold text-[#1A2E22]">Promise.allSettled() vs Promise.any() trong xử lý API</h4>
                                        </div>
                                    </div>

                                    <Link to="/dashboard/skill/1">
                                        <Button variant="indigo" size="sm">Vào học ngay &rsaquo;</Button>
                                    </Link>
                                </div>

                                <div className="mt-3 text-[11px] text-[#718096] flex items-center gap-1">
                                    <span>ℹ️</span> Chỉ cần hoàn thành <strong>2 bài học nữa</strong> để mở khóa bài kiểm tra Milestone 02
                                </div>
                            </Card>
                        </div>

                        {/* Chapter 03 - Unlocked/Start Exploring */}
                        <div className="relative flex items-start gap-4 group">
                            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg ring-4 ring-white shadow-xs z-10 shrink-0">
                                🌱
                            </div>
                            <Card className="flex-1 p-5 border-[#E6ECE6] hover:border-purple-300 transition-colors">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                                        CHẶNG 03 • ĐÃ MỞ KHÓA • BẮT ĐẦU KHÁM PHÁ
                                    </span>
                                    <span className="text-xs font-mono text-[#718096]">Tiến độ: 3 / 28 bài học (15%)</span>
                                </div>

                                <h3 className="text-lg font-bold text-[#1A2E22]">
                                    React Ecosystem & Quản lý trạng thái phức hợp
                                </h3>

                                <p className="text-xs text-[#4A5568] leading-relaxed mt-1">
                                    Chuyển đổi tư duy Component-driven, React 19 Compiler, Custom Hooks kiến trúc sạch, quản lý State toàn cục với Zustand và Server State caching tốc độ cao với TanStack Query v5.
                                </p>

                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    <Badge variant="skill">React 19</Badge>
                                    <Badge variant="skill">Zustand</Badge>
                                    <Badge variant="skill">TanStack Query</Badge>
                                    <Badge variant="skill">SSR & Next.js App Router</Badge>
                                </div>

                                <div className="mt-4 pt-3 border-t border-[#E6ECE6] flex items-center justify-between">
                                    <button className="text-xs font-bold text-[#3F49C8] hover:underline flex items-center gap-1">
                                        Xem chi tiết đề cương &rsaquo;
                                    </button>
                                </div>
                            </Card>
                        </div>

                        {/* Chapter 04 - Locked */}
                        <div className="relative flex items-start gap-4 opacity-75">
                            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg ring-4 ring-white shadow-xs z-10 shrink-0">
                                <Lock className="w-5 h-5" />
                            </div>
                            <Card className="flex-1 p-5 bg-gray-50/60 border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 bg-gray-200 px-2.5 py-0.5 rounded-md">
                                        CHẶNG 04 • ĐANG KHÓA
                                    </span>
                                    <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                        🔒 Cần hoàn thành 80% Chặng 2 & 3
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-gray-800">
                                    TypeScript Chuyên nghiệp & Kiến trúc Ứng dụng Lớn
                                </h3>

                                <p className="text-xs text-gray-600 leading-relaxed mt-1">
                                    Xây dựng hệ thống Type an toàn tuyệt đối với Generics, Mapped Types, Design Patterns (Factory, Strategy, Observer) và quy chuẩn Unit / Integration Testing toàn diện với Vitest & Playwright.
                                </p>
                            </Card>
                        </div>

                        {/* Chapter 05 - Capstone Project */}
                        <div className="relative flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg ring-4 ring-white shadow-xs z-10 shrink-0">
                                🏆
                            </div>
                            <Card className="flex-1 p-5 bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                                        CHẶNG 05 • ĐÍCH ĐẾN VÀNG
                                    </span>
                                    <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                                        🎯 Cơ hội tuyển dụng trực tiếp
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-[#1A2E22]">
                                    Đồ án Tốt nghiệp Thực chiến & Phỏng vấn Tuyển dụng PLT Solutions
                                </h3>

                                <p className="text-xs text-[#4A5568] leading-relaxed mt-1">
                                    Phát triển một giải pháp Enterprise Dashboard hoàn chỉnh theo tiêu chuẩn PLT Solutions Architecture, bảo vệ trước Hội đồng Công nghệ và nhận lời mời gia nhập đội ngũ R&D chính thức.
                                </p>

                                <div className="mt-3 bg-white p-3 rounded-xl border border-amber-200 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">🌱</div>
                                    <div className="text-xs">
                                        <strong className="text-[#1A2E22] block font-bold">Đặc quyền Kỹ sư SkillGarden:</strong>
                                        <span className="text-[#718096]">Bảo chứng đầu ra việc làm, cấp chứng chỉ Blockchain NFT vĩnh viễn và mentor 1-on-1 cùng Senior Tech Leads.</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>

                </div>

                {/* Right Column: Widgets */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Climate Buff Widget */}
                    <Card className="p-5 bg-gradient-to-br from-[#E6FFFA] to-emerald-50 border-[#68D391]/40">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2D7A4F] flex items-center gap-1.5">
                                🌡️ Ví khí hậu lộ trình
                            </span>
                            <span className="text-xs font-mono font-extrabold bg-[#2D7A4F] text-white px-2 py-0.5 rounded-md">
                                Buff x1.2 XP
                            </span>
                        </div>
                        <p className="text-xs text-[#4A5568] leading-relaxed">
                            Bạn đang duy trì chuỗi học tập lý tưởng! Khi khí hậu mầm mở giúp các nhánh kiến thức JavaScript hấp thu dinh dưỡng nhanh hơn 20%.
                        </p>

                        <div className="flex items-center justify-between gap-1 mt-4 pt-3 border-t border-[#68D391]/30">
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                                <div
                                    key={day}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${idx < 6 ? 'bg-[#2D7A4F] text-white' : 'bg-white border border-[#2D7A4F] text-[#2D7A4F]'
                                        }`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Mentor Companion Widget */}
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4A5568] flex items-center gap-1.5">
                                👥 Cố vấn đồng hành
                            </span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#3F49C8] text-white font-extrabold text-lg flex items-center justify-center shrink-0">
                                TĐ
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#1A2E22]">Trần Đình Duy</h4>
                                <p className="text-[11px] text-[#718096]">Principal Engineer @ PLT Solutions</p>
                            </div>
                        </div>

                        <div className="mt-3 bg-[#F7FAF7] p-3 rounded-xl text-xs text-[#4A5568] italic border border-[#E6ECE6]">
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
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4A5568] flex items-center gap-1.5">
                                🛡️ Bảo chứng & Vật phẩm
                            </span>
                            <span className="text-xs font-mono font-bold text-[#718096]">2 / 6 Vật phẩm</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                                <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">🎓</div>
                                <div className="text-[11px] font-bold text-emerald-900">Foundational NFT</div>
                                <div className="text-[10px] text-emerald-600">Đã kích hoạt</div>
                            </div>
                            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center space-y-1">
                                <div className="w-8 h-8 mx-auto rounded-lg bg-[#3F49C8] text-white flex items-center justify-center font-bold">⚡</div>
                                <div className="text-[11px] font-bold text-[#3F49C8]">JS Async Expert</div>
                                <div className="text-[10px] text-[#3F49C8]">Đang cày cuốc</div>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center space-y-1 opacity-60">
                                <div className="w-8 h-8 mx-auto rounded-lg bg-gray-200 text-gray-500 flex items-center justify-center font-bold">🔒</div>
                                <div className="text-[11px] font-bold text-gray-700">React Architect</div>
                                <div className="text-[10px] text-gray-500">Khóa</div>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center space-y-1 opacity-60">
                                <div className="w-8 h-8 mx-auto rounded-lg bg-gray-200 text-gray-500 flex items-center justify-center font-bold">🎖️</div>
                                <div className="text-[11px] font-bold text-gray-700">PLT Fellow 2026</div>
                                <div className="text-[10px] text-gray-500">Khóa</div>
                            </div>
                        </div>
                    </Card>

                    {/* Mastered Skills List */}
                    <Card className="p-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5568] mb-3">
                            🌿 Bộ kỹ năng đã đơm hoa
                        </h4>
                        <div className="space-y-3">
                            {[
                                { name: 'Semantic HTML5 & SEO Standards', pct: 100 },
                                { name: 'Responsive CSS Grid & Flexbox', pct: 100 },
                                { name: 'Tailwind Utility-First Architecture', pct: 100 },
                                { name: 'Event Loop & Async/Await Concurrency', pct: 72 },
                                { name: 'React 19 Server Actions & SSR', pct: 15 },
                            ].map((sk) => (
                                <div key={sk.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-[#1A2E22]">{sk.name}</span>
                                        <span className="font-mono font-bold text-[#2D7A4F]">{sk.pct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
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
