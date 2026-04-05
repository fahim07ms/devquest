'use client'

import { FlagIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface FlagButtonProps {
    onClick: () => void
    className?: string
    // Pass 'inline' for action rows (comment/answer), 'standalone' for question body
    variant?: 'inline' | 'standalone'
}

export function FlagButton({ onClick, className, variant = 'inline' }: FlagButtonProps) {
    if (variant === 'standalone') {
        return (
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    'inline-flex items-center gap-1 text-xs text-muted-foreground/50',
                    'hover:text-destructive/70 transition-colors duration-150',
                    className
                )}
                title="Flag this content"
            >
                <FlagIcon className="h-3.5 w-3.5" />
                Flag
            </button>
        )
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-1 text-xs text-muted-foreground',
                'hover:text-destructive transition-colors duration-150',
                className
            )}
            title="Flag this content"
        >
            <FlagIcon className="h-3.5 w-3.5" />
            Flag
        </button>
    )
}