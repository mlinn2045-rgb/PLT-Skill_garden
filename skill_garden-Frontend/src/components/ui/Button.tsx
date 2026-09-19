import React from 'react'
import { clsx } from 'clsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'indigo' | 'secondary' | 'ghost' | 'streak' | 'outline' | 'success'
    size?: 'sm' | 'md' | 'lg'
    icon?: React.ReactNode
    iconRight?: React.ReactNode
    fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    fullWidth = false,
    className,
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]'

    const variants = {
        primary: 'bg-[#2D7A4F] text-white hover:bg-[#38A169] shadow-sm hover:shadow-md hover:-translate-y-0.5',
        indigo: 'bg-[#3F49C8] text-white hover:bg-[#323AA3] shadow-sm hover:shadow-md hover:-translate-y-0.5',
        secondary: 'bg-[#E6FFFA] text-[#2D7A4F] hover:bg-[#9AE6B4]/30 border border-[#68D391]',
        outline: 'bg-white text-[#1A2E22] hover:bg-[#F7FAF7] border border-[#E6ECE6] shadow-xs',
        ghost: 'bg-transparent text-[#4A5568] hover:bg-[#F3F6F3] hover:text-[#1A2E22]',
        streak: 'bg-[#ED8936] text-white hover:bg-[#DD6B20] shadow-sm hover:-translate-y-0.5',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md hover:-translate-y-0.5'
    }

    const sizes = {
        sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
        md: 'text-sm px-4 py-2.5 gap-2 h-11',
        lg: 'text-base px-6 py-3.5 gap-2.5 h-13'
    }

    return (
        <button
            className={clsx(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className
            )}
            disabled={disabled}
            {...props}
        >
            {icon && <span className="inline-flex shrink-0">{icon}</span>}
            <span>{children}</span>
            {iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
        </button>
    )
}
