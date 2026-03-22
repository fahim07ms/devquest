'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
    getQuestionById,
    getAnswersByQuestionId,
    getCommentsByParentId,
    createAnswer,
    createCommentOnParent,
    createCommentOnAnswer,
    getAnswerComments,
} from '@/lib/services/questionService'
import type { Question, Answer, Comment as CommentType } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { TiptapContent } from '@/components/editor/TiptapContent'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { VoteButtons } from '@/components/questions/VoteButtons'
import { AnswerCard } from '@/components/answers/AnswerCard'
import { CommentThread } from '@/components/comments/CommentThread'
import { TagBadge } from '@/components/ui/TagBadge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ArrowLeftIcon, ClockClockwiseIcon, PencilSimpleLineIcon, EyeIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import api from "@/lib/api";
import {QuestionDetailSkeleton} from "@/components/skeleton/QuestionDetailSkeleton";

export default function QuestionDetailPage() {
    const params = useParams()
    const questionId = params.questionId as string
    const { isAuthenticated, user } = useAuthStore()

    // States
    const [question, setQuestion] = useState<Question | null>(null)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [commentsMap, setCommentsMap] = useState<Record<string, CommentType[]>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [newAnswerBody, setNewAnswerBody] = useState<object>({})
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    // Fetch question details
    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true)
            try {
                const [qData, aData, qComments] = await Promise.all([
                    getQuestionById(questionId),
                    getAnswersByQuestionId(questionId),
                    getCommentsByParentId(questionId),
                ])

                setQuestion(qData)
                setAnswers(aData)

                const answerCommentsPromises = aData.map(a => getAnswerComments(a.id))
                const aCommentsResults = await Promise.all(answerCommentsPromises)

                const newCommentsMap: Record<string, CommentType[]> = {
                    [questionId]: qComments
                }
                aData.forEach((a, idx) => {
                    newCommentsMap[a.id] = aCommentsResults[idx]
                })
                setCommentsMap(newCommentsMap)
            } catch (error) {
                console.error(error)
                toast.error('Failed to load question details')
            } finally {
                setIsLoading(false)
            }
        }
        if (questionId) fetchAll()
    }, [questionId])

    const handleCreateAnswer = async () => {
        // Check if user is authenticated
        if (!isAuthenticated) return toast.error('Please log in.')

        // Check if the answer body is empty
        const isEmpty = !newAnswerBody || JSON.stringify(newAnswerBody) === '{}' || (newAnswerBody as any)?.content?.length === 0
        if (isEmpty) return toast.error('Answer cannot be empty.')

        setIsSubmittingAnswer(true)
        try {
            // Create the answer
            const res = await api.post(
                `/questions/${questionId}/answers`,
                { body: newAnswerBody }
            );
            const newAnswer = res.data.data;
            setAnswers(prev => [...prev, newAnswer])
            toast.success('Answer posted.')
        } catch {
            toast.error('Failed to post answer.')
        } finally {
            setIsSubmittingAnswer(false)
        }
    }

    const handleAddCommentToQuestion = async (parentId: string, body: object) => {
        const newComment = await createCommentOnParent(parentId, { body })
        setCommentsMap(prev => ({ ...prev, [parentId]: [...(prev[parentId] || []), newComment] }))
    }

    const handleAddCommentToAnswer = async (answerId: string, body: object) => {
        const newComment = await createCommentOnAnswer(answerId, { body })
        setCommentsMap(prev => ({ ...prev, [answerId]: [...(prev[answerId] || []), newComment] }))
    }

    // ── Loading skeleton ──
    if (isLoading) {
        <QuestionDetailSkeleton />
    }

    if (!question) {
        return (
            <div className="max-w-3xl mx-auto w-full px-5 py-20 text-center">
                <p className="text-muted-foreground">Question not found.</p>
                <Link href="/questions" className="text-sm text-primary hover:underline mt-3 block">
                    Back to questions
                </Link>
            </div>
        )
    }

    return (
        <div
            className={cn(
                'max-w-3xl mx-auto w-full px-5 py-8 pb-28 transition-opacity duration-500',
                mounted ? 'opacity-100' : 'opacity-0'
            )}
        >
            {/* ── Back ── */}
            <Link
                href="/questions"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 mb-7 group"
            >
                <ArrowLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
                All questions
            </Link>

            {/* ── Question header ── */}
            <div className="mb-7">
                <h1
                    className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4"
                    style={{ letterSpacing: '-0.03em' }}
                >
                    {question.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground mb-4">
                    <span>
                        Asked{' '}
                        <span className="text-foreground/80 font-medium">
                            {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                        </span>
                    </span>
                    {question.updatedAt !== question.createdAt && (
                        <span className="flex items-center gap-1">
                            <ClockClockwiseIcon className="h-3 w-3" />
                            Edited
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <EyeIcon className="h-3 w-3" />
                        {question.viewCount} views
                    </span>
                </div>

                {/* Tags */}
                {question.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {question.tags.map(tag => <TagBadge key={tag['tag_id']} tag={tag} size="sm" />)}
                    </div>
                )}
            </div>

            <div className="h-px bg-border/50 mb-7" />

            {/* ── Question body ── */}
            <div className="flex gap-5 mb-10">
                {/* Vote sidebar */}
                <div className="flex-shrink-0 w-9 flex flex-col items-center pt-0.5">
                    <VoteButtons score={question.voteScore} contentId={question.id} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="text-foreground/90 text-sm leading-relaxed mb-7">
                        <TiptapContent content={question.body} />
                    </div>

                    {/* Author + edit */}
                    <div className="flex items-end justify-between flex-wrap gap-4">
                        {user?.id === question.author.username && (
                            <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">
                                <PencilSimpleLineIcon className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        )}
                        <div className="ml-auto flex items-center gap-2.5 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2.5">
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground/70 leading-none mb-1">
                                    asked {new Date(question.createdAt).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                })}
                                </p>
                            </div>
                            <UserAvatar author={question.author} size="md" />
                        </div>
                    </div>

                    {/* Question comments */}
                    <div className="mt-5 pt-4 border-t border-border/30">
                        <CommentThread
                            comments={commentsMap[question.id] || []}
                            parentId={question.id}
                            onAddComment={handleAddCommentToQuestion}
                        />
                    </div>
                </div>
            </div>

            {/* ── Answers ── */}
            <div>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-1">
                    <h2
                        className="text-base font-bold text-foreground"
                        style={{ letterSpacing: '-0.02em' }}
                    >
                        {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                    </h2>
                    <div className="flex-1 h-px bg-border/40" />
                </div>

                {answers.length === 0 ? (
                    <div className="text-center py-14 rounded-xl border border-dashed border-border/50 bg-muted/10 mt-5 mb-8">
                        <p className="text-sm text-muted-foreground">
                            No answers yet. Be the first to help out.
                        </p>
                    </div>
                ) : (
                    <div className="mb-10">
                        {answers.map((answer, i) => (
                            <div
                                key={answer.id}
                                className="opacity-0 animate-fade-up"
                                style={{
                                    animationDelay: `${i * 60}ms`,
                                    animationFillMode: 'forwards',
                                }}
                            >
                                <AnswerCard answer={answer}>
                                    <CommentThread
                                        comments={commentsMap[answer.id] || []}
                                        parentId={answer.id}
                                        onAddComment={(pid, body) => handleAddCommentToAnswer(pid, body)}
                                    />
                                </AnswerCard>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Answer editor ── */}
            <div className="mt-10">
                <div className="flex items-center gap-3 mb-5">
                    <h3
                        className="text-base font-bold text-foreground"
                        style={{ letterSpacing: '-0.02em' }}
                    >
                        Your Answer
                    </h3>
                    <div className="flex-1 h-px bg-border/40" />
                </div>

                {isAuthenticated ? (
                    <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
                        <div className="p-5">
                            <TiptapEditor
                                placeholder="Write a clear, detailed answer. Code examples and context help a lot."
                                onChange={setNewAnswerBody}
                                minHeight="200px"
                            />
                        </div>
                        <div className="px-5 py-3.5 bg-muted/20 border-t border-border/40 flex justify-end">
                            <Button
                                size="sm"
                                onClick={handleCreateAnswer}
                                disabled={isSubmittingAnswer}
                                className="h-8 px-5 text-xs rounded-lg shadow-none"
                            >
                                {isSubmittingAnswer ? 'Posting…' : 'Post Answer'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 rounded-xl border border-dashed border-border/60 bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-3">
                            You must be signed in to answer.
                        </p>
                        <Button asChild size="sm" className="rounded-lg shadow-none h-8 px-5 text-xs">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
            `}</style>
        </div>
    )
}