'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { FlagFilters } from '@/components/flags/FlagFilters'
import { FlagRow } from '@/components/flags/FlagRow'
import { FlagReviewDrawer } from '@/components/flags/FlagReviewDrawer'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'

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
}

export default function FlagsPage() {
    const router       = useRouter()
    const searchParams = useSearchParams()
    const { user, isAuthenticated } = useAuthStore()

    const [flags, setFlags]           = useState<Flag[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading]   = useState(true)
    const [mounted, setMounted]       = useState(false)

    // Drawer state
    const [reviewingFlag, setReviewingFlag] = useState<Flag | null>(null)
    const [drawerOpen, setDrawerOpen]       = useState(false)

    // Filter state from URL
    const status   = searchParams.get('status')   ?? ''
    const category = searchParams.get('category') ?? ''
    const page     = parseInt(searchParams.get('page') ?? '1', 10)

    useEffect(() => { setMounted(true) }, [])

    // Access guard — redirect non-moderators
    useEffect(() => {
        if (!mounted) return
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        const role = user?.role
        if (role !== 'moderator' && role !== 'admin') {
            router.push('/questions')
            toast.error('You do not have access to this page.')
        }
    }, [mounted, isAuthenticated, user?.role, router])

    const fetchFlags = useCallback(async () => {
        setIsLoading(true)
        try {
            const params: Record<string, string> = { page: String(page), limit: '20' }
            if (status)   params.status   = status
            if (category) params.category = category

            const res = await api.get('/flags', { params })
            setFlags(res.data.data.flags ?? [])
            setTotalPages(res.data.data.totalPages ?? 1)
            setTotalCount(res.data.data.totalFlags ?? 0)
        } catch {
            toast.error('Failed to load flags.')
        } finally {
            setIsLoading(false)
        }
    }, [status, category, page])

    useEffect(() => {
        if (mounted) fetchFlags()
    }, [mounted, fetchFlags])

    const pushParams = (updates: Record<string, string | undefined>) => {
        const p = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([k, v]) => {
            if (!v) p.delete(k)
            else p.set(k, v)
        })
        if (!('page' in updates)) p.delete('page')
        router.push(`/flags?${p.toString()}`)
    }

    const handleFlagSaved = (updated: Flag) => {
        setFlags((prev) => prev.map((f) => f.id === updated.id ? updated : f))
    }

    const handleFlagDeleted = (flagId: string) => {
        setFlags((prev) => prev.filter((f) => f.id !== flagId))
        setTotalCount((prev) => Math.max(0, prev - 1))
    }

    const openDrawer = (flag: Flag) => {
        setReviewingFlag(flag)
        setDrawerOpen(true)
    }

    if (!mounted) return null

    return (
        <>
            <div
                className={cn(
                    'max-w-4xl mx-auto w-full px-5 py-8 transition-opacity duration-500',
                    mounted ? 'opacity-100' : 'opacity-0'
                )}
            >
                {/* ── Header ── */}
                <div className="mb-7">
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-primary/70 mb-1">
                        Moderation
                    </p>
                    <h1
                        className="text-2xl font-bold text-foreground"
                        style={{ letterSpacing: '-0.03em' }}
                    >
                        Flags
                    </h1>
                    {!isLoading && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {totalCount} flag{totalCount !== 1 ? 's' : ''} total
                        </p>
                    )}
                </div>

                {/* ── Filters ── */}
                <div className="mb-5">
                    <FlagFilters
                        status={status}
                        category={category}
                        onStatusChange={(v) => pushParams({ status: v || undefined })}
                        onCategoryChange={(v) => pushParams({ category: v || undefined })}
                        onClearAll={() => router.push('/flags')}
                    />
                </div>

                <div className="h-px bg-border/40 mb-5" />

                {/* ── Flag list ── */}
                <div>
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="py-4 border-b border-border/40 animate-pulse"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="flex gap-3 mb-2">
                                    <div className="h-4 w-16 bg-muted" />
                                    <div className="h-4 w-20 bg-muted" />
                                </div>
                                <div className="h-3 w-3/4 bg-muted mb-1.5" />
                                <div className="h-3 w-1/2 bg-muted" />
                            </div>
                        ))
                    ) : flags.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-border/60 bg-muted/10">
                            <p className="text-base font-semibold text-foreground mb-1.5">
                                No flags found
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {status || category
                                    ? 'Try adjusting the filters.'
                                    : 'The community is behaving itself.'}
                            </p>
                        </div>
                    ) : (
                        flags.map((flag) => (
                            <FlagRow
                                key={flag.id}
                                flag={flag}
                                onReview={openDrawer}
                            />
                        ))
                    )}
                </div>

                {/* ── Pagination ── */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => pushParams({ page: String(page - 1) })}
                            className="gap-1.5 h-8 text-xs shadow-none"
                        >
                            <ArrowLeftIcon className="h-3.5 w-3.5" />
                            Previous
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => pushParams({ page: String(page + 1) })}
                            className="gap-1.5 h-8 text-xs shadow-none"
                        >
                            Next
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            {/* ── Review drawer ── */}
            <FlagReviewDrawer
                open={drawerOpen}
                flag={reviewingFlag}
                onClose={() => setDrawerOpen(false)}
                onSaved={handleFlagSaved}
                onDeleted={handleFlagDeleted}
            />
        </>
    )
}