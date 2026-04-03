'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { TagBadge } from '@/components/ui/TagBadge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Badge, BadgeTier, ReputationHistory, Tag } from '@/types'
import {
    PencilSimpleIcon,
    LinkSimpleIcon,
    CalendarBlankIcon,
    TrophyIcon,
    MedalIcon,
    ChatDotsIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    ArrowLeftIcon,
} from '@phosphor-icons/react'
import {UserProfilePageSkeleton} from "@/components/skeleton/UserProfilePageSkeleton";
import {ProfileAvatar} from "@/components/users/ProfileAvatar";
import {EditDrawer} from "@/components/users/EditDrawer";
import {ReputationRow} from "@/components/users/ReputationRow";
import {BadgeCard} from "@/components/users/BadgeCard";

export interface UserProfile {
    id: string
    username: string
    role: string
    reputationPoints: number
    badgeCount: number
    createdAt: string
    firstName?: string
    lastName?: string
    bio?: string
    website?: string
    profilePicture?: string
}


interface UserQuestion {
    id: string
    title: string
    voteScore: number
    answersCount: number
    viewCount: number
    createdAt: string
    isAnswered: boolean
    tags?: Tag[]
}

interface UserAnswer {
    id: string
    questionId: string
    questionTitle: string
    voteScore: number
    createdAt: string
    isAccepted: boolean
}

type ActiveTab = 'questions' | 'answers' | 'badges' | 'reputation'


export const TIER_STYLES: Record<BadgeTier, { ring: string; bg: string; label: string; dot: string }> = {
    gold:   { ring: 'border-amber-400/60',   bg: 'bg-amber-400/10',   label: 'text-amber-600 dark:text-amber-400',   dot: 'bg-amber-400' },
    silver: { ring: 'border-slate-400/60',   bg: 'bg-slate-400/10',   label: 'text-slate-600 dark:text-slate-300',   dot: 'bg-slate-400' },
    bronze: { ring: 'border-orange-700/60',  bg: 'bg-orange-700/10',  label: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-700' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
            <span className="text-sm text-foreground font-medium tabular-nums">{value}</span>
            <span className="text-xs text-muted-foreground/60">{label}</span>
        </div>
    )
}

export default function UserProfilePage() {
    const params   = useParams()
    const username  = params.username as string
    const { user: authUser, isAuthenticated } = useAuthStore()

    const [profile,     setProfile]     = useState<UserProfile | null>(null)
    const [questions,   setQuestions]   = useState<UserQuestion[]>([])
    const [answers,     setAnswers]     = useState<UserAnswer[]>([])
    const [badges,      setBadges]      = useState<Badge[]>([])
    const [reputation,  setReputation]  = useState<ReputationHistory[]>([])
    const [activeTab,   setActiveTab]   = useState<ActiveTab>('questions')
    const [isLoading,   setIsLoading]   = useState(true)
    const [mounted,     setMounted]     = useState(false)
    const [editOpen,    setEditOpen]    = useState(false)

    // Track if auxiliary tabs haven't been fetched yet (lazy load)
    const [badgesFetched,     setBadgesFetched]     = useState(false)
    const [reputationFetched, setReputationFetched] = useState(false)

    const isOwnProfile = isAuthenticated && authUser?.username === username

    useEffect(() => { setMounted(true) }, [])

    // Initial data fetch — profile, questions, answers
    useEffect(() => {
        if (!username) return
        const fetchCore = async () => {
            setIsLoading(true)
            try {
                const [profileRes, questionsRes, answersRes] = await Promise.all([
                    api.get(`/users/${username}`),
                    api.get(`/users/${username}/questions`),
                    api.get(`/users/${username}/answers`),
                ])
                setProfile(profileRes.data.data.user)
                setQuestions(questionsRes.data.data.questions ?? [])
                setAnswers(answersRes.data.data.answers ?? [])
            } catch {
                toast.error('Failed to load profile.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchCore()
    }, [username])

    // Lazy-fetch badges when the tab is activated
    useEffect(() => {
        if (activeTab !== 'badges' || badgesFetched || !profile) return
        const fetchBadges = async () => {
            try {
                const res = await api.get(`/users/${username}/badges`)
                setBadges(res.data.data.badges ?? [])
                setBadgesFetched(true)
            } catch {
                toast.error('Failed to load badges.')
            }
        }
        fetchBadges()
    }, [activeTab, badgesFetched, profile, username])

    // Lazy-fetch reputation history when the tab is activated (own profile only)
    useEffect(() => {
        if (activeTab !== 'reputation' || reputationFetched || !isOwnProfile) return
        const fetchReputation = async () => {
            try {
                const res = await api.get('/users/me/reputation')
                setReputation(res.data.data.history ?? [])
                setReputationFetched(true)
            } catch {
                toast.error('Failed to load reputation history.')
            }
        }
        fetchReputation()
    }, [activeTab, reputationFetched, isOwnProfile])

    const handleProfileSaved = (updated: Partial<UserProfile>) => {
        setProfile((prev) => (prev ? { ...prev, ...updated } : prev))
    }

    const displayName = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username
        : username

    const initials = profile
        ? ([profile.firstName, profile.lastName].filter(Boolean).map((n) => n![0].toUpperCase()).join('') || profile.username.slice(0, 2).toUpperCase())
        : username.slice(0, 2).toUpperCase()

    // Group badges by tier for the display
    const groupedBadges = badges.reduce<Record<BadgeTier, Badge[]>>(
        (acc, badge) => { acc[badge.tier] = [...(acc[badge.tier] || []), badge]; return acc },
        { gold: [], silver: [], bronze: [] }
    )

    const TABS: { key: ActiveTab; label: string; count?: number }[] = [
        { key: 'questions',  label: 'Questions',  count: questions.length },
        { key: 'answers',    label: 'Answers',    count: answers.length },
        { key: 'badges',     label: 'Badges',     count: profile?.badgeCount },
        ...(isOwnProfile ? [{ key: 'reputation' as ActiveTab, label: 'Reputation' }] : []),
    ]

    if (isLoading) {
        return <UserProfilePageSkeleton />;
    }

    if (!profile) {
        return (
            <div className="max-w-3xl mx-auto w-full px-5 py-20 text-center">
                <p className="text-muted-foreground mb-3">User not found.</p>
                <Link href="/questions" className="text-sm text-primary hover:underline">Back to questions</Link>
            </div>
        )
    }

    return (
        <>
            <div className={cn('max-w-3xl mx-auto w-full px-5 py-8 transition-opacity duration-500', mounted ? 'opacity-100' : 'opacity-0')}>

                {/* ── Back ── */}
                <Link href="/questions" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 mb-7 group">
                    <ArrowLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
                    All questions
                </Link>

                {/* ── Profile header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-7">
                    <ProfileAvatar src={profile.profilePicture} initials={initials} size="lg" />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground leading-tight" style={{ letterSpacing: '-0.03em' }}>
                                    {displayName}
                                </h1>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    @{profile.username}
                                    {profile.role !== 'member' && (
                                        <span className="ml-2 text-[10px] font-semibold tracking-wider uppercase text-primary/80 bg-primary/8 px-1.5 py-0.5 border border-primary/15">
                                            {profile.role}
                                        </span>
                                    )}
                                </p>
                            </div>
                            {isOwnProfile && (
                                <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="gap-1.5 h-8 text-xs shadow-none">
                                    <PencilSimpleIcon className="h-3.5 w-3.5" />
                                    Edit profile
                                </Button>
                            )}
                        </div>

                        {profile.bio && (
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-md">
                                {profile.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline underline-offset-2">
                                    <LinkSimpleIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                    {profile.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
                                <CalendarBlankIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Stats bar ── */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 px-5 bg-muted/20 border border-border/40 mb-7">
                    <StatPill icon={TrophyIcon}   label="reputation" value={profile.reputationPoints.toLocaleString()} />
                    <StatPill icon={MedalIcon}    label="badges"     value={profile.badgeCount} />
                    <StatPill icon={ChatDotsIcon} label="questions"  value={questions.length} />
                    <StatPill icon={ArrowUpIcon}  label="answers"    value={answers.length} />
                </div>

                {/* ── Tabs ── */}
                <div className="flex items-center gap-0 border-b border-border/40 mb-5">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'px-4 py-2.5 text-xs font-medium capitalize transition-colors duration-150 border-b-2 -mb-px',
                                activeTab === tab.key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="ml-1.5 text-[10px] tabular-nums text-muted-foreground/60">
                                    ({tab.count})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Questions tab ── */}
                {activeTab === 'questions' && (
                    <div className="flex flex-col" id={`questions`}>
                        {questions.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-border/50">
                                <p className="text-sm text-muted-foreground">No questions yet.</p>
                            </div>
                        ) : (
                            questions.map((q, i) => (
                                <div
                                    key={q.id}
                                    className="group flex gap-4 py-4 border-b border-border/40 last:border-0 hover:bg-muted/20 -mx-3 px-3 transition-colors duration-150 opacity-0 animate-fade-up"
                                    style={{ animationDelay: `${i * 35}ms`, animationFillMode: 'forwards' }}
                                >
                                    <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0 w-14 pt-0.5 text-right">
                                        <span className={cn('text-xs font-bold tabular-nums', q.voteScore > 0 ? 'text-primary' : 'text-muted-foreground/60')}>
                                            {q.voteScore} <span className="font-normal text-muted-foreground/50">votes</span>
                                        </span>
                                        <span className={cn('text-xs font-bold tabular-nums', q.answersCount > 0 ? 'text-emerald-500' : 'text-muted-foreground/60')}>
                                            {q.answersCount} <span className="font-normal text-muted-foreground/50">ans</span>
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/questions/${q.id}`} className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150 line-clamp-1" style={{ letterSpacing: '-0.01em' }}>
                                            {q.title}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {q.tags?.slice(0, 4).map((tag) => (
                                                <TagBadge key={tag['tag_id']} tag={tag} />
                                            ))}
                                            <span className="text-[11px] text-muted-foreground/50 ml-auto">
                                                {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ── Answers tab ── */}
                {activeTab === 'answers' && (
                    <div className="flex flex-col" id={`answers`}>
                        {answers.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-border/50">
                                <p className="text-sm text-muted-foreground">No answers yet.</p>
                            </div>
                        ) : (
                            answers.map((a, i) => (
                                <div
                                    key={a.id}
                                    className="group flex gap-4 py-4 border-b border-border/40 last:border-0 hover:bg-muted/20 -mx-3 px-3 transition-colors duration-150 opacity-0 animate-fade-up"
                                    style={{ animationDelay: `${i * 35}ms`, animationFillMode: 'forwards' }}
                                >
                                    <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0 w-14 pt-0.5 text-right">
                                        <span className={cn('text-xs font-bold tabular-nums', a.voteScore > 0 ? 'text-primary' : 'text-muted-foreground/60')}>
                                            {a.voteScore} <span className="font-normal text-muted-foreground/50">votes</span>
                                        </span>
                                        {a.isAccepted && <CheckCircleIcon weight="fill" className="h-3.5 w-3.5 text-emerald-500 ml-auto" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/questions/${a.questionId}`} className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150 line-clamp-1" style={{ letterSpacing: '-0.01em' }}>
                                            {a.questionTitle}
                                        </Link>
                                        <p className="text-[11px] text-muted-foreground/50 mt-1">
                                            {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                                            {a.isAccepted && <span className="ml-2 text-emerald-500 font-medium">· accepted</span>}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ── Badges tab ── */}
                {activeTab === 'badges' && (
                    <div id={`badges`}>
                        {!badgesFetched ? (
                            // skeleton
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-24 bg-muted animate-pulse" />
                                ))}
                            </div>
                        ) : badges.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-border/50">
                                <MedalIcon className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No badges earned yet.</p>
                                <p className="text-xs text-muted-foreground/50 mt-1">Keep contributing to earn your first badge.</p>
                            </div>
                        ) : (
                            // Group by tier: gold → silver → bronze
                            (['gold', 'silver', 'bronze'] as BadgeTier[]).map((tier) => {
                                const tierBadges = groupedBadges[tier]
                                if (!tierBadges.length) return null
                                const s = TIER_STYLES[tier]
                                return (
                                    <div key={tier} className="mb-7">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={cn('h-2 w-2', s.dot)} />
                                            <p className={cn('text-[10px] font-bold tracking-[0.15em] uppercase', s.label)}>
                                                {tier} · {tierBadges.length}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {tierBadges.map((badge, i) => (
                                                <div
                                                    key={badge.badgeId}
                                                    className="opacity-0 animate-fade-up"
                                                    style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
                                                >
                                                    <BadgeCard badge={badge} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}

                {/* ── Reputation tab (own profile only) ── */}
                {activeTab === 'reputation' && isOwnProfile && (
                    <div id={`reputations`}>
                        {/* Running total banner */}
                        <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border border-border/40 mb-5">
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60">Current total</p>
                                <p className="text-2xl font-bold text-foreground tabular-nums" style={{ letterSpacing: '-0.03em' }}>
                                    {profile.reputationPoints.toLocaleString()}
                                </p>
                            </div>
                            <TrophyIcon className="h-8 w-8 text-primary/20" weight="fill" />
                        </div>

                        {!reputationFetched ? (
                            <div className="space-y-px">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-12 bg-muted animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
                                ))}
                            </div>
                        ) : reputation.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-border/50">
                                <TrophyIcon className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No reputation history yet.</p>
                                <p className="text-xs text-muted-foreground/50 mt-1">Start by asking or answering questions.</p>
                            </div>
                        ) : (
                            <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
                                {reputation.map((entry) => (
                                    <ReputationRow key={entry.historyId} entry={entry} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Edit drawer ── */}
            {isOwnProfile && (
                <EditDrawer
                    open={editOpen}
                    profile={profile}
                    onClose={() => setEditOpen(false)}
                    onSaved={handleProfileSaved}
                />
            )}

            <style jsx global>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
            `}</style>
        </>
    )
}