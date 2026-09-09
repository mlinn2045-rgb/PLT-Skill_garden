import React from 'react'

export interface CircularProgressProps {
    percentage: number
    size?: number
    strokeWidth?: number
    label?: string
    sublabel?: string
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    percentage,
    size = 140,
    strokeWidth = 12,
    label,
    sublabel
}) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E2E8F0"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#68D391" />
                        <stop offset="100%" stopColor="#2D7A4F" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-[#1A2E22] tracking-tight">
                    {percentage}%
                </span>
                {label && <span className="text-[11px] font-semibold text-[#4A5568] uppercase tracking-wider mt-0.5">{label}</span>}
                {sublabel && <span className="text-[10px] text-[#718096]">{sublabel}</span>}
            </div>
        </div>
    )
}
