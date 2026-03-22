'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { TagInput, type Tag } from '@/components/editor/TagInput'
import { useAuthStore } from '@/store/authStore'
import { createQuestion } from '@/lib/services/questionService'
import { toast } from 'sonner'
import api from '@/lib/api'
import { JSONContent } from '@tiptap/core'
import { ArrowLeftIcon, InfoIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Section from '@/components/questions/ask/Section'
import CharCount from '@/components/questions/ask/CharCounter'
import {zodResolver} from "@hookform/resolvers/zod";
import {askFormSchema, AskFormValues} from "@/lib/validation";



export default function AskQuestionPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()

    const [mounted, setMounted] = useState(false)
    const [allTags, setAllTags] = useState<Tag[]>([])
    const [tagsLoading, setTagsLoading] = useState(true)

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<AskFormValues>({
        resolver: zodResolver(askFormSchema),
        defaultValues: {
            title: '',
            body: {},
            tags: [],
        },
    })

    // Watch title for the live char counter
    const titleValue = watch('title')
    const titleLength = titleValue?.trim().length ?? 0

    useEffect(() => {
        setMounted(true)
    }, [])

    // Redirect if not authenticated
    useEffect(() => {
        if (mounted && !isAuthenticated) {
            toast.error('You must be signed in to ask a question.')
            router.push('/login')
        }
    }, [mounted, isAuthenticated, router])

    // Fetch all available tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await api.get('/tags')
                setAllTags(res.data?.data?.tags ?? res.data ?? [])
            } catch {
                toast.error('Could not load tags.')
            } finally {
                setTagsLoading(false)
            }
        }
        fetchTags()
    }, [])

    const onSubmit = async (values: AskFormValues) => {
        try {
            const question = await createQuestion({
                title: values.title.trim(),
                body: values.body,
                tags: values.tags,
            })
            toast.success('Question posted.')
            router.push(`/questions/${question.id}`)
        } catch {
            toast.error('Failed to post question. Please try again.')
        }
    }

    return (
        <div
            className={cn(
                'max-w-3xl mx-auto w-full px-5 py-8 pb-24 transition-opacity duration-500',
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

            {/* ── Page header ── */}
            <div className="mb-8">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-primary/70 mb-1">
                    Ask the community
                </p>
                <h1
                    className="text-2xl font-bold text-foreground"
                    style={{ letterSpacing: '-0.03em' }}
                >
                    Ask a question
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-lg">
                    Be specific. The more context you provide, the better and faster your answers will be.
                </p>
            </div>

            <div className="h-px bg-border/40 mb-8" />

            {/* ── Tip banner ── */}
            <div className="flex gap-3 px-4 py-3 bg-primary/5 border border-primary/15 mb-8">
                <InfoIcon className="h-4 w-4 text-primary/70 flex-shrink-0 mt-0.5" weight="duotone" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Before posting, search to see if your question has already been answered. Include any error messages, relevant code, and what you have already tried.
                </p>
            </div>

            {/* ── Form ── */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-8"
            >
                {/* Title */}
                <Section
                    step="01 — Title"
                    hint="Write as if you are asking a colleague. Be precise and avoid vague openers like 'How do I...' — just state the problem directly."
                >
                    <div className="flex flex-col gap-1.5">
                        <div className="relative">
                            <Input
                                {...register('title', {
                                    required: 'Title is required.',
                                    minLength: {
                                        value: 5,
                                        message: 'Title must be at least 5 characters.',
                                    },
                                    maxLength: {
                                        value: 300,
                                        message: 'Title must be 300 characters or fewer.',
                                    },
                                })}
                                placeholder="e.g. Postgres query returns duplicate rows when joining question_tag"
                                className={cn(
                                    'h-10 text-sm pr-16 border-border/60 rounded-none',
                                    'focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
                                    'transition-all duration-150',
                                    errors.title && 'border-destructive/50'
                                )}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <CharCount value={titleLength} max={300} />
                            </div>
                        </div>

                        {errors.title && (
                            <p className="text-xs text-destructive/80">
                                {errors.title.message}
                            </p>
                        )}
                    </div>
                </Section>

                {/* Body */}
                <Section
                    step="02 — Description"
                    hint="Include what you expected to happen, what actually happened, and the smallest reproducible example you can make."
                >
                    <Controller
                        name="body"
                        control={control}
                        rules={{
                            validate: (value) => {
                                const empty =
                                    !value ||
                                    JSON.stringify(value) === '{}' ||
                                    (value as any)?.content?.length === 0
                                return !empty || 'Description is required.'
                            },
                        }}
                        render={({ field }) => (
                            <div className="flex flex-col gap-1.5">
                                <TiptapEditor
                                    onChange={field.onChange}
                                    placeholder="Describe your problem clearly. You can paste code, add images, and use math if needed."
                                    minHeight="280px"
                                    className={cn(
                                        'rounded-none',
                                        errors.body && 'border-destructive/50'
                                    )}
                                />
                                {errors.body && (
                                    <p className="text-xs text-destructive/80">
                                        {errors.body.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />
                </Section>

                {/* Tags */}
                <Section
                    step="03 — Tags"
                    hint="Add up to 5 tags that describe the topic — language, framework, or concept. Tags help others find your question."
                >
                    <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                            tagsLoading ? (
                                <div className="h-10 bg-muted/30 border border-border/40 animate-pulse" />
                            ) : (
                                <TagInput
                                    tags={field.value}
                                    setTags={field.onChange}
                                    allTags={allTags}
                                    placeholder="Search tags…"
                                    maxTags={5}
                                />
                            )
                        )}
                    />
                </Section>

                {/* Bounty placeholder */}
                <Section
                    step="04 — Bounty"
                    hint="Bounties attract more attention and reward great answers. You can add one after posting."
                >
                    <div className="flex items-center gap-3 px-4 py-3 border border-dashed border-border/50 bg-muted/10">
                        <p className="text-xs text-muted-foreground">
                            Bounty offering will be available once the question is posted.
                        </p>
                    </div>
                </Section>

                <div className="h-px bg-border/40" />

                {/* Submit row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-xs">
                        By posting, you agree that your question will be publicly visible and moderated by the community.
                    </p>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                            asChild
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 px-5 text-xs text-muted-foreground"
                        >
                            <Link href="/questions">Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting}
                            className="h-9 px-6 text-xs shadow-none"
                        >
                            {isSubmitting ? 'Posting…' : 'Post Question'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

