'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
    TagIcon,
    MagnifyingGlassIcon,
    ArrowRightIcon
} from '@phosphor-icons/react'
import api from '@/lib/api'
import { CustomPagination } from '@/components/questions/Pagination'

interface Tag {
    tag_id: string
    name: string
    description: string
    questionCount: string | number
}

export default function TagsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State
    const [tags, setTags] = useState<Tag[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

    // Params
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)

    useEffect(() => { setMounted(true) }, [])

    // Fetch tags
    useEffect(() => {
        const fetchTags = async () => {
            setIsLoading(true)
            try {
                const res = await api.get('/tags/detailed', {
                    params: {
                        page,
                        limit: 12,
                        search,
                    }
                })

                setTags(res.data.data.tags || [])
                setTotalPages(res.data.data.totalPages || 1)
                setTotalCount(res.data.data.totalTags || 0)
            } catch (err) {
                console.error('Failed to fetch tags:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTags()
    }, [search, page])

    const pushParams = (updates: Record<string, string | undefined>) => {
        const p = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([k, v]) => {
            if (v === undefined || v === '') p.delete(k)
            else p.set(k, v)
        })
        if (!('page' in updates)) p.delete('page')
        router.push(`/tags?${p.toString()}`)
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        pushParams({ search: searchValue })
    }

    return (
        <div className={cn('max-w-5xl mx-auto w-full px-5 py-8 transition-opacity duration-500', mounted ? 'opacity-100' : 'opacity-0')}>

            {/* ── Header ── */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2" style={{ letterSpacing: '-0.03em' }}>
                    Tags
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    A tag is a keyword or label that categorizes your question with other, similar questions.
                    Using the right tags makes it easier for others to find and answer your question.
                </p>
            </div>

            {/* ── Search Bar ── */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Filter by tag name..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border/60 focus:border-primary/40 outline-none transition-all"
                    />
                </form>
                {!isLoading && (
                    <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                        {totalCount} total tags
                    </span>
                )}
            </div>

            {/* ── Tags Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-32 bg-muted/40 animate-pulse border border-border/40" />
                    ))
                ) : tags.length === 0 ? (
                    <div className="col-span-full text-center py-20 border border-dashed border-border/60">
                        <p className="text-sm text-muted-foreground">No tags found matching your search.</p>
                    </div>
                ) : (
                    tags.map((tag, i) => (
                        <div
                            key={tag.tag_id}
                            className="group p-5 border border-border/60 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 flex flex-col animate-fade-up"
                            style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'forwards' }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <Link
                                    href={`/questions?tags=${tag.name}`}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors"
                                >
                                    <TagIcon size={12} />
                                    {tag.name}
                                </Link>
                                <span className="text-[11px] font-medium text-muted-foreground/60">
                                    {tag.questionCount} questions
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed flex-grow">
                                {tag.description || "No description available for this tag."}
                            </p>
                            <Link
                                href={`/questions?tags=${tag.name}`}
                                className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 group-hover:text-primary flex items-center gap-1 transition-colors"
                            >
                                View questions <ArrowRightIcon size={10} />
                            </Link>
                        </div>
                    ))
                )}
            </div>

            {/* ── Pagination ── */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-12 pt-6 border-t border-border/40">
                    <CustomPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(newPage) => pushParams({ page: String(newPage) })}
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