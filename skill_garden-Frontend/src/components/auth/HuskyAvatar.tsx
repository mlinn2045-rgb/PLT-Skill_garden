import React, { useMemo } from 'react'

interface HuskyAvatarProps {
    /** Độ dài chuỗi ký tự trong ô Tên đăng nhập / Email để tròng mắt liếc */
    textLength: number
    /** Trạng thái focus vào ô mật khẩu (hai tay nâng lên che mắt) */
    isPasswordFocused: boolean
    /** Trạng thái ẩn/hiện mật khẩu (nếu đang hiện thì hé mắt nhìn trộm) */
    isPasswordVisible?: boolean
    /** Custom class nếu cần */
    className?: string
}

export const HuskyAvatar: React.FC<HuskyAvatarProps> = ({
    textLength,
    isPasswordFocused,
    isPasswordVisible = false,
    className = ''
}) => {
    // Tính toán góc liếc của tròng mắt theo độ dài ký tự nhập
    const eyeOffset = useMemo<{ x: number; y: number }>(() => {
        if (textLength === 0) {
            return { x: 0, y: 0 }
        }
        // Giới hạn biên độ liếc mắt mượt mà từ -4px đến +4px
        const x = Math.min(Math.max((textLength - 10) * 0.4, -4), 4)
        const y = 1.8 // Hơi nhìn chúc nhẹ xuống bàn phím
        return { x, y }
    }, [textLength])

    // Tính toán vị trí bàn chân (Paws)
    const pawStyles = useMemo<{
        left: React.CSSProperties
        right: React.CSSProperties
    }>(() => {
        if (!isPasswordFocused) {
            // Trạng thái nghỉ: 2 bàn chân tì nhẹ lên mép card
            return {
                left: {
                    transform: 'translateY(16px) scale(0.96)',
                    opacity: 1
                },
                right: {
                    transform: 'translateY(16px) scale(0.96)',
                    opacity: 1
                }
            }
        }

        if (isPasswordVisible) {
            // Trạng thái hé mắt nhìn trộm khi bật nút "Hiện mật khẩu"
            return {
                left: {
                    transform: 'translateY(-34px) translateX(10px) rotate(8deg) scale(0.96)',
                    opacity: 1
                },
                right: {
                    transform: 'translateY(-34px) translateX(-10px) rotate(-8deg) scale(0.96)',
                    opacity: 1
                }
            }
        }

        // Trạng thái che kín mắt khi nhập mật khẩu
        return {
            left: {
                transform: 'translateY(-50px) translateX(24px) rotate(16deg) scale(1)',
                opacity: 1
            },
            right: {
                transform: 'translateY(-50px) translateX(-24px) rotate(-16deg) scale(1)',
                opacity: 1
            }
        }
    }, [isPasswordFocused, isPasswordVisible])

    return (
        <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
            <svg
                viewBox="0 0 200 200"
                className="w-32 h-32 sm:w-36 sm:h-36 overflow-visible drop-shadow-xl"
                aria-hidden="true"
            >
                <defs>
                    <filter id="husky-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.35" />
                    </filter>
                    <filter id="paw-shadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.28" />
                    </filter>
                    <linearGradient id="sprout-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ADE80" />
                        <stop offset="100%" stopColor="#16A34A" />
                    </linearGradient>
                </defs>

                {/* 1. MẦM CÂY TRÊN ĐỈNH ĐẦU (Đặc trưng SkillGarden) 🌱 */}
                <g id="husky-sprout">
                    {/* Thân cây mầm */}
                    <path
                        d="M 100 50 Q 100 38 100 30"
                        stroke="#16A34A"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        fill="none"
                    />
                    {/* Chiếc lá bên trái */}
                    <path
                        d="M 100 36 C 91 32 87 24 90 19 C 97 20 99 27 100 36 Z"
                        fill="url(#sprout-leaf)"
                    />
                    {/* Chiếc lá bên phải */}
                    <path
                        d="M 100 36 C 109 32 113 24 110 19 C 103 20 101 27 100 36 Z"
                        fill="#22C55E"
                    />
                    <circle cx="100" cy="48" r="2.5" fill="#15803D" />
                </g>

                {/* 2. ĐÔI TAI DỰNG DỄ THƯƠNG */}
                {/* Tai trái */}
                <polygon points="40,88 20,24 82,54" fill="#252B3B" />
                <polygon points="41,84 25,30 78,56" fill="#F1F5F9" />
                <polygon points="43,80 29,36 74,58" fill="#FDA4AF" />

                {/* Tai phải */}
                <polygon points="160,88 180,24 118,54" fill="#252B3B" />
                <polygon points="159,84 175,30 122,56" fill="#F1F5F9" />
                <polygon points="157,80 171,36 126,58" fill="#FDA4AF" />

                {/* 3. KHỐI ĐẦU BẦU BĨNH LỚP TỐI NGOÀI */}
                <ellipse cx="100" cy="104" rx="65" ry="59" fill="#252B3B" filter="url(#husky-glow)" />

                {/* 4. MẢNG MẶT MÀU TRẮNG SÁNG */}
                <path
                    d="M 55,108 C 53,74 74,66 100,80 C 126,66 147,74 145,108 C 145,142 126,154 100,154 C 74,154 55,142 55,108 Z"
                    fill="#FFFFFF"
                />

                {/* 5. HOA VĂN TRÁN HUSKY CHUẨN MẪU (Dải tối + Chấm tròn trắng ở giữa) */}
                {/* Dải tối trung tâm trán */}
                <path d="M 91,58 L 109,58 L 106,94 L 100,102 L 94,94 Z" fill="#252B3B" />
                {/* Chấm tròn trắng đặc trưng giữa trán */}
                <circle cx="100" cy="72" r="5" fill="#FFFFFF" />

                {/* 6. MÁ HỒNG PHẤN BLUSH DỄ THƯƠNG HAI BÊN */}
                <ellipse cx="64" cy="122" rx="7.5" ry="4.5" fill="#FDA4AF" opacity="0.6" />
                <ellipse cx="136" cy="122" rx="7.5" ry="4.5" fill="#FDA4AF" opacity="0.6" />

                {/* 7. MẮT TRÁI (Lòng trắng to tròn + Tròng đen Anime long lanh) */}
                <g id="left-eye">
                    <circle cx="75" cy="110" r="14" fill="#FFFFFF" stroke="#1E2330" strokeWidth="2.2" />
                    <g
                        style={{
                            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                            transition: 'transform 0.12s ease-out'
                        }}
                    >
                        {/* Tròng đen */}
                        <circle cx="75" cy="110" r="9" fill="#111827" />
                        {/* Đốm sáng lớn góc trên trái */}
                        <circle cx="72.5" cy="107.5" r="3.3" fill="#FFFFFF" />
                        {/* Đốm sáng nhỏ góc dưới phải */}
                        <circle cx="77.5" cy="112.5" r="1.5" fill="#FFFFFF" />
                    </g>
                </g>

                {/* 8. MẮT PHẢI (Lòng trắng to tròn + Tròng đen Anime long lanh) */}
                <g id="right-eye">
                    <circle cx="125" cy="110" r="14" fill="#FFFFFF" stroke="#1E2330" strokeWidth="2.2" />
                    <g
                        style={{
                            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                            transition: 'transform 0.12s ease-out'
                        }}
                    >
                        {/* Tròng đen */}
                        <circle cx="125" cy="110" r="9" fill="#111827" />
                        {/* Đốm sáng lớn góc trên trái */}
                        <circle cx="122.5" cy="107.5" r="3.3" fill="#FFFFFF" />
                        {/* Đốm sáng nhỏ góc dưới phải */}
                        <circle cx="127.5" cy="112.5" r="1.5" fill="#FFFFFF" />
                    </g>
                </g>

                {/* 9. MŨI, MIỆNG VÀ CHIẾC LƯỠI HỒNG THÈ RA 👅 */}
                {/* Mũi đen bo tròn */}
                <path
                    d="M 94,120 C 94,117.5 106,117.5 106,120 C 106,124 102,126 100,126 C 98,126 94,124 94,120 Z"
                    fill="#111827"
                />
                {/* Đường nhân trung */}
                <path d="M 100 126 L 100 130" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
                {/* Chiếc lưỡi hồng thè ra ngộ nghĩnh */}
                <path
                    d="M 97 131 C 97 137.5 103 137.5 103 131 Z"
                    fill="#FB7185"
                    stroke="#E11D48"
                    strokeWidth="0.8"
                />
                {/* Đường cong khóe môi W */}
                <path
                    d="M 93 130 Q 96.5 133.5 100 130.5 Q 103.5 133.5 107 130"
                    stroke="#111827"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* 10. HAI BÀN CHÂN (PAWS) TÌ LÊN MÉP CARD - CHE MẮT KHI FOCUS MẬT KHẨU */}
                {/* Bàn chân trái */}
                <g
                    id="paw-left"
                    filter="url(#paw-shadow)"
                    style={{
                        transformOrigin: '68px 162px',
                        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s',
                        ...pawStyles.left
                    }}
                >
                    <ellipse cx="68" cy="162" rx="17" ry="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                    {/* Đệm chính màu hồng phấn */}
                    <ellipse cx="68" cy="165" rx="6.5" ry="5" fill="#FDA4AF" />
                    {/* 3 đệm ngón nhỏ xinh */}
                    <circle cx="59.5" cy="160.5" r="2.8" fill="#FDA4AF" />
                    <circle cx="68" cy="155.5" r="2.8" fill="#FDA4AF" />
                    <circle cx="76.5" cy="160.5" r="2.8" fill="#FDA4AF" />
                </g>

                {/* Bàn chân phải */}
                <g
                    id="paw-right"
                    filter="url(#paw-shadow)"
                    style={{
                        transformOrigin: '132px 162px',
                        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s',
                        ...pawStyles.right
                    }}
                >
                    <ellipse cx="132" cy="162" rx="17" ry="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                    {/* Đệm chính màu hồng phấn */}
                    <ellipse cx="132" cy="165" rx="6.5" ry="5" fill="#FDA4AF" />
                    {/* 3 đệm ngón nhỏ xinh */}
                    <circle cx="123.5" cy="160.5" r="2.8" fill="#FDA4AF" />
                    <circle cx="132" cy="155.5" r="2.8" fill="#FDA4AF" />
                    <circle cx="140.5" cy="160.5" r="2.8" fill="#FDA4AF" />
                </g>
            </svg>
        </div>
    )
}
