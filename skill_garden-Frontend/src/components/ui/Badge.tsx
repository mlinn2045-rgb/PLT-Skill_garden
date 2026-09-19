import React from 'react'
import { clsx } from 'clsx'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'skill' | 'streak' | 'xp' | 'level' | 'success' | 'warning' | 'info' | 'neutral' | 'indigo'
    size?: 'sm' | 'md'
    icon?: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'skill',
    size = 'md',
    icon,
    className,
    ...props
}) => {
    const variants = {
        skill: 'bg-[#E6FFFA] text-[#2D7A4F] border border-[#68D391]/30 font-mono',
        streak: 'bg-[#FFF5F5] text-[#E53E3E] border border-[#FEB2B2]',
        xp: 'bg-[#FEFCBF] text-[#B7791F] border border-[#F6E05E]',
        level: 'bg-[#EBF8FF] text-[#2B6CB0] border border-[#90CDF4]',
        success: 'bg-[#C6F6D5] text-[#22543D]',
        warning: 'bg-[#FEEBC8] text-[#744210]',
        info: 'bg-[#E0E7FF] text-[#3730A3]',
        neutral: 'bg-[#EDF2F7] text-[#4A5568]',
        indigo: 'bg-indigo-100 text-indigo-700'
    }

    const sizes = {
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-xs font-semibold px-2.5 py-1 gap-1.5'
    }

    return (
        <span
            className={clsx(
                'inline-flex items-center rounded-full font-medium tracking-wide transition-colors',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
        </span>
    )
}
