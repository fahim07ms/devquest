'use client'

import type { Comment as CommentType } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { JSONContent } from '@tiptap/core'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { formatDistanceToNow } from 'date-fns'
import { InlineEditFooter } from '@/components/questions/InlineEditFooter'
import { TiptapContent } from '@/components/editor/TiptapContent'
import { ActionBtn } from '@/components/questions/ActionBtn'
import { ArrowBendDownRightIcon, PencilSimpleLineIcon, TrashIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import TiptapEditor from '@/components/editor/TiptapEditor'
import { VoteButtons } from '@/components/questions/VoteButtons'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {FlagButton} from "@/components/flags/FlagButton";
import {FlagDialog} from "@/components/flags/FlagDialog";

export function CommentThread({
                                  comments,
                                  parentId,
                                  parentType,
                                  currentUserId,
                                  recipientId,
                                  onCommentAdded,
                                  onCommentEdited,
                                  onCommentDeleted,
                              }: {
    comments: CommentType[]
    parentId: string
    parentType: 'question' | 'answer'
    currentUserId?: string
    recipientId?: string
    onCommentAdded:   (parentId: string, comment: CommentType) => void
    onCommentEdited:  (commentId: string, updated: CommentType) => void
    onCommentDeleted: (commentId: string) => void
}) {
    const { isAuthenticated } = useAuthStore()

    const [showEditor, setShowEditor]           = useState(false)
    const [newBody, setNewBody]                 = useState<JSONContent>({})
    const [replyPrefix, setReplyPrefix]         = useState('')
    const [activeRecipientId, setActiveRecipientId] = useState<string | undefined>(undefined)
    const [isPosting, setIsPosting]             = useState(false)

    const [editingId, setEditingId]             = useState<string | null>(null)
    const [editBody, setEditBody]               = useState<JSONContent>({})
    const [isSavingEdit, setIsSavingEdit]       = useState(false)

    // Track which comment is pending deletion
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    // Track which comment has the flag dialog open
    const [flaggingCommentId, setFlaggingCommentId] = useState<string | null>(null);

    const openReply = (username?: string, commentAuthorId?: string) => {
        setReplyPrefix(username ? `@${username}` : '')
        setActiveRecipientId(commentAuthorId ?? recipientId)
        setShowEditor(true)
    }

    const handlePost = async () => {
        const empty =
            !newBody ||
            JSON.stringify(newBody) === '{}' ||
            (newBody as any)?.content?.length === 0
        if (empty) return toast.error('Comment cannot be empty.')

        setIsPosting(true)
        try {
            const url =
                parentType === 'question'
                    ? `/questions/${parentId}/comments`
                    : `/answers/${parentId}/comments`

            const res = await api.post(url, {
                body: newBody,
                recipientId: activeRecipientId,
            })

            onCommentAdded(parentId, res.data.data.comment)
            setNewBody({})
            setReplyPrefix('')
            setActiveRecipientId(undefined)
            setShowEditor(false)
            toast.success('Comment posted.')
        } catch {
            toast.error('Failed to post comment.')
        } finally {
            setIsPosting(false)
        }
    }

    const handleSaveEdit = async (commentId: string) => {
        const empty =
            !editBody ||
            JSON.stringify(editBody) === '{}' ||
            (editBody as any)?.content?.length === 0
        if (empty) return toast.error('Comment cannot be empty.')
        setIsSavingEdit(true)
        try {
            const res = await api.put(`/comments/${commentId}`, { body: editBody })
            onCommentEdited(commentId, res.data.data.comment)
            setEditingId(null)
            toast.success('Comment updated.')
        } catch {
            toast.error('Failed to update comment.')
        } finally {
            setIsSavingEdit(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!pendingDeleteId) return
        try {
            await api.delete(`/comments/${pendingDeleteId}`)
            onCommentDeleted(pendingDeleteId)
            toast.success('Comment deleted.')
        } catch {
            toast.error('Failed to delete comment.')
        } finally {
            setPendingDeleteId(null)
        }
    }

    return (
        <div className="mt-3">
            {/* ── Comment list ── */}
            {comments.length > 0 && (
                <div className="border-t border-border/30 pt-3">
                    {comments.map((comment, i) => {
                        const isOwn     = !!currentUserId && comment.author?.authorId === currentUserId
                        const isEditing = editingId === comment.id
                        const recipientUsername = comment.recipient?.recipientUsername

                        return (
                            <div
                                key={comment.id}
                                className={cn(
                                    'group flex gap-2.5 py-2.5',
                                    i < comments.length - 1 && 'border-b border-border/25'
                                )}
                                id={`comment-${comment.id}`}
                            >
                                <UserAvatar
                                    author={comment.author}
                                    size="sm"
                                    showName={false}
                                    className="flex-shrink-0 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                    {/* Author → recipient + timestamp */}
                                    <div className="flex items-baseline gap-1.5 mb-0.5 flex-wrap">
                                        <span className="text-xs font-semibold text-foreground">
                                            {[comment.author?.firstName, comment.author?.lastName]
                                                    .filter(Boolean)
                                                    .join(' ') ||
                                                comment.author?.username ||
                                                'Anonymous'}
                                        </span>

                                        {recipientUsername && (
                                            <>
                                                <span className="text-[10px] text-muted-foreground/40">→</span>
                                                <span className="text-xs font-medium text-primary">
                                                    @{recipientUsername}
                                                </span>
                                            </>
                                        )}

                                        <span className="text-[10px] text-muted-foreground/50 ml-auto">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    {isEditing ? (
                                        <>
                                            <TiptapEditor
                                                onChange={setEditBody}
                                                initialContent={comment.body as JSONContent}
                                                minHeight="72px"
                                            />
                                            <InlineEditFooter
                                                onSave={() => handleSaveEdit(comment.id)}
                                                onCancel={() => setEditingId(null)}
                                                isSaving={isSavingEdit}
                                                saveLabel="Update"
                                            />
                                        </>
                                    ) : (
                                        <div className="text-xs text-foreground/80 leading-relaxed">
                                            <TiptapContent content={comment.body} />
                                        </div>
                                    )}

                                    {/* Actions row — votes + edit/delete/reply */}
                                    {!isEditing && (
                                        <div className="flex items-center justify-between mt-1.5">
                                            {/* Horizontal vote buttons — always visible */}
                                            <VoteButtons
                                                score={comment.voteScore ?? 0}
                                                contentId={comment.id}
                                                orientation="horizontal"
                                                className="opacity-60 group-hover:opacity-100 transition-opacity duration-150"
                                            />

                                            {/* Reply / edit / delete — appear on hover */}
                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                {isAuthenticated && (
                                                    <ActionBtn
                                                        onClick={() =>
                                                            openReply(
                                                                comment.author?.username,
                                                                comment.author?.authorId
                                                            )
                                                        }
                                                        icon={ArrowBendDownRightIcon}
                                                        label="Reply"
                                                    />
                                                )}
                                                {isOwn ? (
                                                    <>
                                                        <ActionBtn
                                                            onClick={() => {
                                                                setEditingId(comment.id)
                                                                setEditBody(comment.body as JSONContent)
                                                            }}
                                                            icon={PencilSimpleLineIcon}
                                                            label="Edit"
                                                        />

                                                        <AlertDialog
                                                            open={pendingDeleteId === comment.id}
                                                            onOpenChange={(open) => {
                                                                if (!open) setPendingDeleteId(null)
                                                            }}
                                                        >
                                                            <AlertDialogTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPendingDeleteId(comment.id)}
                                                                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors duration-150"
                                                                >
                                                                    <TrashIcon className="h-3.5 w-3.5" />
                                                                    Delete
                                                                </button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This comment will be permanently removed and cannot be recovered.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={handleConfirmDelete}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </>
                                                ) : (
                                                    /* Flag — authenticated non-owners only */
                                                    isAuthenticated && (
                                                        <FlagButton
                                                            variant="inline"
                                                            onClick={() => setFlaggingCommentId(comment.id)}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Flag dialogs — one per comment, controlled by flaggingCommentId */}
            {comments.map((comment) => (
                <FlagDialog
                    key={`flag-${comment.id}`}
                    open={flaggingCommentId === comment.id}
                    onOpenChange={(open) => {
                        if (!open) setFlaggingCommentId(null)
                    }}
                    contentId={comment.id}
                    contentType="comment"
                />
            ))}

            {/* ── New comment / reply editor ── */}
            {!showEditor ? (
                isAuthenticated && (
                    <button
                        type="button"
                        onClick={() => openReply()}
                        className="mt-2 text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-150"
                    >
                        + Add a comment
                    </button>
                )
            ) : (
                <div className="mt-3 space-y-2">
                    <TiptapEditor
                        onChange={setNewBody}
                        placeholder={replyPrefix ? `Replying to ${replyPrefix}…` : 'Write a comment…'}
                        minHeight="72px"
                    />
                    <div className="flex items-center justify-between">
                        {replyPrefix && (
                            <span className="text-[11px] text-muted-foreground/60">
                                Replying to <span className="text-primary">{replyPrefix}</span>
                            </span>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowEditor(false)
                                    setReplyPrefix('')
                                    setActiveRecipientId(undefined)
                                }}
                                className="h-7 px-3 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handlePost}
                                disabled={isPosting}
                                className="h-7 px-3 text-xs shadow-none"
                            >
                                {isPosting ? 'Posting…' : 'Post'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}