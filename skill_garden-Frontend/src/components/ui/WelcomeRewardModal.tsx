import React, { useState } from 'react'
import { Sparkles, Gift, Zap, CheckCircle2, Sprout, ArrowRight } from 'lucide-react'
import { Button } from './Button'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../stores/authStore'
import { addStudentXp } from '../../services/studentStats'

interface WelcomeRewardModalProps {
    isOpen: boolean
    onClose: () => void
}

export const WelcomeRewardModal: React.FC<WelcomeRewardModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuthStore()
    const [isClaiming, setIsClaiming] = useState(false)
    const [isClaimedSuccess, setIsClaimedSuccess] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    if (!isOpen) return null

    const handleClaim = async () => {
        setIsClaiming(true)
        setErrorMsg('')
        try {
            const res = await authService.claimWelcomeXp()
            if (res.success && res.data) {
                // Update local student stats
                if (user?.email) {
                    addStudentXp(user.email, 100)
                }

                // Update Zustand auth store
                updateUser({
                    total_xp: res.data.total_xp,
                    has_claimed_welcome_xp: true,
                })

                setIsClaimedSuccess(true)

                // Auto close after celebration animation
                setTimeout(() => {
                    onClose()
                }, 2000)
            } else {
                setErrorMsg(res.message || 'Không thể nhận quà tặng lúc này.')
            }
        } catch (err: any) {
            // If already claimed, sync state and close
            if (err.message && err.message.includes('rồi')) {
                updateUser({ has_claimed_welcome_xp: true })
                setTimeout(() => onClose(), 1500)
            }
            setErrorMsg(err.message || 'Lỗi khi nhận thưởng 100 XP.')
        } finally {
            setIsClaiming(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div
                className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Background Glows */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Hero Icon */}
                <div className="relative mx-auto mb-5 w-20 h-20 sm:w-24 sm:h-24">
                    <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white animate-bounce-short">
                        {isClaimedSuccess ? (
                            <CheckCircle2 className="w-12 h-12 text-white animate-scale-in" />
                        ) : (
                            <Gift className="w-12 h-12 text-white" />
                        )}
                    </div>
                    <div className="absolute -top-1 -right-1 p-1.5 bg-amber-400 text-amber-950 rounded-full shadow-md animate-pulse">
                        <Sparkles className="w-4 h-4" />
                    </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2 mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                        <Sprout className="w-3.5 h-3.5" /> Quà Tặng Tân Thủ
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#1A2E22] dark:text-white tracking-tight">
                        {isClaimedSuccess ? 'Nhận Thưởng Thành Công! 🎉' : 'Chào Mừng Đến Với SkillGarden! 🎉'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#4A5568] dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
                        {isClaimedSuccess
                            ? '100 XP đã được cộng vào tài khoản của bạn. Chúc bạn có những giờ học thú vị!'
                            : 'Chúc mừng bạn đã gia nhập hệ thống SkillGarden. Hãy nhận ngay 100 XP khởi đầu để kích hoạt mầm cây kỹ năng đầu tiên của bạn!'}
                    </p>
                </div>

                {/* Reward Highlight Badge */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800/80 border border-amber-200 dark:border-gray-700 flex items-center justify-center gap-3 shadow-inner">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md">
                        <Zap className="w-6 h-6 fill-white text-white" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-semibold text-[#718096] dark:text-gray-400 uppercase tracking-wider">
                            Phần thưởng chào mừng
                        </div>
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                            +100 Điểm XP
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 text-center animate-shake">
                        {errorMsg}
                    </div>
                )}

                {/* Action Button */}
                {isClaimedSuccess ? (
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-sm font-bold rounded-2xl flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span>Đã cộng +100 XP vào tài khoản</span>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="primary"
                        fullWidth
                        size="lg"
                        disabled={isClaiming}
                        onClick={handleClaim}
                        className="py-3.5 text-base font-extrabold rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-95"
                    >
                        {isClaiming ? (
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang cộng điểm thưởng...
                            </span>
                        ) : (
                            <>
                                <span>Nhận Thưởng Ngay (+100 XP)</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>
                )}

                {/* Small disclaimer */}
                <p className="mt-4 text-[11px] text-[#A0AEC0] dark:text-gray-500">
                    * Mỗi tài khoản học viên chỉ nhận phần thưởng khởi đầu duy nhất 1 lần.
                </p>
            </div>
        </div>
    )
}
