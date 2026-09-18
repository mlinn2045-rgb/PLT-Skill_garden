import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    CheckCircle2,
    Lock,
    PlayCircle,
    BookOpen,
    Award,
    Download,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Droplets,
    Sprout,
    ArrowRight,
    ExternalLink,
    Code,
    Share2,
    Bookmark,
    ArrowLeft
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { CircularProgress } from '../../components/ui/CircularProgress'

export const SkillDetailPage: React.FC = () => {
    const [openModules, setOpenModules] = useState<number[]>([3])

    const toggleModule = (modId: number) => {
        if (openModules.includes(modId)) {
            setOpenModules(openModules.filter((id) => id !== modId))
        } else {
            setOpenModules([...openModules, modId])
        }
    }

    return (
        <div className="space-y-8 pb-12">

            {/* Breadcrumbs & Actions bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#718096]">
                    <Link to="/dashboard" className="hover:text-[#1A2E22]">Kỹ năng</Link>
                    <span>&rsaquo;</span>
                    <Link to="/dashboard/learning-path/1" className="hover:text-[#1A2E22]">Lập trình Front-end</Link>
                    <span>&rsaquo;</span>
                    <span className="text-[#1A2E22] font-bold">JavaScript Core & Async</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" icon={<Share2 className="w-3.5 h-3.5" />}>Chia sẻ</Button>
                    <Button variant="outline" size="sm" icon={<Bookmark className="w-3.5 h-3.5" />} />
                    <Link to="/dashboard/learning-path/1">
                        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>Trở lại</Button>
                    </Link>
                </div>
            </div>

            {/* Hero Header Box */}
            <div className="bg-[#E6FFFA]/40 border border-[#68D391]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="skill" className="bg-[#3F49C8] text-white border-0 font-bold">Front-end Foundation</Badge>
                            <Badge variant="neutral">Độ khó: Trung bình</Badge>
                            <Badge variant="success">Cập nhật 2026</Badge>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black text-[#1A2E22] tracking-tight">
                            JavaScript Core & Async <span className="text-[#3F49C8] font-normal">(ES6+ & Bất đồng bộ)</span>
                        </h1>

                        <p className="text-sm text-[#4A5568] leading-relaxed max-w-2xl">
                            Làm chủ tư duy lập trình JavaScript hiện đại, cơ chế Event Loop, Promise, Async/Await, Microtasks và xử lý DOM thời gian thực với tiêu chuẩn kỹ sư PLT Solutions.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <Link to="/dashboard/video-learning?skill_id=1">
                                <Button variant="indigo" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
                                    Tiếp tục học bài tiếp theo
                                </Button>
                            </Link>
                            <Button variant="outline" size="md">Xem sơ đồ cây kỹ năng</Button>
                        </div>

                        <div className="flex items-center gap-4 pt-2 text-xs text-[#718096]">
                            <span>⏱️ Bài kế: <strong>15 phút</strong></span>
                            <span>•</span>
                            <span>📖 Đề tài: <strong>Promise.allSettled & Generators</strong></span>
                        </div>
                    </div>

                    {/* Right Circular Gauge Widget */}
                    <div className="lg:col-span-4 bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-[#E6ECE6] shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                        <div className="flex items-center gap-2 w-full justify-between text-xs font-bold text-[#4A5568]">
                            <span className="flex items-center gap-1"><Sprout className="w-4 h-4 text-[#2D7A4F]" /> Cây JS Sinh Khối</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full">Cấp độ 3</span>
                        </div>

                        <CircularProgress percentage={68} label="TIẾN ĐỘ SINH TRƯỞNG" size={130} />

                        <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-[#E6ECE6] text-xs">
                            <div className="p-2 rounded-xl bg-[#F7FAF7] text-left">
                                <span className="text-[10px] text-[#718096] block">Độ ẩm kiến thức</span>
                                <strong className="text-[#2D7A4F] font-bold">85% Tươi tốt</strong>
                            </div>
                            <div className="p-2 rounded-xl bg-[#F7FAF7] text-left">
                                <span className="text-[10px] text-[#718096] block">Kinh nghiệm đạt</span>
                                <strong className="text-amber-600 font-bold font-mono">420 / 600 XP</strong>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* 4 Quick Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3F49C8] flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-[#1A2E22]">28 / 42</div>
                        <div className="text-[11px] text-[#718096]">Bài học hoàn thành</div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-[#1A2E22]">6 / 8</div>
                        <div className="text-[11px] text-[#718096]">Quiz đạt chuẩn</div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Code className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-[#1A2E22]">2 Mini-lab</div>
                        <div className="text-[11px] text-[#718096]">Dự án thực chiến</div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-[#1A2E22]">Cấp độ 3</div>
                        <div className="text-[11px] text-[#718096]">Thân gỗ vững chãi</div>
                    </div>
                </Card>
            </div>

            {/* Main Section: Left Modules Accordion + Right Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Modules & Lessons */}
                <div className="lg:col-span-8 space-y-5">

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-[#1A2E22]">Lộ trình học chi tiết</h2>
                            <p className="text-xs text-[#718096]">5 Modules từ nền tảng đến kiến trúc ứng dụng bất đồng bộ</p>
                        </div>
                        <button className="text-xs font-bold text-[#3F49C8] hover:underline">
                            Mở rộng tất cả
                        </button>
                    </div>

                    {/* Module 01 */}
                    <Card className="overflow-hidden border-[#E6ECE6]">
                        <div className="p-4 bg-[#F7FAF7] flex items-center justify-between cursor-pointer" onClick={() => toggleModule(1)}>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">MODULE 01</span>
                                        <span className="text-[10px] text-emerald-600 font-bold">Đã hoàn thành 100%</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-[#1A2E22] mt-0.5">Căn bản & Kiểu dữ liệu nâng cao</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[#718096]">8/8 bài học</span>
                                {openModules.includes(1) ? <ChevronUp className="w-4 h-4 text-[#718096]" /> : <ChevronDown className="w-4 h-4 text-[#718096]" />}
                            </div>
                        </div>
                    </Card>

                    {/* Module 02 */}
                    <Card className="overflow-hidden border-[#E6ECE6]">
                        <div className="p-4 bg-[#F7FAF7] flex items-center justify-between cursor-pointer" onClick={() => toggleModule(2)}>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">MODULE 02</span>
                                        <span className="text-[10px] text-emerald-600 font-bold">Đã hoàn thành 100%</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-[#1A2E22] mt-0.5">Hàm, Closure & Scope chuyên sâu</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[#718096]">10/10 bài học</span>
                                {openModules.includes(2) ? <ChevronUp className="w-4 h-4 text-[#718096]" /> : <ChevronDown className="w-4 h-4 text-[#718096]" />}
                            </div>
                        </div>
                    </Card>

                    {/* Module 03 - Active Module (Open by default) */}
                    <Card className="overflow-hidden border-2 border-[#3F49C8] shadow-md">
                        <div className="p-4 bg-indigo-50/50 flex items-center justify-between cursor-pointer border-b border-indigo-100" onClick={() => toggleModule(3)}>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#3F49C8] text-white flex items-center justify-center text-xs font-bold shrink-0">03</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3F49C8] bg-indigo-100 px-2 py-0.5 rounded-md">MODULE ĐANG HỌC</span>
                                        <span className="text-[10px] text-indigo-700 font-bold">Tiến độ 65%</span>
                                    </div>
                                    <h3 className="text-sm font-extrabold text-[#1A2E22] mt-0.5">Bất đồng bộ, Promise & Event Loop</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[#718096]">8/12 bài hoàn thành</span>
                                {openModules.includes(3) ? <ChevronUp className="w-4 h-4 text-[#3F49C8]" /> : <ChevronDown className="w-4 h-4 text-[#3F49C8]" />}
                            </div>
                        </div>

                        {openModules.includes(3) && (
                            <div className="p-4 space-y-3 bg-white">

                                {/* 3.1 */}
                                <div className="p-3 rounded-xl bg-[#F7FAF7] flex items-center justify-between text-xs hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-[#1A2E22]">3.1 - Cơ chế Call Stack, Web APIs và Task Queue</h4>
                                            <div className="flex items-center gap-2 text-[11px] text-[#718096] mt-0.5">
                                                <span>📖 Lý thuyết</span>
                                                <span>• 14 phút</span>
                                                <span className="text-amber-600 font-bold">+20 XP</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-[#718096]">Ôn lại</span>
                                </div>

                                {/* 3.2 */}
                                <div className="p-3 rounded-xl bg-[#F7FAF7] flex items-center justify-between text-xs hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-[#1A2E22]">3.2 - Microtasks vs Macrotasks qua ví dụ thực tế</h4>
                                            <div className="flex items-center gap-2 text-[11px] text-[#718096] mt-0.5">
                                                <span>💻 Code Lab</span>
                                                <span>• 22 phút</span>
                                                <span className="text-amber-600 font-bold">+25 XP</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-[#718096]">Ôn lại</span>
                                </div>

                                {/* 3.3 - CURRENT LESSON */}
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-500 shadow-sm flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                            <PlayCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-md">BÀI HỌC HIỆN TẠI</span>
                                            <h4 className="text-sm font-bold text-[#1A2E22] mt-0.5">3.3 - Xử lý lỗi với Promise.allSettled() và async generators</h4>
                                            <div className="flex items-center gap-2 text-xs text-[#718096] mt-0.5">
                                                <span>💻 Code Lab & Bài tập</span>
                                                <span>• 18 phút</span>
                                                <span className="text-amber-600 font-bold">+30 XP</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link to="/dashboard/learning-path/1">
                                        <Button variant="indigo" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
                                            Vào học ngay
                                        </Button>
                                    </Link>
                                </div>

                                {/* 3.4 */}
                                <div className="p-3 rounded-xl bg-white border border-[#E6ECE6] flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3 opacity-80">
                                        <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-[#1A2E22]">3.4 - Hủy Fetch Request với AbortController</h4>
                                            <div className="flex items-center gap-2 text-[11px] text-[#718096] mt-0.5">
                                                <span>📖 Lý thuyết & Demo</span>
                                                <span>• 15 phút</span>
                                                <span>+20 XP</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[11px] text-[#718096]">Kế tiếp</span>
                                </div>

                                {/* 3.5 */}
                                <div className="p-3 rounded-xl bg-white border border-[#E6ECE6] flex items-center justify-between text-xs opacity-60">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-[#1A2E22]">3.5 - Quiz trắc nghiệm năng lực Event Loop & Async</h4>
                                            <div className="flex items-center gap-2 text-[11px] text-[#718096] mt-0.5">
                                                <span>❓ 15 câu hỏi</span>
                                                <span>• 20 phút</span>
                                                <span>+40 XP</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[11px] text-[#718096]">🔒 Khóa</span>
                                </div>

                            </div>
                        )}
                    </Card>

                    {/* Module 04 */}
                    <Card className="overflow-hidden border-[#E6ECE6]">
                        <div className="p-4 bg-[#F7FAF7] flex items-center justify-between cursor-pointer" onClick={() => toggleModule(4)}>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">04</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-200 px-2 py-0.5 rounded-md">MODULE TIẾP THEO</span>
                                        <span className="text-[10px] text-gray-500">Đã mở khóa</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-[#1A2E22] mt-0.5">DOM tương tác & Web APIs hiện đại</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[#718096]">8 bài học</span>
                                {openModules.includes(4) ? <ChevronUp className="w-4 h-4 text-[#718096]" /> : <ChevronDown className="w-4 h-4 text-[#718096]" />}
                            </div>
                        </div>
                    </Card>

                </div>

                {/* Right Column: Widgets */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Care for Skill Tree Widget */}
                    <Card className="p-5 bg-gradient-to-br from-emerald-50 to-[#E6FFFA] border-[#68D391]/40">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2D7A4F] flex items-center gap-1.5">
                                🪴 Chăm sóc Cây Kỹ Năng
                            </span>
                            <span className="text-xs font-mono font-bold text-[#2D7A4F]">Chuỗi 7 ngày</span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-[#68D391]/30 text-xs space-y-1">
                            <strong className="text-[#1A2E22] block font-bold">💡 Gợi ý sinh trưởng hôm nay</strong>
                            <p className="text-[#718096]">
                                Học thêm <strong>1 bài học</strong> nữa trước 23:59 để giữ độ tươi tốt của cây ở mức 100% và nhận tối đa điểm tích lũy vườn số (+50 XP).
                            </p>
                        </div>

                        <Button variant="primary" fullWidth size="md" className="mt-4" icon={<Droplets className="w-4 h-4" />}>
                            Tưới nước & Xác nhận học tập
                        </Button>
                    </Card>

                    {/* Special Certificate Badge */}
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4A5568]">Chứng nhận chuyên môn</span>
                            <Award className="w-4 h-4 text-[#3F49C8]" />
                        </div>

                        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#3F49C8] text-white flex items-center justify-center font-bold text-lg shrink-0">
                                🛡️
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[#1A2E22]">JavaScript Architect</h4>
                                <p className="text-[10px] text-[#718096]">Cấp bởi PLT Solutions • Mở khóa khi đạt 100%</p>
                            </div>
                        </div>

                        <div className="mt-3">
                            <div className="flex justify-between text-[11px] text-[#718096] mb-1">
                                <span>Tiến độ chứng chỉ</span>
                                <span className="font-bold font-mono">28/42 bài</span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#3F49C8] h-full w-[66%]" />
                            </div>
                        </div>
                    </Card>

                    {/* Instructor & Mentor Widget */}
                    <Card className="p-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5568] mb-3">
                            Giảng viên & Cố vấn
                        </h4>
                        <div className="flex items-center gap-3">
                            <Avatar name="Anh Khoa" levelBadge="TL" size="lg" />
                            <div>
                                <h4 className="text-xs font-bold text-[#1A2E22]">Anh Khoa (Tech Lead)</h4>
                                <p className="text-[11px] text-[#718096]">Front-end Lead @ PLT Solutions</p>
                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Trực tuyến hỗ trợ giải đáp
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" fullWidth size="sm" className="mt-4" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                            Hỏi đáp bài học
                        </Button>
                    </Card>

                    {/* Community Resources */}
                    <Card className="p-5 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5568]">
                            Tài nguyên & Cộng đồng
                        </h4>

                        <a href="#" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-xs text-[#4A5568]">
                            <span className="flex items-center gap-2">📄 Tài liệu CheatSheet ES6+ (PDF)</span>
                            <Download className="w-3.5 h-3.5 text-[#718096]" />
                        </a>

                        <a href="#" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-xs text-[#4A5568]">
                            <span className="flex items-center gap-2">💬 Kênh thảo luận Discord PLT</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#718096]" />
                        </a>

                        <a href="#" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-xs text-[#4A5568]">
                            <span className="flex items-center gap-2">💻 Kho mã nguồn GitHub Labs</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#718096]" />
                        </a>
                    </Card>

                </div>

            </div>

        </div>
    )
}
