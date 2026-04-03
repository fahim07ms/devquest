'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { CustomPagination } from '@/components/questions/Pagination'
import {
    MagnifyingGlassIcon,
    HashIcon,
    CheckIcon,
    PlusIcon,
} from '@phosphor-icons/react'

interface DetailedTag {
    tag_id: string
    name: string
    description: string | null
    questionCount: string
    isFollowed: boolean
}

export default function TagsPage() {
    const router       = useRouter()
    const searchParams = useSearchParams()
    const { isAuthenticated } = useAuthStore()

    const [tags,       setTags]       = useState<DetailedTag[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [totalTags,  setTotalTags]  = useState(0)
    const [isLoading,  setIsLoading]  = useState(true)
    const [mounted,    setMounted]    = useState(false)

    // Track in-flight follow/unfollow per tag to show loading state
    const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

    const search = searchParams.get('search') || ''
    const page   = parseInt(searchParams.get('page') || '1', 10)

    useEffect(() => { setMounted(true) }, [])

    const fetchTags = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/tags/detailed', {
                params: { page, limit: 24, search },
            })
            const data = res.data.data
            setTags(data.tags ?? [])
            setTotalPages(data.totalPages ?? 1)
            setTotalTags(parseInt(data.totalTags, 10) || 0)
        } catch {
            toast.error('Failed to load tags.')
        } finally {
            setIsLoading(false)
        }
    }, [page, search])

    useEffect(() => { fetchTags() }, [fetchTags])

    const pushParams = (updates: Record<string, string | undefined>) => {
        const p = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([k, v]) => {
            if (!v) p.delete(k)
            else    p.set(k, v)
        })
        if (!('page' in updates)) p.delete('page')
        router.push(`/tags?${p.toString()}`)
    }

    const handleToggleFollow = async (tag: DetailedTag) => {
        if (!isAuthenticated) {
            toast.error('You must be signed in to follow tags.')
            return
        }

        setTogglingIds(prev => new Set(prev).add(tag.tag_id))
        try {
            if (tag.isFollowed) {
                await api.delete(`/tags/${tag.tag_id}/follow`)
                toast.success(`Unfollowed #${tag.name}`)
            } else {
                await api.post(`/tags/${tag.tag_id}/follow`)
                toast.success(`Now following #${tag.name}`)
            }
            // Flip the local state — no need to refetch
            setTags(prev => prev.map(t =>
                t.tag_id === tag.tag_id ? { ...t, isFollowed: !t.isFollowed } : t
            ))
        } catch {
            toast.error('Failed to update tag follow.')
        } finally {
            setTogglingIds(prev => {
                const next = new Set(prev)
                next.delete(tag.tag_id)
                return next
            })
        }
    }

    return (
        <div className={cn('max-w-5xl mx-auto w-full px-5 py-8 transition-opacity duration-500', mounted ? 'opacity-100' : 'opacity-0')}>

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-primary/70 mb-1">
                        Browse
                    </p>
                    <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: '-0.03em' }}>
                        Tags
                    </h1>
                    {!isLoading && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {totalTags} tag{totalTags !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Search */}
                <div className="relative sm:w-64">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                    <Input
                        type="search"
                        defaultValue={search}
                        onChange={e => pushParams({ search: e.target.value || undefined })}
                        placeholder="Search tags…"
                        className="pl-8 h-9 text-sm bg-muted/40 border-border/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                    />
                </div>
            </div>

            {isAuthenticated && (
                <p className="text-xs text-muted-foreground/60 mb-6">
                    Follow tags to personalise your dashboard feed.
                </p>
            )}

            <div className="h-px bg-border/40 mb-6" />

            {/* ── Tag grid ── */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-28 bg-muted animate-pulse" style={{ animationDelay: `${i * 30}ms` }} />
                    ))}
                </div>
            ) : tags.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border/60">
                    <HashIcon className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No tags found{search ? ` for "${search}"` : ''}.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tags.map((tag, i) => (
                        <div
                            key={tag.tag_id}
                            className="opacity-0 animate-fade-up"
                            style={{ animationDelay: `${i * 20}ms`, animationFillMode: 'forwards' }}
                        >
                            <TagCard
                                tag={tag}
                                isAuthenticated={isAuthenticated}
                                isToggling={togglingIds.has(tag.tag_id)}
                                onToggleFollow={handleToggleFollow}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-10 pt-6 border-t border-border/40">
                    <CustomPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={p => pushParams({ page: String(p) })}
                    />
                </div>
            )}

            <style jsx global>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up { animation: fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both; }
            `}</style>
        </div>
    )
}

// ── Tag card ──────────────────────────────────────────────────────────────────

function TagCard({
                     tag,
                     isAuthenticated,
                     isToggling,
                     onToggleFollow,
                 }: {
    tag: DetailedTag
    isAuthenticated: boolean
    isToggling: boolean
    onToggleFollow: (tag: DetailedTag) => void
}) {
    return (
        <div className={cn(
            'flex flex-col gap-3 p-4 border transition-colors duration-150 h-full',
            tag.isFollowed
                ? 'border-primary/30 bg-primary/[0.03]'
                : 'border-border/50 hover:border-border bg-card'
        )}>
            {/* Tag name + follow button */}
            <div className="flex items-start justify-between gap-2">
                <Link
                    href={`/questions?tags=${tag.name}`}
                    className="font-mono text-sm font-semibold text-primary hover:underline underline-offset-2 leading-tight"
                >
                    #{tag.name}
                </Link>

                {isAuthenticated && (
                    <button
                        type="button"
                        onClick={() => onToggleFollow(tag)}
                        disabled={isToggling}
                        title={tag.isFollowed ? 'Unfollow tag' : 'Follow tag'}
                        className={cn(
                            'flex items-center gap-1 text-[10px] font-semibold px-2 py-1 border transition-all duration-150 flex-shrink-0',
                            'disabled:opacity-40 disabled:cursor-not-allowed',
                            tag.isFollowed
                                ? 'border-primary/30 text-primary bg-primary/8 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                                : 'border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5'
                        )}
                    >
                        {isToggling ? (
                            <div className="h-3 w-3 border border-current border-t-transparent animate-spin" />
                        ) : tag.isFollowed ? (
                            <><CheckIcon className="h-2.5 w-2.5" weight="bold" /> Following</>
                        ) : (
                            <><PlusIcon className="h-2.5 w-2.5" weight="bold" /> Follow</>
                        )}
                    </button>
                )}
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2 flex-1">
                {tag.description || 'No description yet.'}
            </p>

            {/* Question count */}
            <p className="text-[10px] text-muted-foreground/50 font-medium">
                {parseInt(tag.questionCount, 10).toLocaleString()} question{parseInt(tag.questionCount, 10) !== 1 ? 's' : ''}
            </p>
        </div>
    )
}