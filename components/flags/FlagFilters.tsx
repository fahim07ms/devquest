'use client'

import { cn } from '@/lib/utils'
import { XIcon } from '@phosphor-icons/react'

const STATUS_OPTIONS = [
    { value: '',             label: 'All' },
    { value: 'pending',      label: 'Pending' },
    { value: 'reviewed',     label: 'Reviewed' },
    { value: 'rejected',     label: 'Rejected' },
    { value: 'action_taken', label: 'Action taken' },
]

const CATEGORY_OPTIONS = [
    { value: '',           label: 'All categories' },
    { value: 'spam',       label: 'Spam' },
    { value: 'offensive',  label: 'Offensive' },
    { value: 'duplicate',  label: 'Duplicate' },
    { value: 'low_quality',label: 'Low quality' },
    { value: 'off_topic',  label: 'Off topic' },
    { value: 'other',      label: 'Other' },
]

interface FlagFiltersProps {
    status:         string
    category:       string
    onStatusChange: (value: string) => void
    onCategoryChange:(value: string) => void
    onClearAll:     () => void
}

export function FlagFilters({
                                status,
                                category,
                                onStatusChange,
                                onCategoryChange,
                                onClearAll,
                            }: FlagFiltersProps) {
    const hasActive = !!status || !!category

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Status tabs */}
            <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 border border-border/40">
                {STATUS_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onStatusChange(opt.value)}
                        className={cn(
                            'px-3 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap',
                            status === opt.value
                                ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Category select */}
            <select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className={cn(
                    'h-8 px-2 text-xs bg-background border border-border/40',
                    'outline-none focus:border-primary/50 transition-colors duration-150',
                    'text-muted-foreground',
                    category && 'text-foreground border-primary/30 bg-primary/5'
                )}
            >
                {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Clear all */}
            {hasActive && (
                <button
                    type="button"
                    onClick={onClearAll}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors duration-150"
                >
                    <XIcon className="h-3 w-3" />
                    Clear
                </button>
            )}
        </div>
    )
}