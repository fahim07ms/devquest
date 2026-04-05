'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { XIcon, TrashIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
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

const STATUS_OPTIONS = [
    { value: 'pending',      label: 'Pending' },
    { value: 'reviewed',     label: 'Reviewed' },
    { value: 'rejected',     label: 'Rejected' },
    { value: 'action_taken', label: 'Action taken' },
]

interface Flag {
    id: string
    contentId: string
    reason: string
    flagCategory: string
    status: string
    moderatorNote?: string | null
    createdAt: string
    reporter?: { username: string }
    moderator?: { username: string } | null
    suggestedDuplicateId?: string | null
    contentType: 'question' | 'answer' | 'comment'
    questionId?: string | null
}

interface FlagReviewDrawerProps {
    open:     boolean
    flag:     Flag | null
    onClose:  () => void
    onSaved:  (updated: Flag) => void
    onDeleted:(flagId: string) => void
}

export function FlagReviewDrawer({
                                     open,
                                     flag,
                                     onClose,
                                     onSaved,
                                     onDeleted,
                                 }: FlagReviewDrawerProps) {
    const [status, setStatus]               = useState('')
    const [moderatorNote, setModeratorNote] = useState('')
    const [isSaving, setIsSaving]           = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    // Sync form state when a new flag is loaded
    useEffect(() => {
        if (flag) {
            setStatus(flag.status)
            setModeratorNote(flag.moderatorNote ?? '')
        }
    }, [flag?.id])

    const handleSave = async () => {
        if (!flag) return
        setIsSaving(true)
        try {
            const res = await api.put(`/flags/${flag.id}/review`, {
                status,
                moderatorNote: moderatorNote.trim() || null,
            })
            onSaved(res.data.data.flag)
            onClose()
            toast.success('Flag updated.')
        } catch (err: any) {
            if (err?.response?.status === 409) {
                toast.error('This flag has already been acted upon.')
            } else {
                toast.error('Failed to update flag.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!flag) return
        try {
            await api.delete(`/flags/${flag.id}`)
            onDeleted(flag.id)
            onClose()
            toast.success('Flag deleted.')
        } catch {
            toast.error('Failed to delete flag.')
        } finally {
            setDeleteDialogOpen(false)
        }
    }

    const CATEGORY_LABELS: Record<string, string> = {
        spam:        'Spam',
        offensive:   'Offensive',
        duplicate:   'Duplicate',
        low_quality: 'Low quality',
        off_topic:   'Off topic',
        other:       'Other',
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300',
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    'fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border/60',
                    'flex flex-col transition-transform duration-300 ease-out',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-primary/70">
                            Moderation
                        </p>
                        <h2
                            className="text-base font-bold text-foreground"
                            style={{ letterSpacing: '-0.02em' }}
                        >
                            Review flag
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
                    >
                        <XIcon className="h-4 w-4" />
                    </button>
                </div>

                {flag ? (
                    <>
                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
                            {/* Flag details — read-only */}
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-2">
                                    Flag details
                                </p>
                                <div className="space-y-2 bg-muted/20 border border-border/40 px-3 py-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-[11px] text-muted-foreground/60 flex-shrink-0">Category</span>
                                        <span className="text-xs font-medium text-foreground text-right">
                                            {CATEGORY_LABELS[flag.flagCategory] ?? flag.flagCategory}
                                        </span>
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-[11px] text-muted-foreground/60 flex-shrink-0">Reporter</span>
                                        <span className="text-xs font-medium text-foreground text-right">
                                            @{flag.reporter?.username ?? 'unknown'}
                                        </span>
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-[11px] text-muted-foreground/60 flex-shrink-0">Reason</span>
                                        <span className="text-xs text-foreground text-right leading-relaxed max-w-[200px]">
                                            {flag.reason}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-border/40" />

                            {/* Status */}
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-2">
                                    Update status
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setStatus(opt.value)}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 border text-left transition-colors duration-150',
                                                status === opt.value
                                                    ? 'border-primary/40 bg-primary/5 text-primary'
                                                    : 'border-border/50 hover:border-border hover:bg-muted/30 text-foreground'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'h-3.5 w-3.5 flex-shrink-0 border-2 transition-colors',
                                                    status === opt.value
                                                        ? 'border-primary bg-primary'
                                                        : 'border-muted-foreground/40'
                                                )}
                                            />
                                            <span className="text-xs font-semibold">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Moderator note */}
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-2">
                                    Moderator note
                                    <span className="ml-1 font-normal normal-case tracking-normal text-muted-foreground/40">
                                        (optional, internal only)
                                    </span>
                                </p>
                                <textarea
                                    value={moderatorNote}
                                    onChange={(e) => setModeratorNote(e.target.value)}
                                    placeholder="Add a note for other moderators…"
                                    rows={4}
                                    maxLength={500}
                                    className={cn(
                                        'w-full px-3 py-2 text-xs bg-background border border-border/60',
                                        'resize-none outline-none',
                                        'focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
                                        'transition-colors duration-150 placeholder:text-muted-foreground/40'
                                    )}
                                />
                                <p className="text-[11px] text-muted-foreground/40 text-right mt-0.5">
                                    {moderatorNote.length}/500
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-border/50 flex items-center justify-between gap-3">
                            {/* Delete flag */}
                            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteDialogOpen(true)}
                                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors duration-150"
                                    >
                                        <TrashIcon className="h-3.5 w-3.5" />
                                        Delete flag
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this flag?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            The flag will be permanently removed. The reported content will not be affected.
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

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="h-8 px-4 text-xs text-muted-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="h-8 px-5 text-xs shadow-none"
                                >
                                    {isSaving ? 'Saving…' : 'Save changes'}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">No flag selected.</p>
                    </div>
                )}
            </div>
        </>
    )
}