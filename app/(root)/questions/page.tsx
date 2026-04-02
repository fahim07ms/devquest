'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Question } from '@/types'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    FunnelIcon,
    PencilSimpleIcon,
    XIcon,
    CheckIcon,
    MagnifyingGlassIcon,
    SortDescendingIcon,
    SortAscendingIcon,
    CurrencyDollarIcon,
} from '@phosphor-icons/react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { CustomPagination } from '@/components/questions/Pagination'

const SORT_TABS = [
    { label: 'Newest',   value: 'createdAt' },
    { label: 'Activity', value: 'lastActivityAt' },
    { label: 'Votes',    value: 'voteScore' },
    { label: 'Answers',  value: 'answersCount' },
]

const ANSWER_FILTERS = [
    { label: 'All',        value: '' },
    { label: 'Answered',   value: 'answered' },
    { label: 'Unanswered', value: 'unanswered' },
]

export default function QuestionsPage() {
    const router       = useRouter()
    const searchParams = useSearchParams()
    const { isAuthenticated } = useAuthStore()

    const [questions,   setQuestions]   = useState<Question[]>([])
    const [totalPages,  setTotalPages]  = useState(1)
    const [totalCount,  setTotalCount]  = useState(0)
    const [isLoading,   setIsLoading]   = useState(true)
    const [mounted,     setMounted]     = useState(false)
    const [filterOpen,  setFilterOpen]  = useState(false)
    const [allTags,     setAllTags]     = useState<{ tag_id: string; name: string }[]>([])
    const [tagSearch,   setTagSearch]   = useState('')
    const filterRef = useRef<HTMLDivElement>(null)

    // Read params
    const search       = searchParams.get('search')    || undefined
    const sort         = searchParams.get('sort')      || 'createdAt'
    const tagParam     = searchParams.get('tags')      || undefined
    const answerFilter = searchParams.get('answered')  || ''
    const bountyFilter = searchParams.get('hasBounty') || ''
    const page         = parseInt(searchParams.get('page') || '1', 10)
    const order        = searchParams.get('order')     || 'desc'
    const activeTags   = tagParam ? tagParam.split(',').filter(Boolean) : []

    useEffect(() => { setMounted(true) }, [])

    // Close filter panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node))
                setFilterOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Fetch available tags
    useEffect(() => {
        api.get('/tags').then(res => setAllTags(res.data?.data?.tags ?? [])).catch(() => {})
    }, [])

    // Fetch questions
    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true)
            try {
                // Resolve tag names → IDs for the API
                const tags = tagParam ? tagParam.split(',').filter(Boolean) : []
                const filteredTagIds = tags.length > 0
                    ? allTags.filter(t => tags.includes(t.name)).map(t => t.tag_id)
                    : []

                // Convert UI filter values to the API's expected format
                const answeredParam =
                    answerFilter === 'answered'   ? 'true'  :
                        answerFilter === 'unanswered' ? 'false' :
                            undefined

                const res = await api.get('/questions', {
                    params: {
                        page,
                        limit: 15,
                        search,
                        sort,
                        order,
                        tags:      filteredTagIds.join(',') || undefined,
                        answered:  answeredParam,
                        hasBounty: bountyFilter || undefined,
                    }
                })

                setQuestions(res.data.data.questions   ?? [])
                setTotalPages(res.data.data.totalPages  ?? 1)
                setTotalCount(res.data.data.totalQuestions ?? 0)
            } catch (err) {
                console.error('Failed to fetch questions:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchQuestions()
    }, [search, sort, order, tagParam, answerFilter, bountyFilter, page, allTags])

    const pushParams = (updates: Record<string, string | undefined>) => {
        const p = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([k, v]) => {
            if (v === undefined || v === '') p.delete(k)
            else p.set(k, v)
        })
        if (!('page' in updates)) p.delete('page')
        router.push(`/questions?${p.toString()}`)
    }

    const toggleTag = (tagName: string) => {
        const next = activeTags.includes(tagName)
            ? activeTags.filter(t => t !== tagName)
            : [...activeTags, tagName]
        pushParams({ tags: next.length ? next.join(',') : undefined })
    }

    const clearAllFilters = () => {
        const p = new URLSearchParams()
        if (search) p.set('search', search)
        router.push(`/questions?${p.toString()}`)
    }

    const hasActiveFilters = activeTags.length > 0 || !!answerFilter || !!bountyFilter
    const filteredTagList  = allTags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()))

    const pageTitle = search
        ? `Results for "${search}"`
        : activeTags.length > 0 ? `Tagged: ${activeTags.join(', ')}` : 'All Questions'

    return (
        <div className={cn('max-w-4xl mx-auto w-full px-5 py-8 transition-opacity duration-500', mounted ? 'opacity-100' : 'opacity-0')}>

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    {(search || activeTags.length > 0) && (
                        <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">
                            {activeTags.length > 0 ? 'Tag filter' : 'Search'}
                        </p>
                    )}
                    <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: '-0.03em' }}>
                        {pageTitle}
                    </h1>
                    {!isLoading && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {totalCount} question{totalCount !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
                {isAuthenticated && (
                    <Button asChild size="sm" className="gap-2 sm:hidden shadow-none h-9">
                        <Link href="/questions/ask">
                            <PencilSimpleIcon className="h-3.5 w-3.5" />
                            Ask Question
                        </Link>
                    </Button>
                )}
            </div>

            {/* ── Sort + filter bar ── */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {/* Sort tabs */}
                    <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 border border-border/40">
                        {SORT_TABS.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => pushParams({ sort: tab.value })}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap',
                                    sort === tab.value
                                        ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => pushParams({ order: order === 'desc' ? 'asc' : 'desc' })}
                    >
                        {order === 'desc' ? <SortDescendingIcon size={20} /> : <SortAscendingIcon size={20} />}
                    </Button>
                </div>

                {/* Filter button */}
                <div className="relative" ref={filterRef}>
                    <button
                        onClick={() => setFilterOpen(v => !v)}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border/40 hover:bg-muted/40 transition-all duration-150',
                            hasActiveFilters
                                ? 'text-primary border-primary/30 bg-primary/5'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <FunnelIcon className="h-3.5 w-3.5" weight={hasActiveFilters ? 'fill' : 'regular'} />
                        Filter
                        {hasActiveFilters && (
                            <span className="h-4 w-4 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold">
                                {activeTags.length + (answerFilter ? 1 : 0) + (bountyFilter ? 1 : 0)}
                            </span>
                        )}
                    </button>

                    {/* ── Filter panel ── */}
                    {filterOpen && (
                        <div className="absolute right-0 top-full mt-1.5 z-50 w-72 bg-popover border border-border shadow-lg shadow-black/10">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                                <span className="text-xs font-semibold text-foreground">Filters</span>
                                <div className="flex items-center gap-3">
                                    {hasActiveFilters && (
                                        <button onClick={clearAllFilters} className="text-[11px] text-muted-foreground hover:text-destructive transition-colors">
                                            Clear all
                                        </button>
                                    )}
                                    <button onClick={() => setFilterOpen(false)} className="text-muted-foreground hover:text-foreground">
                                        <XIcon className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 space-y-5">
                                {/* Answer status */}
                                <div>
                                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-2">
                                        Answer status
                                    </p>
                                    <div className="flex flex-col gap-0.5">
                                        {ANSWER_FILTERS.map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => pushParams({ answered: f.value || undefined })}
                                                className={cn(
                                                    'flex items-center justify-between px-3 py-2 text-xs transition-colors duration-150 text-left',
                                                    answerFilter === f.value
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-foreground/80 hover:bg-muted/50'
                                                )}
                                            >
                                                {f.label}
                                                {answerFilter === f.value && <CheckIcon className="h-3 w-3 text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bounty filter */}
                                <div>
                                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-2">
                                        Bounty
                                    </p>
                                    <div className="flex flex-col gap-0.5">
                                        {[
                                            { label: 'All questions',    value: '' },
                                            { label: 'Has active bounty', value: 'true' },
                                        ].map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => pushParams({ hasBounty: f.value || undefined })}
                                                className={cn(
                                                    'flex items-center justify-between px-3 py-2 text-xs transition-colors duration-150 text-left',
                                                    bountyFilter === f.value
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-foreground/80 hover:bg-muted/50'
                                                )}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    {f.value === 'true' && (
                                                        <CurrencyDollarIcon className="h-3 w-3 text-blue-500" />
                                                    )}
                                                    {f.label}
                                                </span>
                                                {bountyFilter === f.value && <CheckIcon className="h-3 w-3 text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-2">
                                        Tags
                                    </p>

                                    {activeTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {activeTags.map(name => (
                                                <button
                                                    key={name}
                                                    onClick={() => toggleTag(name)}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors duration-150"
                                                >
                                                    {name} <XIcon className="h-2.5 w-2.5" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="relative mb-2">
                                        <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
                                        <input
                                            type="text"
                                            value={tagSearch}
                                            onChange={e => setTagSearch(e.target.value)}
                                            placeholder="Search tags…"
                                            className="w-full pl-7 pr-3 py-1.5 text-xs bg-muted/40 border border-border/40 outline-none focus:border-primary/40 transition-colors"
                                        />
                                    </div>

                                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                                        {filteredTagList.length === 0 ? (
                                            <p className="text-xs text-muted-foreground/50 px-2 py-2">No tags found.</p>
                                        ) : (
                                            filteredTagList.map(tag => {
                                                const active = activeTags.includes(tag.name)
                                                return (
                                                    <button
                                                        key={tag['tag_id']}
                                                        onClick={() => toggleTag(tag.name)}
                                                        className={cn(
                                                            'flex items-center justify-between w-full px-2.5 py-1.5 text-xs transition-colors duration-150',
                                                            active ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted/50'
                                                        )}
                                                    >
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="h-1 w-1 bg-current opacity-50 flex-shrink-0" />
                                                            {tag.name}
                                                        </span>
                                                        {active && <CheckIcon className="h-3 w-3 flex-shrink-0" />}
                                                    </button>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Active filter chips ── */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 mb-4 pt-2">
                    <span className="text-[11px] text-muted-foreground/60">Active filters:</span>
                    {answerFilter && (
                        <button onClick={() => pushParams({ answered: undefined })} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 hover:opacity-70 transition-opacity">
                            {ANSWER_FILTERS.find(f => f.value === answerFilter)?.label}
                            <XIcon className="h-2.5 w-2.5" />
                        </button>
                    )}
                    {bountyFilter && (
                        <button onClick={() => pushParams({ hasBounty: undefined })} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:opacity-70 transition-opacity">
                            <CurrencyDollarIcon className="h-3 w-3" />
                            Has bounty
                            <XIcon className="h-2.5 w-2.5" />
                        </button>
                    )}
                    {activeTags.map(name => (
                        <button key={name} onClick={() => toggleTag(name)} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 hover:opacity-70 transition-opacity">
                            {name} <XIcon className="h-2.5 w-2.5" />
                        </button>
                    ))}
                    <button onClick={clearAllFilters} className="text-[11px] text-muted-foreground/60 hover:text-destructive transition-colors ml-1">
                        Clear all
                    </button>
                </div>
            )}

            <div className="h-px bg-border/40 mb-5" />

            {/* ── Question list ── */}
            <div className="flex flex-col">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="py-5 border-b border-border/40 last:border-0 animate-pulse" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-16 space-y-2 pt-1">
                                    <div className="h-3 w-full bg-muted" />
                                    <div className="h-3 w-3/4 bg-muted" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-muted" />
                                    <div className="h-3 w-full bg-muted" />
                                    <div className="flex gap-1">
                                        <div className="h-4 w-12 bg-muted" />
                                        <div className="h-4 w-10 bg-muted" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : questions.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-border/60 bg-muted/10">
                        <p className="text-base font-semibold text-foreground mb-1.5">No questions found</p>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                            Nothing matched your current filters. Try adjusting the search or sort.
                        </p>
                        {hasActiveFilters && (
                            <button onClick={clearAllFilters} className="text-xs text-primary hover:underline">
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    questions.map((question, i) => (
                        <div
                            key={question.id}
                            className="opacity-0 animate-fade-up"
                            style={{ animationDelay: `${i * 35}ms`, animationFillMode: 'forwards' }}
                        >
                            <QuestionCard question={question} />
                        </div>
                    ))
                )}
            </div>

            {/* ── Pagination ── */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-border/40">
                    <CustomPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={newPage => pushParams({ page: String(newPage) })}
                    />
                </div>
            )}

            <style jsx global>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up { animation: fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both; }
            `}</style>
        </div>
    )
}