import { cn } from '@/lib/utils'
import { X } from '@phosphor-icons/react'

interface PillProps {
    label: string
    className?: string
    onClick?: () => void
}

export default function Pill({ label, className, onClick }: PillProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
                'bg-primary/8 text-primary border border-primary/20',
                'transition-colors duration-150',
                className
            )}
        >
            <span>{label}</span>
            {onClick && (
                <button
                    type="button"
                    onClick={onClick}
                    className="flex-shrink-0 text-primary/60 hover:text-destructive transition-colors duration-150 rounded"
                    aria-label={`Remove ${label}`}
                >
                    <X className="h-3 w-3" weight="bold" />
                </button>
            )}
        </span>
    )
}