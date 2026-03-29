'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const FLAG_CATEGORIES = [
    {
        value: 'spam',
        label: 'Spam',
        description: 'Unsolicited advertising or irrelevant content.',
    },
    {
        value: 'offensive',
        label: 'Offensive',
        description: 'Abusive, hateful, or harassing language.',
    },
    {
        value: 'duplicate',
        label: 'Duplicate',
        description: 'This is a duplicate of another question.',
    },
    {
        value: 'low_quality',
        label: 'Low quality',
        description: 'Unclear, incomplete, or not useful.',
    },
    {
        value: 'off_topic',
        label: 'Off topic',
        description: 'Does not belong on this platform.',
    },
    {
        value: 'other',
        label: 'Other',
        description: 'Something else — describe it below.',
    },
] as const

type FlagCategory = typeof FLAG_CATEGORIES[number]['value']

interface FlagDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contentId: string
    // Label shown in the dialog header e.g. "question", "answer", "comment"
    contentType: 'question' | 'answer' | 'comment'
}

export function FlagDialog({ open, onOpenChange, contentId, contentType }: FlagDialogProps) {
    const { isAuthenticated } = useAuthStore()

    const [category, setCategory]                 = useState<FlagCategory | ''>('')
    const [reason, setReason]                     = useState('')
    const [suggestedDuplicateId, setSugDupId]     = useState('')
    const [isSubmitting, setIsSubmitting]         = useState(false)

    const needsDuplicateId = category === 'duplicate'
    const reasonRequired   = category === 'other'
    const canSubmit =
        !!category &&
        reason.trim().length > 0 &&
        (!needsDuplicateId || suggestedDuplicateId.trim().length > 0) &&
        !isSubmitting

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            toast.error('You must be signed in to flag content.')
            return
        }
        if (!canSubmit) return

        setIsSubmitting(true)
        try {
            await api.post('/flags', {
                contentId,
                reason:   reason.trim(),
                flagCategory: category,
                suggestedDuplicateId: needsDuplicateId ? suggestedDuplicateId.trim() : null,
            })
            toast.success('Content flagged. The moderation team will review it.')
            onOpenChange(false)
            // Reset
            setCategory('')
            setReason('')
            setSugDupId('')
        } catch (err: any) {
            if (err?.response?.status === 409) {
                toast.error('You have already flagged this content.')
            } else {
                toast.error('Failed to submit flag. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (isSubmitting) return
        onOpenChange(false)
        setCategory('')
        setReason('')
        setSugDupId('')
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base" style={{ letterSpacing: '-0.02em' }}>
                        Flag this {contentType}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Tell the moderation team why this {contentType} needs attention.
                        Flags are anonymous to other users.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    {/* Category selection */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-2">
                            Reason
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {FLAG_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setCategory(cat.value)}
                                    className={cn(
                                        'flex items-start gap-3 px-3 py-2.5 text-left border transition-colors duration-150',
                                        category === cat.value
                                            ? 'border-primary/40 bg-primary/5 text-primary'
                                            : 'border-border/50 hover:border-border hover:bg-muted/30 text-foreground'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'mt-0.5 h-3.5 w-3.5 flex-shrink-0 border-2 transition-colors',
                                            category === cat.value
                                                ? 'border-primary bg-primary'
                                                : 'border-muted-foreground/40'
                                        )}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold leading-none mb-0.5">
                                            {cat.label}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground leading-snug">
                                            {cat.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duplicate question ID — only shown when category = duplicate */}
                    {needsDuplicateId && (
                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-1.5">
                                Duplicate of (Question ID)
                            </p>
                            <input
                                type="text"
                                value={suggestedDuplicateId}
                                onChange={(e) => setSugDupId(e.target.value)}
                                placeholder="Paste the UUID of the original question"
                                className={cn(
                                    'w-full px-3 py-2 text-xs bg-background border border-border/60',
                                    'outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
                                    'transition-colors duration-150 placeholder:text-muted-foreground/40'
                                )}
                            />
                        </div>
                    )}

                    {/* Additional reason / description */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-1.5">
                            Additional context
                            {reasonRequired && <span className="text-destructive ml-1">*</span>}
                        </p>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={
                                reasonRequired
                                    ? 'Describe the issue…'
                                    : 'Optional — add any context that helps the moderator.'
                            }
                            rows={3}
                            maxLength={100}
                            className={cn(
                                'w-full px-3 py-2 text-xs bg-background border border-border/60',
                                'resize-none outline-none',
                                'focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
                                'transition-colors duration-150 placeholder:text-muted-foreground/40'
                            )}
                        />
                        <p className="text-[11px] text-muted-foreground/40 text-right mt-0.5">
                            {reason.length}/100
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="h-8 px-4 text-xs text-muted-foreground"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="h-8 px-5 text-xs shadow-none"
                    >
                        {isSubmitting ? 'Submitting…' : 'Submit flag'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}