'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Question } from '@/types'
import { TagBadge } from '@/components/ui/TagBadge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { cn } from '@/lib/utils'
import { Eye, ChatDots, ArrowFatUp } from '@phosphor-icons/react'

interface QuestionCardProps {
    question: Question
    className?: string
}

function StatPill({
    value,
    label,
    icon: Icon,
    highlight,
}: {
    value: number
    label: string
    icon: React.ElementType
    highlight?: boolean
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-lg px-3 py-2 text-center min-w-[56px]',
                highlight ? 'bg-primary/10 text-primary' : 'bg-muted/60 text-muted-foreground'
            )}
        >
            <Icon className="h-3.5 w-3.5 mb-0.5" />
            <span className="font-bold text-sm leading-tight text-foreground">{value}</span>
            <span className="text-[10px] leading-tight">{label}</span>
        </div>
    )
}

export function QuestionCard({ question, className }: QuestionCardProps) {
    const timeAgo = formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })

    return (
        <div
            className={cn(
                'group relative rounded-xl border border-border bg-card p-5',
                'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
                'transition-all duration-200',
                className
            )}
        >
            {/* Left stats column */}
            <div className="flex gap-4">
                <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
                    <StatPill value={question.voteScore} label="votes" icon={ArrowFatUp} highlight={question.voteScore > 0} />
                    <StatPill value={question.answersCount} label="answers" icon={ChatDots} highlight={question.answersCount > 0} />
                    <StatPill value={question.viewCount} label="views" icon={Eye} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <Link
                        href={`/questions/${question.id}`}
                        className="block group-hover:text-primary transition-colors"
                    >
                        <h2 className="text-base font-semibold text-foreground line-clamp-2 leading-snug mb-2">
                            {question.title}
                        </h2>
                    </Link>

                    {/* Tags */}
                    {question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {question.tags.slice(0, 5).map((tag) => (
                                <TagBadge key={tag.id} tag={tag} />
                            ))}
                        </div>
                    )}

                    {/* Mobile stats */}
                    <div className="flex sm:hidden gap-3 text-xs text-muted-foreground mb-2">
                        <span>{question.voteScore} votes</span>
                        <span>{question.answersCount} answers</span>
                        <span>{question.viewCount} views</span>
                    </div>

                    {/* Footer: author + time */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <UserAvatar author={question.author} size="sm" timestamp={question.createdAt} />
                        <span className="text-xs text-muted-foreground hidden sm:block">{timeAgo}</span>
                    </div>
                </div>
            </div>

            {/* Hover gradient accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}
