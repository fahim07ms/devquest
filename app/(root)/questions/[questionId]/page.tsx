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
import { ArrowLeft, ClockClockwise, PencilSimpleLine } from '@phosphor-icons/react'

export default function QuestionDetailPage() {
    const params = useParams()
    const questionId = params.questionId as string
    const { isAuthenticated, user } = useAuthStore()

    const [question, setQuestion] = useState<Question | null>(null)
    const [answers, setAnswers] = useState<Answer[]>([])
    // Simple state mappings: parentId -> comments list
    const [commentsMap, setCommentsMap] = useState<Record<string, CommentType[]>>({})
    
    const [isLoading, setIsLoading] = useState(true)
    const [newAnswerBody, setNewAnswerBody] = useState<object>({})
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)

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
                
                // Fetch comments for all answers
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
        if (!isAuthenticated) return toast.error('Please log in.')
        
        const isEmpty = !newAnswerBody || JSON.stringify(newAnswerBody) === '{}' || (newAnswerBody as any)?.content?.length === 0
        if (isEmpty) return toast.error('Answer cannot be empty.')
        
        setIsSubmittingAnswer(true)
        try {
            const newAnswer = await createAnswer(questionId, { body: newAnswerBody })
            setAnswers(prev => [...prev, newAnswer])
            toast.success('Answer posted successfully.')
            // Scroll to newly added answer (could add native scroll logic here)
        } catch (error) {
            toast.error('Failed to post answer.')
        } finally {
            setIsSubmittingAnswer(false)
        }
    }

    const handleAddCommentToQuestion = async (parentId: string, body: object) => {
        const newComment = await createCommentOnParent(parentId, { body })
        setCommentsMap(prev => ({
            ...prev,
            [parentId]: [...(prev[parentId] || []), newComment]
        }))
    }

    const handleAddCommentToAnswer = async (answerId: string, body: object) => {
        const newComment = await createCommentOnAnswer(answerId, { body })
        setCommentsMap(prev => ({
            ...prev,
            [answerId]: [...(prev[answerId] || []), newComment]
        }))
    }

    if (isLoading) return <div className="p-8"><div className="animate-pulse h-10 w-2/3 bg-muted rounded mb-4" /></div>
    if (!question) return <div className="p-8 text-center text-muted-foreground">Question not found.</div>

    return (
        <div className="max-w-4xl mx-auto w-full px-4 py-8 pb-32">
            <Link href="/questions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to questions
            </Link>

            {/* Title & Meta Header */}
            <div className="border-b border-border/60 pb-6 mb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                    {question.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground border-b border-border/40 pb-4 mb-4">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground/80">Asked</span>
                        {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                    </div>
                    {question.updatedAt !== question.createdAt && (
                        <div className="flex items-center gap-1.5" title={new Date(question.updatedAt).toLocaleString()}>
                            <ClockClockwise className="h-4 w-4" />
                            <span className="font-semibold text-foreground/80">Edited</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground/80">Viewed</span>
                        {question.viewCount} times
                    </div>
                </div>

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {question.tags.map(tag => <TagBadge key={tag.id} tag={tag} size="md" />)}
                    </div>
                )}
            </div>

            {/* Question Body Area */}
            <div className="flex gap-4 sm:gap-6 mb-12">
                {/* Vote Left Sidebar */}
                <div className="flex-shrink-0 w-12 pt-2">
                    <VoteButtons score={question.voteScore} contentId={question.id} />
                </div>
                
                {/* Main Body */}
                <div className="flex-1 min-w-0">
                    <div className="text-foreground/90 text-base mb-8">
                        <TiptapContent content={question.body} />
                    </div>

                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                            {user?.id === question.author.username && ( // Assuming username acts as ID or adapt as needed
                                <button className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                                    <PencilSimpleLine className="h-4 w-4" /> Edit
                                </button>
                            )}
                        </div>
                        
                        {/* Author Card */}
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 min-w-[240px]">
                            <div className="text-xs text-muted-foreground mb-2">
                                asked {new Date(question.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}
                            </div>
                            <UserAvatar author={question.author} size="lg" />
                        </div>
                    </div>

                    {/* Question Comments */}
                    <div className="mt-6 pt-4 border-t border-border/40">
                         <CommentThread 
                            comments={commentsMap[question.id] || []}
                            parentId={question.id}
                            onAddComment={handleAddCommentToQuestion}
                         />
                    </div>
                </div>
            </div>

            {/* Answers Section */}
            <div className="mt-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                </h3>
                
                {answers.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 border border-dashed border-border rounded-xl mb-8">
                        <p className="text-muted-foreground">No answers yet. Be the first to help out!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 mb-12">
                        {answers.map((answer) => (
                            <AnswerCard 
                                key={answer.id} 
                                answer={answer}
                                // Coming soon: onAccept logic if viewing user is question author
                            >
                                <div className="mt-4 pt-4 border-t border-border/40">
                                    <CommentThread 
                                        comments={commentsMap[answer.id] || []}
                                        parentId={answer.id}
                                        onAddComment={(pid, body) => handleAddCommentToAnswer(pid, body)}
                                    />
                                </div>
                            </AnswerCard>
                        ))}
                    </div>
                )}
            </div>

            {/* Your Answer Editor */}
            <div className="mt-12 bg-card rounded-xl border border-border overflow-hidden">
                <div className="bg-muted/40 px-6 py-4 border-b border-border">
                    <h3 className="text-lg font-semibold">Your Answer</h3>
                </div>
                <div className="p-6">
                    {isAuthenticated ? (
                        <>
                            <TiptapEditor 
                                placeholder="Write your detailed answer here. You can use markdown shortcuts..." 
                                onChange={setNewAnswerBody} 
                                minHeight="240px"
                            />
                            <div className="mt-6 flex justify-end">
                                <Button size="lg" onClick={handleCreateAnswer} disabled={isSubmittingAnswer}>
                                    {isSubmittingAnswer ? 'Posting Answer...' : 'Post Your Answer'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">You must be logged in to answer this question.</p>
                            <Button asChild><Link href="/login">Log In to Answer</Link></Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
