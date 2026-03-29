'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Question, Answer, Comment as CommentType } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { TiptapContent } from '@/components/editor/TiptapContent'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { VoteButtons } from '@/components/questions/VoteButtons'
import { TagBadge } from '@/components/ui/TagBadge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
    ArrowLeftIcon, ClockClockwiseIcon, PencilSimpleLineIcon,
    EyeIcon, CheckCircleIcon, TrashIcon, ArrowBendDownRightIcon, LockKeyIcon
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { JSONContent } from '@tiptap/core'
import { ActionBtn } from "@/components/questions/ActionBtn";
import { InlineEditFooter } from "@/components/questions/InlineEditFooter";
import { CommentThread } from "@/components/comments/CommentThread";
import { AnswerCard } from "@/components/answers/AnswerCard";
import {FlagButton} from "@/components/flags/FlagButton";
import {FlagDialog} from "@/components/flags/FlagDialog";

export default function QuestionDetailPage() {
    const params = useParams();
    const questionId = params.questionId as string;
    const { isAuthenticated, user } = useAuthStore();
    const [isOwn, setIsOwn] = useState(false)

    // State
    const [question, setQuestion]           = useState<Question | null>(null)
    const [answers, setAnswers]             = useState<Answer[]>([])
    const [commentsMap, setCommentsMap]     = useState<Record<string, CommentType[]>>({})
    const [isLoading, setIsLoading]         = useState(true)
    const [mounted, setMounted]             = useState(false)
    const [isEditingQuestion, setIsEditingQuestion] = useState(false)
    const [questionEditBody, setQuestionEditBody]   = useState<JSONContent>({})
    const [isSavingQuestion, setIsSavingQuestion]   = useState(false)
    const [newAnswerBody, setNewAnswerBody]           = useState<JSONContent>({})
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
    const [flagDialogOpen, setFlagDialogOpen] = useState(false);


    useEffect(() => { setMounted(true) }, [])

    // Fetch data
    useEffect(() => {
        if (!questionId) return
        const fetchAll = async () => {
            setIsLoading(true)
            try {
                // Fetch question and answers
                const [qRes, aRes, cRes] = await Promise.all([
                    api.get(`/questions/${questionId}`),
                    api.get(`/questions/${questionId}/answers`),
                    api.get(`/questions/${questionId}/comments`),
                ])
                const qData: Question      = qRes.data.data.question
                const aData: Answer[]      = aRes.data.data.answers
                const qComments: CommentType[] = cRes.data.data.comments

                setIsOwn(!!currentUserId && qData.author?.authorId === currentUserId);

                setQuestion(qData); setAnswers(aData)

                // Fetch comments for each answer
                const aCommentResults = await Promise.all(aData.map(a => api.get(`/answers/${a.id}/comments`)))
                const map: Record<string, CommentType[]> = { [questionId]: qComments }

                // Map comments to answers
                aData.forEach((a, i) => { map[a.id] = aCommentResults[i].data.data.comments })

                // Map comments to comments
                setCommentsMap(map)
            } catch { toast.error('Failed to load question.') }
            finally { setIsLoading(false) }
        }
        fetchAll()
    }, [questionId])

    const handleCommentAdded  = useCallback((parentId: string, comment: CommentType) =>
        setCommentsMap(prev => ({ ...prev, [parentId]: [...(prev[parentId] || []), comment] })), [])

    const handleCommentEdited = useCallback((commentId: string, updated: CommentType) =>
        setCommentsMap(prev => {
            const next = { ...prev }
            for (const key of Object.keys(next)) next[key] = next[key].map(c => c.id === commentId ? updated : c)
            return next
        }), [])

    const handleCommentDeleted = useCallback((commentId: string) =>
        setCommentsMap(prev => {
            const next = { ...prev }
            for (const key of Object.keys(next)) next[key] = next[key].filter(c => c.id !== commentId)
            return next
        }), [])

    const handleSaveQuestion = async () => {
        if (!question) return
        setIsSavingQuestion(true)
        try {
            const res = await api.put(`/questions/${questionId}`, { title: question.title, body: questionEditBody, tags: question.tags })
            setQuestion(res.data.data.question); setIsEditingQuestion(false)
            toast.success('Question updated.')
        } catch { toast.error('Failed to update question.') }
        finally { setIsSavingQuestion(false) }
    }

    const handleCreateAnswer = async () => {
        if (!isAuthenticated) return toast.error('Please log in.')
        const empty = !newAnswerBody || JSON.stringify(newAnswerBody) === '{}' || (newAnswerBody as any)?.content?.length === 0
        if (empty) return toast.error('Answer cannot be empty.')
        setIsSubmittingAnswer(true)
        try {
            const res = await api.post(`/questions/${questionId}/answers`, { body: newAnswerBody })
            setAnswers(prev => [...prev, res.data.data.answer]); setNewAnswerBody({})
            toast.success('Answer posted.')
        } catch { toast.error('Failed to post answer.') }
        finally { setIsSubmittingAnswer(false) }
    }

    const handleAnswerEdited  = useCallback((id: string, updated: Answer) =>
        setAnswers(prev => prev.map(a => a.id === id ? updated : a)), [])

    const handleAnswerDeleted = useCallback((id: string) =>
        setAnswers(prev => prev.filter(a => a.id !== id)), [])

    const handleAccept = useCallback((answerId: string, accepted: boolean) =>
        setAnswers(prev => prev.map(a => ({
            ...a, isAccepted: a.id === answerId ? accepted : (accepted ? false : a.isAccepted)
        }))), [])

    const currentUserId     = user?.id
    const isQuestionAuthor  = !!(question && user?.username === question.author?.username)
    const hasAcceptedAnswer = answers.some(a => a.isAccepted)
    const isModerator       = user?.role === 'admin' || user?.role === 'moderator'

    const handleUnfreezeQuestion = async () => {
        if (!question) return;
        try {
            await api.patch(`/flags/content/${question.id}/unfreeze`);
            setQuestion({ ...question, isFrozen: false });
            toast.success('Question unfrozen.');
        } catch {
            toast.error('Failed to unfreeze question.');
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto w-full px-5 py-8 animate-pulse">
                <div className="h-3 w-24 bg-muted mb-8" />
                <div className="h-7 w-3/4 bg-muted mb-3" />
                <div className="h-7 w-1/2 bg-muted mb-6" />
                <div className="h-px bg-muted mb-6" />
                {[90,100,80,70,50].map((w,i) => <div key={i} className="h-3 bg-muted mb-3" style={{width:`${w}%`}} />)}
            </div>
        )
    }

    if (!question) {
        return (
            <div className="max-w-3xl mx-auto w-full px-5 py-20 text-center">
                <p className="text-muted-foreground">Question not found.</p>
                <Link href="/questions" className="text-sm text-primary hover:underline mt-3 block">Back to questions</Link>
            </div>
        )
    }

    return (
        <div className={cn('max-w-3xl mx-auto w-full px-5 py-8 pb-28 transition-opacity duration-500', mounted ? 'opacity-100' : 'opacity-0')}>

            <Link href="/questions" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 mb-7 group">
                <ArrowLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" /> All questions
            </Link>

            {/* ── Question header ── */}
            <div className="mb-7">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
                    {question.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground mb-4">
                    <span>Asked <span className="text-foreground/80 font-medium">{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span></span>
                    {question.updatedAt !== question.createdAt && <span className="flex items-center gap-1"><ClockClockwiseIcon className="h-3 w-3" /> Edited</span>}
                    <span className="flex items-center gap-1"><EyeIcon className="h-3 w-3" /> {question.viewCount} views</span>
                </div>
                {question.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {question.tags.map(tag => <TagBadge key={tag['tag_id']} tag={tag} size="sm" />)}
                    </div>
                )}
            </div>

            {question.isFrozen && (
                <div className="mb-7 px-4 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex flex-wrap items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                        <LockKeyIcon className="h-5 w-5 shrink-0" weight="fill" />
                        This question has been frozen by a moderator and is hidden from the public.
                    </div>
                    {isModerator && (
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleUnfreezeQuestion} 
                            className="h-8 border-amber-500/30 hover:bg-amber-500/20 text-amber-700 dark:hover:text-amber-300 dark:text-amber-400 shrink-0 shadow-none bg-transparent"
                        >
                            Unfreeze Content
                        </Button>
                    )}
                </div>
            )}

            <div className="h-px bg-border/50 mb-7" />

            {/* ── Question body ── */}
            <div className="flex gap-5 mb-10">
                <div className="flex-shrink-0 w-9 flex flex-col items-center pt-0.5">
                    <VoteButtons score={question.voteScore} contentId={question.id} />
                </div>

                <div className="flex-1 min-w-0">
                    {isEditingQuestion ? (
                        <>
                            <TiptapEditor onChange={setQuestionEditBody} initialContent={question.body as JSONContent} minHeight="240px" />
                            <InlineEditFooter onSave={handleSaveQuestion} onCancel={() => setIsEditingQuestion(false)} isSaving={isSavingQuestion} saveLabel="Update question" />
                        </>
                    ) : (
                        <div className="text-foreground/90 text-sm leading-relaxed mb-7">
                            <TiptapContent content={question.body} />
                        </div>
                    )}

                    {!isEditingQuestion && (
                        <>
                            <div className="flex items-end justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    {isQuestionAuthor && (
                                        <>
                                            <ActionBtn onClick={() => { setQuestionEditBody(question.body as JSONContent); setIsEditingQuestion(true) }} icon={PencilSimpleLineIcon} label="Edit" />
                                            <ActionBtn
                                                onClick={async () => {
                                                    if (!confirm('Delete this question? This cannot be undone.')) return
                                                    try { await api.delete(`/questions/${questionId}`); toast.success('Question deleted.'); window.location.href = '/questions' }
                                                    catch { toast.error('Failed to delete question.') }
                                                }}
                                                icon={TrashIcon} label="Delete" variant="danger"
                                            />
                                        </>
                                    )}
                                    {/* Flag — shown to authenticated non-owners, next to edit/delete */}
                                    {isAuthenticated && !isOwn && (
                                        <FlagButton
                                            variant="inline"
                                            onClick={() => setFlagDialogOpen(true)}
                                        />
                                    )}
                                </div>
                                <div className="ml-auto flex items-center gap-2.5 bg-primary/5 border border-primary/10 px-3 py-2.5">
                                    <p className="text-[10px] text-muted-foreground/70 leading-none">
                                        asked {new Date(question.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <UserAvatar author={question.author} size="md" />
                                </div>
                            </div>
                            <div className="mt-5 pt-4 border-t border-border/30">
                                <CommentThread
                                    comments={commentsMap[questionId] || []} parentId={questionId} parentType="question"
                                    currentUserId={currentUserId}
                                    recipientId={question.author.authorId}
                                    onCommentAdded={handleCommentAdded} onCommentEdited={handleCommentEdited}
                                    onCommentDeleted={handleCommentDeleted}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Answers ── */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-base font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>
                        {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                    </h2>
                    <div className="flex-1 h-px bg-border/40" />
                </div>

                {answers.length === 0 ? (
                    <div className="text-center py-14 border border-dashed border-border/50 bg-muted/10 mt-5 mb-8">
                        <p className="text-sm text-muted-foreground">No answers yet. Be the first to help out.</p>
                    </div>
                ) : (
                    <div className="mb-10">
                        {answers.map((answer, i) => (
                            <div key={answer.id} className="opacity-0 animate-fade-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}>
                                <AnswerCard
                                    answer={answer} isQuestionAuthor={isQuestionAuthor}
                                    hasAcceptedAnswer={hasAcceptedAnswer} currentUserId={currentUserId}
                                    comments={commentsMap[answer.id] || []}
                                    onAccept={handleAccept} onEdited={handleAnswerEdited} onDeleted={handleAnswerDeleted}
                                    onCommentAdded={handleCommentAdded} onCommentEdited={handleCommentEdited} onCommentDeleted={handleCommentDeleted}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Your answer ── */}
            <div className="mt-10">
                <div className="flex items-center gap-3 mb-5">
                    <h3 className="text-base font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>Your Answer</h3>
                    <div className="flex-1 h-px bg-border/40" />
                </div>
                {isAuthenticated ? (
                    <div className="border border-border/60 overflow-hidden bg-card">
                        <div className="p-5">
                            <TiptapEditor placeholder="Write a clear, detailed answer. Code examples and context help a lot." onChange={setNewAnswerBody} minHeight="200px" />
                        </div>
                        <div className="px-5 py-3.5 bg-muted/20 border-t border-border/40 flex justify-end">
                            <Button size="sm" onClick={handleCreateAnswer} disabled={isSubmittingAnswer} className="h-8 px-5 text-xs shadow-none">
                                {isSubmittingAnswer ? 'Posting…' : 'Post Answer'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 border border-dashed border-border/60 bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-3">You must be signed in to answer.</p>
                        <Button asChild size="sm" className="shadow-none h-8 px-5 text-xs"><Link href="/login">Sign In</Link></Button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes fade-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .animate-fade-up { animation: fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both; }
            `}</style>

            <FlagDialog
                open={flagDialogOpen}
                onOpenChange={setFlagDialogOpen}
                contentId={questionId}
                contentType="question"
            />
        </div>
    )
}