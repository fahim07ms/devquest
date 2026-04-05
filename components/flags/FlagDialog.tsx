'use client'

import { useState, useEffect, useRef } from 'react'
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
import { MagnifyingGlassIcon } from '@phosphor-icons/react'

// All flag categories. 'duplicate' is intentionally excluded for answers and
// comments at render time — it only makes sense for questions.
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

// A question suggestion returned from the search API
interface QuestionSuggestion {
    id: string
    title: string
}

interface FlagDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contentId: string
    // Label shown in the dialog header e.g. "question", "answer", "comment"
    contentType: 'question' | 'answer' | 'comment'
}

export function FlagDialog({ open, onOpenChange, contentId, contentType }: FlagDialogProps) {
    const { isAuthenticated } = useAuthStore()

    const [category, setCategory]           = useState<FlagCategory | ''>('')
    const [reason, setReason]               = useState('')
    const [isSubmitting, setIsSubmitting]   = useState(false)

    // --- Duplicate question search state ---
    const [dupQuery, setDupQuery]               = useState('')
    const [suggestions, setSuggestions]         = useState<QuestionSuggestion[]>([])
    const [selectedDup, setSelectedDup]         = useState<QuestionSuggestion | null>(null)
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
    const [showDropdown, setShowDropdown]       = useState(false)
    const searchDebounceRef                     = useRef<ReturnType<typeof setTimeout> | null>(null)
    const searchInputRef                        = useRef<HTMLInputElement>(null)

    // 'duplicate' doesn't apply to answers or comments — remove it for those types
    const visibleCategories = FLAG_CATEGORIES.filter(
        cat => contentType === 'question' || cat.value !== 'duplicate'
    )

    const needsDuplicateSearch = category === 'duplicate'
    // Reason is only strictly required when 'other' is selected; for all other
    // categories it is optional additional context
    const reasonRequired = category === 'other'

    const canSubmit =
        !!category &&
        // If 'other', a reason must be provided
        (reasonRequired ? reason.trim().length > 0 : true) &&
        // If 'duplicate', a question must be selected via the search
        (!needsDuplicateSearch || selectedDup !== null) &&
        !isSubmitting

    // Debounced question search — fires when the user types in the duplicate search box
    useEffect(() => {
        if (!needsDuplicateSearch) return
        if (!dupQuery.trim()) {
            setSuggestions([])
            setShowDropdown(false)
            return
        }

        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

        searchDebounceRef.current = setTimeout(async () => {
            setIsFetchingSuggestions(true)
            try {
                const res = await api.get('/questions', {
                    params: { search: dupQuery.trim(), limit: 8, page: 1 },
                })
                // The questions list endpoint returns { data: { questions: [...] } }
                const raw: Array<{ id: string; title: string }> =
                    res.data?.data?.questions ?? []
                setSuggestions(raw.map(q => ({ id: q.id, title: q.title })))
                setShowDropdown(true)
            } catch {
                // Silently fail — user can still paste the ID manually
                setSuggestions([])
            } finally {
                setIsFetchingSuggestions(false)
            }
        }, 300)

        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        }
    }, [dupQuery, needsDuplicateSearch])

    const handleSelectDup = (q: QuestionSuggestion) => {
        setSelectedDup(q)
        setDupQuery(q.title)
        setSuggestions([])
        setShowDropdown(false)
    }

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
                // Send an empty string if the user didn't provide additional context;
                // the backend only enforces a non-empty reason, so we pass a space-safe
                // value when reason is optional and left blank.
                reason: reason.trim() || `Flagged as ${category}`,
                flagCategory: category,
                suggestedDuplicateId: needsDuplicateSearch ? selectedDup?.id ?? null : null,
            })
            toast.success('Content flagged. The moderation team will review it.')
            onOpenChange(false)
            resetForm()
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

    const resetForm = () => {
        setCategory('')
        setReason('')
        setDupQuery('')
        setSuggestions([])
        setSelectedDup(null)
        setShowDropdown(false)
    }

    const handleClose = () => {
        if (isSubmitting) return
        onOpenChange(false)
        resetForm()
    }

    const handleCategoryChange = (val: FlagCategory) => {
        setCategory(val)
        // Clear the duplicate search when switching away from 'duplicate'
        if (val !== 'duplicate') {
            setDupQuery('')
            setSelectedDup(null)
            setSuggestions([])
            setShowDropdown(false)
        }
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
                            {visibleCategories.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => handleCategoryChange(cat.value)}
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

                    {/* Duplicate question search — only shown when category = duplicate */}
                    {needsDuplicateSearch && (
                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-1.5">
                                Duplicate of
                            </p>
                            <p className="text-[11px] text-muted-foreground/60 mb-2">
                                Search by title or paste the question ID directly.
                            </p>

                            {/* Search input */}
                            <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                                    <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                                </span>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={dupQuery}
                                    onChange={(e) => {
                                        setDupQuery(e.target.value)
                                        // Clear previously selected item if user edits the field
                                        if (selectedDup && e.target.value !== selectedDup.title) {
                                            setSelectedDup(null)
                                        }
                                    }}
                                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                                    onBlur={() => {
                                        // Delay hiding so click on suggestion registers
                                        setTimeout(() => setShowDropdown(false), 150)
                                    }}
                                    placeholder="Type question title or paste UUID…"
                                    className={cn(
                                        'w-full pl-7 pr-3 py-2 text-xs bg-background border border-border/60',
                                        'outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
                                        'transition-colors duration-150 placeholder:text-muted-foreground/40'
                                    )}
                                />

                                {/* Suggestion dropdown */}
                                {showDropdown && (suggestions.length > 0 || isFetchingSuggestions) && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-0.5 bg-background border border-border/60 shadow-md max-h-52 overflow-y-auto">
                                        {isFetchingSuggestions ? (
                                            <p className="px-3 py-2.5 text-xs text-muted-foreground/60 animate-pulse">
                                                Searching…
                                            </p>
                                        ) : (
                                            suggestions.map((q) => (
                                                <button
                                                    key={q.id}
                                                    type="button"
                                                    onMouseDown={() => handleSelectDup(q)}
                                                    className="w-full text-left px-3 py-2.5 hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0"
                                                >
                                                    <p className="text-xs font-medium text-foreground leading-snug line-clamp-1">
                                                        {q.title}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-mono">
                                                        {q.id}
                                                    </p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Confirm which question was selected */}
                            {selectedDup && (
                                <div className="mt-2 px-3 py-2 border border-primary/20 bg-primary/5 text-xs">
                                    <span className="text-muted-foreground/60">Selected: </span>
                                    <span className="font-medium text-foreground">{selectedDup.title}</span>
                                    <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{selectedDup.id}</p>
                                </div>
                            )}
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