'use client'

import { Badge } from '@/components/ui/badge'
import type { Tag } from '@/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
    tag: Tag
    size?: 'sm' | 'md'
    clickable?: boolean
    className?: string
}

export function TagBadge({ tag, size = 'sm', clickable = true, className }: TagBadgeProps) {
    const styles = cn(
        'rounded-md border border-primary/20 bg-primary/8 text-primary font-mono',
        'transition-all hover:bg-primary/15 hover:border-primary/40 cursor-pointer',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        !clickable && 'pointer-events-none',
        className
    )

    if (clickable) {
        return (
            <Link href={`/questions?tags=${tag.name}`}>
                <Badge variant="outline" className={styles}>
                    {tag.name}
                </Badge>
            </Link>
        )
    }

    return (
        <Badge variant="outline" className={styles}>
            {tag.name}
        </Badge>
    )
}
