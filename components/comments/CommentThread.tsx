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
            toast.success('Comment posted!')
        } catch {
            toast.error('Failed to post comment.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={cn('mt-4', className)}>
            {/* Toggle button */}
            <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
                <ChatDots className="h-3.5 w-3.5" />
                {comments.length > 0
                    ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}`
                    : 'Add a comment'}
                {isExpanded ? <CaretUp className="h-3 w-3" /> : <CaretDown className="h-3 w-3" />}
            </button>

            {/* Expanded comment list + editor */}
            {isExpanded && (
                <div className="mt-3 space-y-3 border-l-2 border-border pl-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="group flex gap-2.5">
                            <UserAvatar author={comment.author} size="sm" showName={false} className="mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-semibold text-foreground">
                                        {[comment.author.firstName, comment.author.lastName].filter(Boolean).join(' ') || 'Anonymous'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-sm text-foreground/90">
                                    <TiptapContent content={comment.body} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add comment button / editor */}
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
                            className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
                        >
                            + Add a comment
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <TiptapEditor
                                placeholder="Write a comment…"
                                onChange={setCommentBody}
                                minHeight="80px"
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? 'Posting…' : 'Post Comment'}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setShowEditor(false)}>
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
