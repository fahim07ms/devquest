'use client'

import { formatDistanceToNow } from 'date-fns'
import type { Answer } from '@/types'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { TiptapContent } from '@/components/editor/TiptapContent'
import { VoteButtons } from '@/components/questions/VoteButtons'
import { CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AnswerCardProps {
    answer: Answer
    isQuestionAuthor?: boolean
    onAccept?: (answerId: string) => void
    children?: React.ReactNode
    className?: string
}

export function AnswerCard({ answer, isQuestionAuthor, onAccept, children, className }: AnswerCardProps) {
    const timeAgo = formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })

    return (
        <div
            className={cn(
                'group relative flex gap-5 py-7 border-b border-border/40 last:border-0',
                answer.isAccepted && 'bg-emerald-500/[0.03] rounded-xl px-4 -mx-4',
                className
            )}
        >
            {/* Accepted accent bar */}
            {answer.isAccepted && (
                <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-emerald-500/50 rounded-full" />
            )}

            {/* ── Vote column ── */}
            <div className="flex flex-col items-center gap-2.5 w-10 flex-shrink-0 pt-0.5">
                <VoteButtons score={answer.voteScore} contentId={answer.id} />

                {answer.isAccepted ? (
                    <div
                        title="Accepted answer"
                        className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-full mt-1"
                    >
                        <CheckCircle weight="fill" className="h-5 w-5" />
                    </div>
                ) : isQuestionAuthor && onAccept ? (
                    <button
                        onClick={() => onAccept(answer.id)}
                        title="Mark as accepted"
                        className="text-muted-foreground/40 hover:text-emerald-500 transition-colors duration-150 p-1.5 rounded-full hover:bg-emerald-500/10 mt-1"
                    >
                        <CheckCircle className="h-5 w-5" />
                    </button>
                ) : null}
            </div>

            {/* ── Body ── */}
            <div className="flex-1 min-w-0">
                {/* Answer content */}
                <div className="text-foreground/90 text-sm leading-relaxed mb-6">
                    <TiptapContent content={answer.body} />
                </div>

                {/* Author row */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {/* placeholder for edit/share actions if needed */}
                    </div>

                    <div className="flex items-center gap-2.5 bg-muted/30 border border-border/40 rounded-lg px-3 py-2">
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground/70 leading-none mb-1">answered {timeAgo}</p>
                        </div>
                        <UserAvatar author={answer.author} size="sm" />
                    </div>
                </div>

                {/* Comment thread slot */}
                {children && (
                    <div className="mt-5 pt-4 border-t border-border/30">
                        {children}
                    </div>
                )}
            </div>
        </div>
    )
}