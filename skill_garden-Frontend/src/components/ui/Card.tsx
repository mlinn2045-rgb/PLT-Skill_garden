import React from 'react'
import { clsx } from 'clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'subtle' | 'bordered' | 'glass'
    hoverEffect?: boolean
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    hoverEffect = false,
    className,
    ...props
}) => {
    const variants = {
        default: 'bg-white dark:bg-gray-800 border border-[#E6ECE6] dark:border-gray-700 shadow-[0_4px_20px_-2px_rgba(45,122,79,0.04)] text-[#1A2E22] dark:text-gray-100',
        subtle: 'bg-[#F7FAF7] dark:bg-gray-800/80 border border-[#E6ECE6] dark:border-gray-700 text-[#1A2E22] dark:text-gray-100',
        bordered: 'bg-white dark:bg-gray-800 border-2 border-[#E6ECE6] dark:border-gray-700 text-[#1A2E22] dark:text-gray-100',
        glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/60 dark:border-gray-700 shadow-lg text-[#1A2E22] dark:text-gray-100'
    }

    return (
        <div
            className={clsx(
                'rounded-2xl transition-all duration-200',
                variants[variant],
                hoverEffect && 'hover:shadow-[0_12px_28px_-4px_rgba(45,122,79,0.08)] hover:-translate-y-1',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
