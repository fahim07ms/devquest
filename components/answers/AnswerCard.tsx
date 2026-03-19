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
    children?: React.ReactNode // Comment thread slots here
    className?: string
}

export function AnswerCard({ answer, isQuestionAuthor, onAccept, children, className }: AnswerCardProps) {
    const timeAgo = formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })

    return (
        <div className={cn('flex gap-4 py-6 border-b border-border/50 last:border-0', className)}>
            {/* Left: Vote buttons & Accepted state */}
            <div className="flex flex-col items-center gap-3 w-10 flex-shrink-0">
                <VoteButtons score={answer.voteScore} contentId={answer.id} />

                {answer.isAccepted && (
                    <div title="Accepted Answer" className="text-emerald-500 bg-emerald-500/10 p-1 rounded-full">
                        <CheckCircle weight="fill" className="h-6 w-6" />
                    </div>
                )}
                {!answer.isAccepted && isQuestionAuthor && onAccept && (
                    <button
                        onClick={() => onAccept(answer.id)}
                        className="text-muted-foreground hover:text-emerald-500 transition-colors p-1"
                        title="Mark as accepted answer"
                    >
                        <CheckCircle className="h-6 w-6" />
                    </button>
                )}
            </div>

            {/* Right: Answer body, author, comments */}
            <div className="flex-1 min-w-0">
                <div className="text-foreground/90 mb-6">
                    <TiptapContent content={answer.body} />
                </div>

                <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                    <div className="flex-1" />
                    {/* Author Signature */}
                    <div className="bg-muted/40 rounded-lg p-3 min-w-[200px]">
                        <div className="text-xs text-muted-foreground mb-1.5">answered {timeAgo}</div>
                        <UserAvatar author={answer.author} size="sm" />
                    </div>
                </div>

                {/* Render comments */}
                {children}
            </div>
        </div>
    )
}
