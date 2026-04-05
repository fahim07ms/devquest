'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { CustomPagination } from '@/components/questions/Pagination'
import { TagBadge } from '@/components/ui/TagBadge'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Question } from '@/types'
import {
    TrophyIcon,
    MedalIcon,
    ChatDotsIcon,
    CheckCircleIcon,
    ArrowUpIcon,
    TagIcon,
    ArrowRightIcon,
    HashIcon,
    ListBulletsIcon,
} from '@phosphor-icons/react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardStats {
    username: string
    firstName: string | null
    lastName: string | null
    profilePicture: string | null
    bio: string | null
    website: string | null
    reputationPoints: number
    badgeCount: number
    questionCount: number
    answerCount: number
    acceptedAnswerCount: number
    followedTagCount: number
    createdAt: string
    acceptanceRate: number | null
}

interface FollowedTag {
    tag_id: string
    name: string
    description: string | null
    questionCount: string
    followedAt: string
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
                      icon: Icon,
                      label,
                      value,
                      sub,
                      href,
                  }: {
    icon: React.ElementType
    label: string
    value: string | number
    sub?: string
    href?: string
}) {
    const inner = (
        <div className={cn(
            'flex items-start gap-3 px-4 py-4 border border-border/40 bg-card h-full transition-colors duration-150 ',
            href && 'hover:border-primary/30 hover:bg-primary/[0.02] cursor-pointer'
        )}>
            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-muted/60 border border-border/40 mt-0.5">
                <Icon className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <div className="min-w-0">
                <p className="text-xl font-bold text-foreground tabular-nums leading-tight" style={{ letterSpacing: '-0.02em' }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{label}</p>
                {sub && <p className="text-[10px] text-muted-foreground/40 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
    if (href) return <Link href={href}>{inner}</Link>
    return inner
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const router = useRouter()
    const { isAuthenticated, user } = useAuthStore()

    const [stats,        setStats]        = useState<DashboardStats | null>(null)
    const [followedTags, setFollowedTags] = useState<FollowedTag[]>([])
    const [questions,    setQuestions]    = useState<Question[]>([])
    const [totalPages,   setTotalPages]   = useState(1)
    const [totalFeed,    setTotalFeed]    = useState(0)
    const [isFiltered,   setIsFiltered]   = useState(false)
    const [page,         setPage]         = useState(1)
    const [mounted,      setMounted]      = useState(false)
    const [statsLoading, setStatsLoading] = useState(true)
    const [feedLoading,  setFeedLoading]  = useState(true)

    useEffect(() => { setMounted(true) }, [])

    // Redirect unauthenticated users
    useEffect(() => {
        if (mounted && !isAuthenticated) router.push('/login')
    }, [mounted, isAuthenticated, router])

    // Fetch stats + followed tags in parallel
    useEffect(() => {
        if (!isAuthenticated) return
        const fetchStats = async () => {
            setStatsLoading(true)
            try {
                const [statsRes, tagsRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/tags/followed'),
                ])
                setStats(statsRes.data.data.stats)
                setFollowedTags(tagsRes.data.data.tags ?? [])
            } catch {
                toast.error('Failed to load dashboard.')
            } finally {
                setStatsLoading(false)
            }
        }
        fetchStats()
    }, [isAuthenticated])

    // Fetch feed (re-fetches when page changes)
    const fetchFeed = useCallback(async (p: number) => {
        if (!isAuthenticated) return
        setFeedLoading(true)
        try {
            const res = await api.get('/dashboard/feed', { params: { page: p, limit: 15 } })
            const data = res.data.data
            setQuestions(data.questions ?? [])
            setTotalPages(data.totalPages ?? 1)
            setTotalFeed(data.total ?? 0)
            setIsFiltered(data.isFiltered ?? false)
        } catch {
            toast.error('Failed to load feed.')
        } finally {
            setFeedLoading(false)
        }
    }, [isAuthenticated])

    useEffect(() => { fetchFeed(page) }, [page, fetchFeed])

    const displayName = stats
        ? [stats.firstName, stats.lastName].filter(Boolean).join(' ') || stats.username
        : user?.username ?? ''

    if (!mounted || (!isAuthenticated)) return null

    return (
        <div className={cn('max-w-5xl mx-auto w-full px-5 py-8 transition-opacity duration-500', mounted ? 'opacity-100' : 'opacity-0')}>

            {/* ── Page header ── */}
            <div className="mb-8">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-primary/70 mb-1">
                    Welcome back
                </p>
                <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: '-0.03em' }}>
                    {statsLoading ? (
                        <span className="inline-block h-7 w-48 bg-muted animate-pulse" />
                    ) : displayName}
                </h1>
                {stats && (
                    <p className="text-sm text-muted-foreground mt-1">
                        Member since {formatDistanceToNow(new Date(stats.createdAt), { addSuffix: true })}
                    </p>
                )}
            </div>

            {/* ── Stats grid ── */}
            {statsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-24 bg-muted animate-pulse" />
                    ))}
                </div>
            ) : stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 mb-8">
                    <StatCard
                        icon={TrophyIcon}
                        label="reputation"
                        value={stats.reputationPoints}
                        href={`/users/${stats.username}`}
                    />
                    <StatCard
                        icon={MedalIcon}
                        label="badges"
                        value={stats.badgeCount}
                        href={`/users/${stats.username}`}
                    />
                    <StatCard
                        icon={ChatDotsIcon}
                        label="questions"
                        value={stats.questionCount}
                        href={`/users/${stats.username}`}
                    />
                    <StatCard
                        icon={ArrowUpIcon}
                        label="answers"
                        value={stats.answerCount}
                        sub={`${stats.acceptedAnswerCount} accepted`}
                        href={`/users/${stats.username}`}
                    />
                    <StatCard
                        icon={TagIcon}
                        label="tags followed"
                        value={stats.followedTagCount}
                        href="/tags"
                    />
                    {stats.acceptanceRate !== undefined && (
                        <StatCard
                            icon={CheckCircleIcon}
                            label="acceptance rate"
                            value={stats.acceptanceRate + '%'}
                        />
                    )}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">

                {/* ── Feed (main column) ── */}
                <div className="flex-1 min-w-0">
                    {/* Feed header */}
                    <div className="flex items-center gap-3 mb-5">
                        <div>
                            <h2 className="text-base font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>
                                {isFiltered ? 'Your Feed' : 'All Questions'}
                            </h2>
                            {!feedLoading && (
                                <p className="text-xs text-muted-foreground/60 mt-0.5">
                                    {isFiltered
                                        ? `Questions from your ${followedTags.length} followed tag${followedTags.length !== 1 ? 's' : ''}`
                                        : 'Follow tags to see a personalised feed'
                                    }
                                </p>
                            )}
                        </div>
                        <div className="flex-1 h-px bg-border/40" />
                        <Link
                            href="/questions"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors duration-150 flex-shrink-0"
                        >
                            All questions
                            <ArrowRightIcon className="h-3 w-3" />
                        </Link>
                    </div>

                    {feedLoading ? (
                        <div className="flex flex-col">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="py-5 border-b border-border/40 last:border-0 animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-14 space-y-1.5">
                                            <div className="h-3 bg-muted w-full" />
                                            <div className="h-3 bg-muted w-3/4" />
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-4 bg-muted w-3/4" />
                                            <div className="h-3 bg-muted w-full" />
                                            <div className="flex gap-1">
                                                <div className="h-4 w-12 bg-muted" />
                                                <div className="h-4 w-10 bg-muted" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-border/60">
                            <ListBulletsIcon className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No questions yet.</p>
                            <Link href="/questions/ask" className="text-xs text-primary hover:underline mt-2 block">
                                Ask the first question →
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col">
                                {questions.map((q, i) => (
                                    <div
                                        key={q.id}
                                        className="opacity-0 animate-fade-up"
                                        style={{ animationDelay: `${i * 35}ms`, animationFillMode: 'forwards' }}
                                    >
                                        <QuestionCard question={q} />
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-8 pt-6 border-t border-border/40">
                                    <CustomPagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Sidebar (followed tags) ── */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="sticky top-20 space-y-5">

                        {/* Followed tags */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.1em]">
                                    Followed Tags
                                </h3>
                                <Link href="/tags" className="text-[10px] text-muted-foreground/60 hover:text-primary transition-colors">
                                    Browse all →
                                </Link>
                            </div>

                            {statsLoading ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="h-8 bg-muted animate-pulse" />
                                    ))}
                                </div>
                            ) : followedTags.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-border/40">
                                    <HashIcon className="h-6 w-6 text-muted-foreground/20 mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground/50 leading-snug">
                                        No tags followed yet.
                                    </p>
                                    <Link href="/tags" className="text-[11px] text-primary hover:underline mt-1.5 block">
                                        Explore tags →
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {followedTags.map(tag => (
                                        <TagBadge
                                            key={tag.tag_id}
                                            tag={{ tag_id: tag.tag_id, name: tag.name }}
                                            size="sm"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="h-px bg-border/40" />
                        <div>
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.1em] mb-3">
                                Quick Links
                            </h3>
                            <div className="flex flex-col gap-0.5">
                                {[
                                    { label: 'Ask a question',    href: '/questions/ask' },
                                    { label: 'My profile',        href: user ? `/users/${user.username}` : '/login' },
                                    { label: 'Bookmarks',         href: '/bookmarks' },
                                    { label: 'Manage tags',       href: '/tags' },
                                ].map(({ label, href }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors duration-150"
                                    >
                                        {label}
                                        <ArrowRightIcon className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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