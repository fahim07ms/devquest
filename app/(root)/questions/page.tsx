'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuestions, type GetQuestionsParams } from '@/lib/services/questionService'
import type { Question } from '@/types'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Funnel, PencilSimple } from '@phosphor-icons/react'
import { useAuthStore } from '@/store/authStore'

const SORT_TABS = [
    { label: 'Newest', value: 'createdAt' },
    { label: 'Active', value: 'lastActivityAt' },
    { label: 'Votes', value: 'voteScore' },
    { label: 'Unanswered', value: 'unanswered' },
]

export default function QuestionsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { isAuthenticated } = useAuthStore()

    const [questions, setQuestions] = useState<Question[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const search = searchParams.get('search') || undefined
    const sort = searchParams.get('sort') || 'createdAt'
    const tags = searchParams.get('tags') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true)
            try {
                // If sort === "unanswered", map to answersCount ascending
                const params: GetQuestionsParams = {
                    page,
                    limit: 15,
                    search,
                    tags,
                    sort: sort === 'unanswered' ? 'answersCount' : (sort as GetQuestionsParams['sort']),
                    order: sort === 'unanswered' ? 'asc' : 'desc',
                }
                const data = await getQuestions(params)
                setQuestions(data)
            } catch (error) {
                console.error('Failed to fetch questions:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchQuestions()
    }, [search, sort, tags, page])

    const updateSort = (newSort: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sort', newSort)
        params.delete('page')
        router.push(`/questions?${params.toString()}`)
    }

    return (
        <div className="max-w-5xl mx-auto w-full px-4 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {search ? `Search Results for "${search}"` : tags ? `Questions tagged [${tags}]` : 'All Questions'}
                </h1>
                {isAuthenticated && (
                    <Button asChild className="gap-2 sm:hidden">
                        <Link href="/questions/ask">
                            <PencilSimple className="h-4 w-4" />
                            Ask Question
                        </Link>
                    </Button>
                )}
            </div>

            {/* Filter / Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="text-sm text-muted-foreground font-medium">
                    {isLoading ? 'Loading...' : `${questions.length} questions`}
                </div>
                
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 overflow-x-auto">
                    {SORT_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => updateSort(tab.value)}
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap',
                                sort === tab.value
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 ml-2 border-l border-border pl-3">
                        <Funnel className="h-4 w-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="flex flex-col gap-4">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse border border-border" />
                    ))
                ) : questions.length === 0 ? (
                    <div className="text-center py-20 px-4 rounded-xl border border-dashed border-border bg-muted/10">
                        <p className="text-lg font-semibold text-foreground mb-2">No questions found</p>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            We couldn't find any questions matching your current filters and search terms.
                        </p>
                    </div>
                ) : (
                    questions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                    ))
                )}
            </div>
            
            {/* Pagination Controls placeholder */}
            {questions.length >= 15 && (
                <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                         <Button variant="outline" disabled={page === 1} onClick={() => {
                             const params = new URLSearchParams(searchParams.toString());
                             params.set('page', (page - 1).toString());
                             router.push(`/questions?${params.toString()}`);
                         }}>Previous</Button>
                         <Button variant="outline" onClick={() => {
                             const params = new URLSearchParams(searchParams.toString());
                             params.set('page', (page + 1).toString());
                             router.push(`/questions?${params.toString()}`);
                         }}>Next</Button>
                    </div>
                </div>
            )}
        </div>
    )
}
