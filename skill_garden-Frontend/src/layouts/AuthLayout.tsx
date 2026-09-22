import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShieldCheck, Sparkles, Flame, Sprout } from 'lucide-react'
import { PltLogo } from '../components/ui/PltLogo'

interface AuthLayoutProps {
    children: React.ReactNode
    heroTitle: string
    heroSubtitle: string
    badgeText: string
    leftVariant?: 'login' | 'register' | 'forgot'
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    heroTitle,
    heroSubtitle,
    badgeText,
    leftVariant = 'login'
}) => {
    const location = useLocation()
    const isLoginPage = location.pathname === '/login'

    return (
        <div className="min-h-screen bg-[#F7F9F7] dark:bg-gray-950 flex flex-col font-sans">
            {/* Top Header */}
            <header className="w-full px-6 lg:px-12 py-3.5 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-[#E6ECE6] dark:border-gray-800">
                <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-opacity">
                    <PltLogo height={42} />
                    <div className="h-8 w-px bg-[#E2E8F0] dark:bg-gray-700 mx-0.5" />
                    <div>
                        <span className="text-xs font-bold text-[#2F3C96] dark:text-indigo-400 uppercase tracking-wider block leading-none">Hệ thống Đào tạo</span>
                        <span className="text-lg font-black text-[#1A2E22] dark:text-white tracking-tight block">SkillGarden</span>
                    </div>
                </Link>

                <div className="text-sm font-medium text-[#4A5568] dark:text-gray-300">
                    {isLoginPage ? (
                        <span>
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="font-bold text-[#3F49C8] dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                                Đăng ký ngay &rsaquo;
                            </Link>
                        </span>
                    ) : (
                        <span>
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-bold text-[#3F49C8] dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                                Đăng nhập &rsaquo;
                            </Link>
                        </span>
                    )}
                </div>
            </header>

            {/* Main Container */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
                <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-3xl border border-[#E6ECE6] dark:border-gray-800 shadow-[0_20px_50px_-12px_rgba(45,122,79,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">

                    {/* Left Hero Panel */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-[#EEFAF2] via-[#EAF4EF] to-[#EBF0FE] dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 p-8 lg:p-10 flex flex-col justify-between border-r border-[#E6ECE6] dark:border-gray-800 relative overflow-hidden">
                        {/* Background glowing circles */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#68D391]/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#3F49C8]/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border border-[#68D391]/40 dark:border-emerald-700/50 text-[#2D7A4F] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-xs">
                                <Sprout className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400" />
                                <span>{badgeText}</span>
                            </div>

                            {/* Title & Subtitle */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[#1A2E22] dark:text-white tracking-tight leading-snug">
                                    {heroTitle}
                                </h1>
                                <p className="text-sm text-[#4A5568] dark:text-gray-300 leading-relaxed mt-3">
                                    {heroSubtitle}
                                </p>
                            </div>

                            {/* Card Previews matching design */}
                            {leftVariant === 'login' && (
                                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 border border-[#68D391]/30 dark:border-emerald-700/40 shadow-md space-y-3 relative">
                                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> +40 XP hôm nay
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-[#E6FFFA] dark:bg-emerald-950/60 text-[#2D7A4F] dark:text-emerald-400 flex items-center justify-center font-extrabold text-xl shrink-0">
                                            🌱
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-[#1A2E22] dark:text-white truncate">JavaScript Core & Async</span>
                                                <span className="text-xs font-extrabold text-[#2D7A4F] dark:text-emerald-400 font-mono">72%</span>
                                            </div>
                                            <div className="w-full bg-[#E2E8F0] dark:bg-gray-700 h-2 rounded-full mt-1.5 overflow-hidden">
                                                <div className="bg-gradient-to-r from-[#68D391] to-[#2D7A4F] h-full w-[72%] rounded-full" />
                                            </div>
                                            <span className="text-[10px] text-[#718096] dark:text-gray-400 mt-1 block">Giai đoạn: Cây non đơm chồi mạnh</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-[#E6ECE6] dark:border-gray-700 flex items-center justify-between text-xs text-[#4A5568] dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#3F49C8] text-white text-[10px] font-bold flex items-center justify-center">
                                                AK
                                            </div>
                                            <span className="font-semibold text-[#1A2E22] dark:text-gray-200">Anh Khoa</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[#E53E3E] font-bold">
                                            <Flame className="w-4 h-4 fill-[#E53E3E]" />
                                            <span>Chuỗi 7 ngày</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {leftVariant === 'register' && (
                                <div className="space-y-3">
                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-3.5 border border-[#E6ECE6] dark:border-gray-700 flex items-center gap-3 shadow-xs">
                                        <div className="w-9 h-9 rounded-xl bg-[#E6FFFA] dark:bg-emerald-950/60 text-[#2D7A4F] dark:text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">🌱</div>
                                        <div>
                                            <h4 className="text-xs font-bold text-[#1A2E22] dark:text-white">Chọn kỹ năng muốn chinh phục</h4>
                                            <p className="text-[11px] text-[#718096] dark:text-gray-400">Front-end, Back-end, Python, SQL hay DevOps</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-3.5 border border-[#E6ECE6] dark:border-gray-700 flex items-center gap-3 shadow-xs">
                                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">⚡</div>
                                        <div>
                                            <h4 className="text-xs font-bold text-[#1A2E22] dark:text-white">Học code qua Quiz & Lab thực chiến</h4>
                                            <p className="text-[11px] text-[#718096] dark:text-gray-400">Tích lũy kinh nghiệm, duy trì streak không ngắt quãng</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-3.5 border border-[#E6ECE6] dark:border-gray-700 flex items-center gap-3 shadow-xs">
                                        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg shrink-0">🏆</div>
                                        <div>
                                            <h4 className="text-xs font-bold text-[#1A2E22] dark:text-white">Thu hoạch cây đại thụ & Chứng chỉ</h4>
                                            <p className="text-[11px] text-[#718096] dark:text-gray-400">Được công nhận bởi hệ sinh thái PLT Solutions</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {leftVariant === 'forgot' && (
                                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 border border-[#E6ECE6] dark:border-gray-700 shadow-xs space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#1A2E22] dark:text-white">
                                        <ShieldCheck className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400" />
                                        <span>Bảo toàn tiến độ học tập</span>
                                    </div>
                                    <p className="text-xs text-[#718096] dark:text-gray-400 leading-relaxed">
                                        Liên kết khôi phục chỉ có hiệu lực trong 15 phút và gửi duy nhất tới email đăng ký của bạn.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bottom Footer Note */}
                        <div className="relative z-10 pt-6 mt-6 border-t border-[#68D391]/20 dark:border-gray-700 flex items-center gap-2 text-xs text-[#4A5568] dark:text-gray-400">
                            <ShieldCheck className="w-4 h-4 text-[#2D7A4F] dark:text-emerald-400" />
                            <span>Hệ sinh thái đào tạo công nghệ chuẩn PLT Solutions</span>
                        </div>
                    </div>

                    {/* Right Form Area */}
                    <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-gray-900">
                        <div className="max-w-md mx-auto w-full">
                            {children}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
