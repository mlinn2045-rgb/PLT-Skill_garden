import React from 'react'

interface PltLogoProps {
    variant?: 'full' | 'mark' | 'horizontal'
    className?: string
    height?: number | string
    color?: string
}

export const PltLogo: React.FC<PltLogoProps> = ({
    variant = 'full',
    className = '',
    height = 40,
    color = '#2F3C96' // Royal Blue from image
}) => {
    if (variant === 'mark') {
        return (
            <svg
                viewBox="0 0 160 110"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`inline-block ${className}`}
                style={{ height }}
            >
                <text
                    x="50%"
                    y="80"
                    textAnchor="middle"
                    fill={color}
                    fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    fontWeight="900"
                    fontSize="105"
                    letterSpacing="-4"
                >
                    PLT
                </text>
            </svg>
        )
    }

    if (variant === 'horizontal') {
        return (
            <div className={`inline-flex items-center gap-2.5 ${className}`}>
                <div className="flex flex-col">
                    <span
                        className="font-black leading-none tracking-tight text-xl"
                        style={{ color, fontFamily: "system-ui, -apple-system, sans-serif" }}
                    >
                        PLT
                    </span>
                    <span
                        className="text-[9px] font-extrabold tracking-[0.32em] leading-tight uppercase mt-0.5"
                        style={{ color }}
                    >
                        SOLUTIONS
                    </span>
                </div>
            </div>
        )
    }

    // Default 'full' stacked version matching image
    return (
        <div className={`inline-flex flex-col items-center select-none ${className}`}>
            <svg
                viewBox="0 0 340 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
                style={{ maxHeight: height }}
            >
                {/* PLT Main Letters */}
                <text
                    x="50%"
                    y="110"
                    textAnchor="middle"
                    fill={color}
                    fontFamily="'Impact', 'Arial Black', 'Helvetica Neue', system-ui, sans-serif"
                    fontWeight="900"
                    fontSize="135"
                    letterSpacing="-1"
                >
                    PLT
                </text>

                {/* SOLUTIONS Subtext */}
                <text
                    x="50%"
                    y="152"
                    textAnchor="middle"
                    fill={color}
                    fontFamily="'Arial', 'Helvetica Neue', system-ui, sans-serif"
                    fontWeight="800"
                    fontSize="28"
                    letterSpacing="11"
                >
                    SOLUTIONS
                </text>
            </svg>
        </div>
    )
}
