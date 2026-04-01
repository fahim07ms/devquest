'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Question } from '@/types'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { cn } from '@/lib/utils'
import { BookmarkSimple } from '@phosphor-icons/react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { CustomPagination } from "@/components/questions/Pagination";

export default function BookmarksPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { isAuthenticated } = useAuthStore()

    // State
    const [questions, setQuestions]   = useState<Question[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading]   = useState(true)
    const [mounted, setMounted]       = useState(false)

    // Params
    const page = parseInt(searchParams.get('page') || '1', 10)

    useEffect(() => { setMounted(true) }, [])

    // Redirect or fetch logic
    useEffect(() => {
        // If not authenticated (and we've mounted so we are sure), 
        // we can't fetch bookmarks. The user should log in.
        if (mounted && !isAuthenticated) {
            router.push('/login?redirect=/bookmarks');
            return;
        }

        if (!isAuthenticated) return;

        const fetchBookmarks = async () => {
            setIsLoading(true)
            try {
                const res = await api.get('/bookmarks', {
                    params: {
                        page,
                        limit: 15,
                    }
                })

                setQuestions(res.data.data.questions || [])
                setTotalPages(res.data.data.totalPages || 1)
                setTotalCount(res.data.data.totalQuestions || 0)

            } catch (err) {
                console.error('Failed to fetch bookmarks:', err)
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchBookmarks()
    }, [page, mounted, isAuthenticated, router])

    const pushPage = (newPage: number) => {
        const p = new URLSearchParams(searchParams.toString())
        if (newPage === 1) p.delete('page')
        else p.set('page', String(newPage))
        router.push(`/bookmarks?${p.toString()}`)
    }

    if (!mounted) return null;

    return (
        <div className={cn('max-w-4xl mx-auto w-full px-5 py-8 transition-opacity duration-500', mounted ? 'opacity-100' : 'opacity-0')}>

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-2.5 mb-2">
                        <BookmarkSimple className="h-6 w-6 text-primary" weight="fill" />
                        <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: '-0.03em' }}>
                            Saved Bookmarks
                        </h1>
                    </div>
                    {!isLoading && (
                        <p className="text-sm text-muted-foreground mt-1">
                            You have saved {totalCount} question{totalCount !== 1 ? 's' : ''}.
                        </p>
                    )}
                </div>
            </div>

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
                                    <div className="h-3 w-2/3 bg-muted" />
                                    <div className="flex gap-1">
                                        <div className="h-4 w-12 bg-muted" />
                                        <div className="h-4 w-10 bg-muted" />
                                        <div className="h-4 w-14 bg-muted" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : questions.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-border/60 bg-muted/10">
                        <BookmarkSimple className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" weight="duotone" />
                        <p className="text-base font-semibold text-foreground mb-1.5">No bookmarks found</p>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                            You haven't saved any questions yet. Find interesting questions and click the save button to revisit them later.
                        </p>
                    </div>
                ) : (
                    questions.map((question, i) => (
                        <div
                            key={question.id}
                            className="opacity-0 animate-fade-up relative"
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
                        onPageChange={(newPage) => pushPage(newPage)}
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
