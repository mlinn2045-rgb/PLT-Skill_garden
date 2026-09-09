import React from 'react'
import { clsx } from 'clsx'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    iconLeft?: React.ReactNode
    iconRight?: React.ReactNode
    containerClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    helperText,
    iconLeft,
    iconRight,
    containerClassName,
    className,
    id,
    ...props
}, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
        <div className={clsx('flex flex-col gap-1.5 w-full', containerClassName)}>
            {label && (
                <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-[#4A5568]">
                    {label}
                </label>
            )}

            <div className="relative flex items-center w-full">
                {iconLeft && (
                    <span className="absolute left-3.5 text-[#718096] flex items-center pointer-events-none">
                        {iconLeft}
                    </span>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    className={clsx(
                        'w-full h-11 px-4 rounded-xl bg-[#F7FAF7] border text-sm text-[#1A2E22] placeholder:text-[#A0AEC0] transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#2D7A4F] focus:ring-3 focus:ring-[#68D391]/25',
                        iconLeft && 'pl-10',
                        iconRight && 'pr-10',
                        error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[#E2E8F0]',
                        className
                    )}
                    {...props}
                />

                {iconRight && (
                    <span className="absolute right-3.5 text-[#718096] flex items-center">
                        {iconRight}
                    </span>
                )}
            </div>

            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
            {!error && helperText && <span className="text-xs text-[#718096]">{helperText}</span>}
        </div>
    )
})

Input.displayName = 'Input'
