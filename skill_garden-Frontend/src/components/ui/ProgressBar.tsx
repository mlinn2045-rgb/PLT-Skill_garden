import React from 'react'
import { clsx } from 'clsx'

export interface ProgressBarProps {
    progress: number // 0 to 100
    size?: 'sm' | 'md' | 'lg'
    color?: 'green' | 'indigo' | 'orange'
    showLabel?: boolean
    className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    size = 'md',
    color = 'green',
    showLabel = false,
    className
}) => {
    const clampedProgress = Math.min(100, Math.max(0, progress))

    const heights = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4'
    }

    const colors = {
        green: 'bg-gradient-to-r from-[#68D391] to-[#2D7A4F]',
        indigo: 'bg-gradient-to-r from-[#6366F1] to-[#3F49C8]',
        orange: 'bg-gradient-to-r from-[#F6AD55] to-[#ED8936]'
    }

    return (
        <div className={clsx('w-full flex items-center gap-3', className)}>
            <div className={clsx('w-full bg-[#E2E8F0] rounded-full overflow-hidden', heights[size])}>
                <div
                    className={clsx('h-full rounded-full transition-all duration-500 ease-out', colors[color])}
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-xs font-semibold text-[#4A5568] shrink-0 font-mono">
                    {clampedProgress}%
                </span>
            )}
        </div>
    )
}
