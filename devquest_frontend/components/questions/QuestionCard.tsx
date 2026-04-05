'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Question } from '@/types'
import { TagBadge } from '@/components/ui/TagBadge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { cn } from '@/lib/utils'
import { EyeIcon, ChatDotsIcon, ArrowFatUpIcon } from '@phosphor-icons/react'

interface QuestionCardProps {
    question: Question
    className?: string
}

// Plain-text extractor for TipTap JSON
// Walks the ProseMirror node tree and collects text content only.
// Skips code blocks — raw code is noisy in a preview.
function extractPlainText(node: any, limit = 200): string {
    if (!node) return ''
    if (node.type === 'text' && typeof node.text === 'string') return node.text
    if (node.type === 'codeBlock' || node.type === 'image') return ''
    if (Array.isArray(node.content)) {
        let result = ''
        for (const child of node.content) {
            result += extractPlainText(child, limit)
            if (result.length >= limit) break
        }
        return result
    }
    return ''
}

// Extracts a preview of the question body.
function getBodyPreview(body: any, limit = 160): string {
    if (!body || typeof body !== 'object') return ''
    const raw = extractPlainText(body, limit + 40)
    const trimmed = raw.replace(/\s+/g, ' ').trim()
    if (!trimmed) return ''
    if (trimmed.length <= limit) return trimmed
    return trimmed.slice(0, limit).replace(/\s+\S*$/, '') + '…'
}

export function QuestionCard({ question, className }: QuestionCardProps) {
    const timeAgo = formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })
    const hasAnswers = question.answersCount > 0
    const hasVotes = question.voteScore > 0
    const preview = getBodyPreview(question.body)

    return (
        <div
            className={cn(
                'group relative flex gap-5 py-5 border-b border-border/40 last:border-0',
                'transition-colors duration-150 hover:bg-muted/20 -mx-3 px-3',
                className
            )}
        >
            {/* ── Stats column ── */}
            <div className="hidden sm:flex flex-col items-end gap-2.5 flex-shrink-0 w-16 pt-0.5">
                <div className={cn(
                    'flex justify-around gap-2 items-center text-center leading-none',
                    hasVotes ? 'text-primary' : 'text-muted-foreground/60'
                )}>
                    <span className="text-sm font-bold tabular-nums">{question.voteScore}</span>
                    <span className="text-[10px] mt-0.5">votes</span>
                </div>

                <div className={cn(
                    'flex gap-2 items-center text-center leading-none py-1',
                    hasAnswers
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 ring-1 ring-emerald-500/20'
                        : 'text-muted-foreground/60'
                )}>
                    <span className="text-sm font-bold tabular-nums">{question.answersCount}</span>
                    <span className="text-[10px] mt-0.5">answers</span>
                </div>

                <div className="flex gap-2 items-center text-center leading-none text-muted-foreground/50">
                    <span className="text-sm font-medium tabular-nums">{question.viewCount}</span>
                    <span className="text-[10px] mt-0.5">views</span>
                </div>

                {question.activeBounty && (
                    <div className="mt-1 flex items-center justify-center bg-blue-500 text-white rounded px-1.5 py-0.5 text-xs font-bold shadow-sm">
                        +{question.activeBounty.amount}
                    </div>
                )}
            </div>

            {/* ── Main content ── */}
            <div className="flex-1 min-w-0">
                {/* Title */}
                <Link href={`/questions/${question.id}`} className="block mb-1.5">
                    <h2
                        className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-150"
                        style={{ letterSpacing: '-0.01em' }}
                    >
                        {question.title}
                    </h2>
                </Link>

                {/* Body preview */}
                {preview && (
                    <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2 mb-2.5">
                        {preview}
                    </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {question.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {question.tags.slice(0, 5).map((tag) => (
                                <TagBadge key={tag["tag_id"]} tag={tag} />
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <UserAvatar className={"ml-auto mr-4"} author={question.author} size="sm" timestamp={question.createdAt} />
                </div>

                {/* Mobile stats */}
                <div className="flex sm:hidden gap-3 text-xs text-muted-foreground mb-2.5">
                    <span className={hasVotes ? 'text-primary font-medium' : ''}>{question.voteScore} votes</span>
                    <span className={hasAnswers ? 'text-emerald-500 font-medium' : ''}>{question.answersCount} answers</span>
                    <span>{question.viewCount} views</span>
                </div>
            </div>
        </div>
    )
}