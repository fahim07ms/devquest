'use client'

import type { Answer, Comment as CommentType } from '@/types'
import { useState } from 'react'
import { JSONContent } from '@tiptap/core'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { VoteButtons } from '@/components/questions/VoteButtons'
import { CheckCircleIcon, PencilSimpleLineIcon, TrashIcon, LockKeyIcon } from '@phosphor-icons/react'
import { InlineEditFooter } from '@/components/questions/InlineEditFooter'
import { TiptapContent } from '@/components/editor/TiptapContent'
import { ActionBtn } from '@/components/questions/ActionBtn'
import { formatDistanceToNow } from 'date-fns'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { CommentThread } from '@/components/comments/CommentThread'
import TiptapEditor from '@/components/editor/TiptapEditor'
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
import { FlagDialog } from '@/components/flags/FlagDialog'
import { FlagButton } from '@/components/flags/FlagButton'
import { useAuthStore } from '@/store/authStore'

export function AnswerCard({
                               answer,
                               isQuestionAuthor,
                               hasAcceptedAnswer,
                               currentUserId,
                               comments,
                               canAwardBounty,
                               onAwardBounty,
                               onAccept,
                               onEdited,
                               onDeleted,
                               onCommentAdded,
                               onCommentEdited,
                               onCommentDeleted,
                           }: {
    answer: Answer
    isQuestionAuthor: boolean
    hasAcceptedAnswer: boolean
    currentUserId?: string
    comments: CommentType[]
    canAwardBounty?: boolean
    onAwardBounty?: (answerId: string) => void
    onAccept:         (answerId: string, accepted: boolean) => void
    onEdited:         (answerId: string, updated: Answer) => void
    onDeleted:        (answerId: string) => void
    onCommentAdded:   (parentId: string, comment: CommentType) => void
    onCommentEdited:  (commentId: string, updated: CommentType) => void
    onCommentDeleted: (commentId: string) => void
}) {
    const { isAuthenticated, user } = useAuthStore()
    const isOwn       = !!currentUserId && answer.author?.authorId === currentUserId
    const isModerator = user?.role === 'admin' || user?.role === 'moderator'

    const [isEditing,        setIsEditing]        = useState(false)
    const [editBody,         setEditBody]          = useState<JSONContent>({})
    const [isSaving,         setIsSaving]          = useState(false)
    const [isAccepting,      setIsAccepting]       = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen]  = useState(false)
    const [flagDialogOpen,   setFlagDialogOpen]    = useState(false)

    const handleSave = async () => {
        const empty = !editBody || JSON.stringify(editBody) === '{}' || (editBody as any)?.content?.length === 0
        if (empty) return toast.error('Answer cannot be empty.')
        setIsSaving(true)
        try {
            const res = await api.put(`/answers/${answer.id}`, { body: editBody })
            onEdited(answer.id, res.data.data.answer)
            setIsEditing(false)
            toast.success('Answer updated.')
        } catch {
            toast.error('Failed to update answer.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/answers/${answer.id}`)
            onDeleted(answer.id)
            toast.success('Answer deleted.')
        } catch {
            toast.error('Failed to delete answer.')
        } finally {
            setDeleteDialogOpen(false)
        }
    }

    const handleAccept = async () => {
        setIsAccepting(true)
        try {
            const newAccepted = !answer.isAccepted
            await api.post(`/answers/${answer.id}/accept`, { accepted: newAccepted })
            onAccept(answer.id, newAccepted)
            toast.success(newAccepted ? 'Answer accepted.' : 'Acceptance removed.')
        } catch {
            toast.error('Failed to update acceptance.')
        } finally {
            setIsAccepting(false)
        }
    }

    const handleUnfreezeAnswer = async () => {
        try {
            await api.patch(`/flags/content/${answer.id}/unfreeze`)
            onEdited(answer.id, { ...answer, isFrozen: false })
            toast.success('Answer unfrozen.')
        } catch {
            toast.error('Failed to unfreeze answer.')
        }
    }

    // Show accept button when: question author AND (no accepted answer yet OR this one is already accepted)
    const showAcceptBtn = isQuestionAuthor && (!hasAcceptedAnswer || answer.isAccepted)

    return (
        <div
            className={cn(
                'group/answer relative flex gap-5 py-7 border-b border-border/40 last:border-0',
                answer.isAccepted && 'bg-emerald-500/[0.03] px-2'
            )}
            id={`answer-${answer.id}`}
        >
            {answer.isAccepted && (
                <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-emerald-500/50" />
            )}

            {/* ── Vote + accept column ── */}
            <div className="flex flex-col items-center gap-2.5 w-10 flex-shrink-0 pt-0.5">
                <VoteButtons score={answer.voteScore} contentId={answer.id} />

                {/* Accept / accepted indicator */}
                {showAcceptBtn ? (
                    <button
                        type="button"
                        onClick={handleAccept}
                        disabled={isAccepting}
                        title={answer.isAccepted ? 'Remove acceptance' : 'Accept this answer'}
                        className={cn(
                            'p-1.5 transition-colors duration-150 mt-1 disabled:opacity-40',
                            answer.isAccepted
                                ? 'text-emerald-500'
                                : 'text-muted-foreground/40 hover:text-emerald-500'
                        )}
                    >
                        <CheckCircleIcon weight={answer.isAccepted ? 'fill' : 'regular'} className="h-5 w-5" />
                    </button>
                ) : answer.isAccepted ? (
                    <div className="text-emerald-500 mt-1" title="Accepted answer">
                        <CheckCircleIcon weight="fill" className="h-5 w-5" />
                    </div>
                ) : null}

                {/* Award bounty — visible whenever there's an active bounty, regardless of acceptance */}
                {canAwardBounty && (
                    <button
                        type="button"
                        onClick={() => onAwardBounty?.(answer.id)}
                        title="Award active bounty to this answer"
                        className="p-1 px-[5px] mt-2 transition-colors duration-150 bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500 hover:text-white dark:hover:text-white text-[10px] font-bold text-center leading-tight whitespace-normal"
                    >
                        Award<br />Bounty
                    </button>
                )}
            </div>

            {/* ── Body ── */}
            <div className="flex-1 min-w-0">
                {answer.isFrozen && (
                    <div className="mb-4 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <LockKeyIcon className="h-4 w-4 shrink-0" weight="fill" />
                            Frozen by a moderator and hidden from the public.
                        </div>
                        {isModerator && (
                            <button
                                onClick={handleUnfreezeAnswer}
                                className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-amber-500/30 hover:bg-amber-500/20 text-amber-700 transition-colors"
                            >
                                Unfreeze
                            </button>
                        )}
                    </div>
                )}

                {isEditing ? (
                    <>
                        <TiptapEditor
                            onChange={setEditBody}
                            initialContent={answer.body as JSONContent}
                            minHeight="200px"
                        />
                        <InlineEditFooter
                            onSave={handleSave}
                            onCancel={() => setIsEditing(false)}
                            isSaving={isSaving}
                            saveLabel="Update answer"
                        />
                    </>
                ) : (
                    <div className="text-foreground/90 text-sm leading-relaxed mb-6">
                        <TiptapContent content={answer.body} />
                    </div>
                )}

                {!isEditing && (
                    <>
                        <div className="flex items-end justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                {isOwn && (
                                    <>
                                        <ActionBtn
                                            onClick={() => { setEditBody(answer.body as JSONContent); setIsEditing(true) }}
                                            icon={PencilSimpleLineIcon}
                                            label="Edit"
                                        />
                                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteDialogOpen(true)}
                                                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors duration-150"
                                                >
                                                    <TrashIcon className="h-3.5 w-3.5" />
                                                    Delete
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete answer?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This answer and all its comments will be permanently removed. This action cannot be undone.
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
                                )}

                                {isAuthenticated && !isOwn && (
                                    <FlagButton variant="inline" onClick={() => setFlagDialogOpen(true)} />
                                )}
                            </div>

                            <div className="flex items-center gap-2.5 bg-muted/30 border border-border/40 px-3 py-2">
                                <p className="text-[10px] text-muted-foreground/70 leading-none">
                                    answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                                </p>
                                <UserAvatar author={answer.author} size="sm" />
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-border/30">
                            <CommentThread
                                comments={comments}
                                parentId={answer.id}
                                parentType="answer"
                                currentUserId={currentUserId}
                                recipientId={answer.author?.authorId}
                                onCommentAdded={onCommentAdded}
                                onCommentEdited={onCommentEdited}
                                onCommentDeleted={onCommentDeleted}
                            />
                        </div>

                        <FlagDialog
                            open={flagDialogOpen}
                            onOpenChange={setFlagDialogOpen}
                            contentId={answer.id}
                            contentType="answer"
                        />
                    </>
                )}
            </div>
        </div>
    )
}