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
        skill: 'bg-[#E6FFFA] dark:bg-emerald-950/80 text-[#2D7A4F] dark:text-emerald-300 border border-[#68D391]/30 dark:border-emerald-800/80 font-mono',
        streak: 'bg-[#FFF5F5] dark:bg-rose-950/80 text-[#E53E3E] dark:text-rose-300 border border-[#FEB2B2] dark:border-rose-800/80',
        xp: 'bg-[#FEFCBF] dark:bg-amber-950/80 text-[#B7791F] dark:text-amber-300 border border-[#F6E05E] dark:border-amber-800/80',
        level: 'bg-[#EBF8FF] dark:bg-sky-950/80 text-[#2B6CB0] dark:text-sky-300 border border-[#90CDF4] dark:border-sky-800/80',
        success: 'bg-[#C6F6D5] dark:bg-emerald-950/80 text-[#22543D] dark:text-emerald-300 border border-transparent dark:border-emerald-800/80',
        warning: 'bg-[#FEEBC8] dark:bg-amber-950/80 text-[#744210] dark:text-amber-300 border border-transparent dark:border-amber-800/80',
        info: 'bg-[#E0E7FF] dark:bg-indigo-950/80 text-[#3730A3] dark:text-indigo-300 border border-transparent dark:border-indigo-800/80',
        neutral: 'bg-[#EDF2F7] dark:bg-gray-800 text-[#4A5568] dark:text-gray-300 border border-transparent dark:border-gray-700',
        indigo: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-transparent dark:border-indigo-800/80'
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
