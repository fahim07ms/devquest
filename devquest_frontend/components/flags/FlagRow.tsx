'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowSquareOutIcon } from '@phosphor-icons/react'

interface FlagRowProps {
    flag: {
        id: string
        contentId: string
        reason: string
        flagCategory: string
        status: string
        createdAt: string
        reporter?: { username: string }
        moderator?: { username: string } | null
        contentType: 'question' | 'answer' | 'comment'
        // For answer flags, the backend returns the parent question's ID so we
        // can build the correct deep-link to the answer on the question page.
        questionId?: string | null
        suggestedDuplicateId?: string | null
    }
    onReview: (flag: FlagRowProps['flag']) => void
}

const STATUS_STYLES: Record<string, string> = {
    pending:      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    reviewed:     'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    rejected:     'bg-muted text-muted-foreground border-border/50',
    action_taken: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
}

const STATUS_LABELS: Record<string, string> = {
    pending:      'Pending',
    reviewed:     'Reviewed',
    rejected:     'Rejected',
    action_taken: 'Action taken',
}

const CATEGORY_LABELS: Record<string, string> = {
    spam:        'Spam',
    offensive:   'Offensive',
    duplicate:   'Duplicate',
    low_quality: 'Low quality',
    off_topic:   'Off topic',
    other:       'Other',
}

export function FlagRow({ flag, onReview }: FlagRowProps) {

    // Build the URL that takes the moderator directly to the flagged content.
    // Answers and comments need the parent question's ID — supplied by the backend.
    const getContentPath = () => {
        if (flag.contentType === 'question') {
            return `/questions/${flag.contentId}`
        }

        // For answers/comments we need the parent question ID.
        // If it's somehow missing, fall back to the content ID as a best-effort.
        const baseQuestionId = flag.questionId ?? flag.contentId

        if (flag.contentType === 'answer') {
            return `/questions/${baseQuestionId}#answer-${flag.contentId}`
        }

        // Comments can live under a question or an answer; the parent question
        // ID gives us the right page — the anchor scrolls to the specific comment.
        return `/questions/${baseQuestionId}#comment-${flag.contentId}`
    }

    return (
        <div
            className={cn(
                'group grid grid-cols-[1fr_auto] gap-4 py-4 border-b border-border/40 last:border-0',
                'hover:bg-muted/20 -mx-4 px-4 transition-colors duration-150'
            )}
        >
            <div className="min-w-0 space-y-1.5">
                {/* Category + status badges */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 border border-border/40">
                        {CATEGORY_LABELS[flag.flagCategory] ?? flag.flagCategory}
                    </span>
                    <span
                        className={cn(
                            'text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 border',
                            STATUS_STYLES[flag.status] ?? STATUS_STYLES['pending']
                        )}
                    >
                        {STATUS_LABELS[flag.status] ?? flag.status}
                    </span>
                    {/* Content type pill so moderators know what they're looking at */}
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 border border-border/30">
                        {flag.contentType}
                    </span>
                </div>

                {/* Reason */}
                <p className="text-sm text-foreground leading-snug line-clamp-2">
                    {flag.reason}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/60">
                    <span>
                        Flagged by{' '}
                        <Link
                            href={`/users/${flag.reporter?.username}`}
                            className="text-foreground/80 hover:text-primary transition-colors"
                        >
                            @{flag.reporter?.username ?? 'unknown'}
                        </Link>
                    </span>
                    <span>{formatDistanceToNow(new Date(flag.createdAt), { addSuffix: true })}</span>
                    {flag.moderator && (
                        <span>
                            Reviewed by{' '}
                            <span className="text-foreground/80">@{flag.moderator.username}</span>
                        </span>
                    )}
                    <Link
                        href={getContentPath()}
                        className="inline-flex items-center gap-0.5 hover:text-primary transition-colors"
                        target="_blank"
                    >
                        View content
                        <ArrowSquareOutIcon className="h-3 w-3" />
                    </Link>
                    {flag.suggestedDuplicateId && (
                        <Link
                            href={`/questions/${flag.suggestedDuplicateId}`}
                            className="inline-flex items-center gap-0.5 hover:text-amber-600 transition-colors text-amber-600/80"
                            target="_blank"
                        >
                            View duplicate target
                            <ArrowSquareOutIcon className="h-3 w-3" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Review button */}
            <div className="flex items-start pt-0.5">
                <button
                    type="button"
                    onClick={() => onReview(flag)}
                    className={cn(
                        'text-xs font-medium px-3 py-1.5 border transition-colors duration-150',
                        flag.status === 'pending'
                            ? 'border-primary/30 text-primary hover:bg-primary/5'
                            : 'border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    )}
                >
                    {flag.status === 'pending' ? 'Review' : 'Edit'}
                </button>
            </div>
        </div>
    )
}