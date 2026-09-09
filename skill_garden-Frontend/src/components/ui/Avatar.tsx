import React from 'react'
import { clsx } from 'clsx'

export interface AvatarProps {
    src?: string
    name: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    status?: 'online' | 'offline'
    levelBadge?: string | number
    className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    name,
    size = 'md',
    status,
    levelBadge,
    className
}) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg'
    }

    const getInitials = (nameStr: string) => {
        return nameStr
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    return (
        <div className="relative inline-block shrink-0">
            <div
                className={clsx(
                    'rounded-full overflow-hidden bg-[#2D7A4F] text-white flex items-center justify-center font-bold ring-2 ring-white shadow-xs',
                    sizes[size],
                    className
                )}
            >
                {src ? (
                    <img src={src} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span>{getInitials(name)}</span>
                )}
            </div>

            {status && (
                <span
                    className={clsx(
                        'absolute bottom-0 right-0 rounded-full border-2 border-white',
                        size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5',
                        status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
                    )}
                />
            )}

            {levelBadge !== undefined && (
                <span className="absolute -top-1 -right-1 bg-[#3F49C8] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                    {levelBadge}
                </span>
            )}
        </div>
    )
}
