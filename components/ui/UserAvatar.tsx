'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Author } from '@/types'
import { cn } from '@/lib/utils'
import Link from "next/link";

interface UserAvatarProps {
    author: Author
    size?: 'sm' | 'md' | 'lg'
    showName?: boolean
    timestamp?: string
    className?: string
}

const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
}

const textSizeMap = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
}

function getInitials(author: Author): string {
    return [author.firstName, author.lastName]
        .filter(Boolean)
        .map((n) => n![0].toUpperCase())
        .join('') || author.username?.slice(0, 2).toUpperCase() || 'DQ'
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function UserAvatar({ author, size = 'md', showName = true, timestamp, className }: UserAvatarProps) {
    const displayName = [author.firstName, author.lastName].filter(Boolean).join(' ') || author.username || 'Anonymous'

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Avatar className={cn(sizeMap[size], 'ring-2 ring-primary/10 flex-shrink-0')}>
                <AvatarImage src={author.profilePicture || ''} alt={displayName} />
                <AvatarFallback className={cn('bg-primary/10 text-primary font-semibold', textSizeMap[size])}>
                    {getInitials(author)}
                </AvatarFallback>
            </Avatar>
            {showName && (
                <div className="flex flex-col leading-tight">
                    <Link href={`/users/${author.username}`} className="flex items-center gap-1">
                        <span className={cn('font-medium text-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
                            {displayName}
                        </span>
                    </Link>
                    {timestamp && (
                        <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(timestamp)}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
