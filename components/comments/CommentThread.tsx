'use client'

import { useState } from 'react'
import type { Comment } from '@/types'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { TiptapContent } from '@/components/editor/TiptapContent'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ChatDots, CaretDown, CaretUp } from '@phosphor-icons/react'

interface CommentThreadProps {
    comments: Comment[]
    parentId: string
    onAddComment: (parentId: string, body: object) => Promise<void>
    className?: string
}

export function CommentThread({ comments, parentId, onAddComment, className }: CommentThreadProps) {
    const { isAuthenticated } = useAuthStore()
    const [isExpanded, setIsExpanded] = useState(false)
    const [showEditor, setShowEditor] = useState(false)
    const [commentBody, setCommentBody] = useState<object>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            toast.error('You must be logged in to comment.')
            return
        }
        const isEmpty =
            !commentBody ||
            JSON.stringify(commentBody) === '{}' ||
            (commentBody as { content?: unknown[] })?.content?.length === 0
        if (isEmpty) {
            toast.error('Comment cannot be empty.')
            return
        }
        setIsSubmitting(true)
        try {
            await onAddComment(parentId, commentBody)
            setCommentBody({})
            setShowEditor(false)
            toast.success('Comment posted.')
        } catch {
            toast.error('Failed to post comment.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const hasComments = comments.length > 0

    return (
        <div className={cn('mt-2', className)}>
            {/* Toggle trigger */}
            <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-primary transition-colors duration-150 py-1"
            >
                <ChatDots className="h-3.5 w-3.5" />
                {hasComments
                    ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}`
                    : 'Add a comment'}
                {hasComments && (
                    isExpanded
                        ? <CaretUp className="h-3 w-3" />
                        : <CaretDown className="h-3 w-3" />
                )}
            </button>

            {/* Expanded state */}
            {isExpanded && (
                <div className="mt-3 ml-1 pl-4 border-l border-border/50 space-y-0">
                    {comments.map((comment, i) => (
                        <div
                            key={comment.id}
                            className={cn(
                                'flex gap-2.5 py-2.5',
                                i < comments.length - 1 && 'border-b border-border/30'
                            )}
                        >
                            <UserAvatar
                                author={comment.author}
                                size="sm"
                                showName={false}
                                className="flex-shrink-0 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <span className="text-xs font-semibold text-foreground leading-none">
                                        {[comment.author.firstName, comment.author.lastName]
                                            .filter(Boolean)
                                            .join(' ') || comment.author.username || 'Anonymous'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/60">
                                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <div className="text-xs text-foreground/80 leading-relaxed">
                                    <TiptapContent content={comment.body} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add comment */}
                    {!showEditor ? (
                        <button
                            type="button"
                            onClick={() => {
                                if (!isAuthenticated) {
                                    toast.error('Log in to add a comment.')
                                    return
                                }
                                setShowEditor(true)
                            }}
                            className="text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-150 py-2 underline-offset-2 hover:underline"
                        >
                            + Add a comment
                        </button>
                    ) : (
                        <div className="space-y-2 pt-2">
                            <TiptapEditor
                                placeholder="Write a short comment…"
                                onChange={setCommentBody}
                                minHeight="72px"
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="h-7 text-xs px-3 rounded-md shadow-none"
                                >
                                    {isSubmitting ? 'Posting…' : 'Post'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowEditor(false)}
                                    className="h-7 text-xs px-3 rounded-md"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}