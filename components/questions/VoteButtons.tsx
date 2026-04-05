'use client'

import { useEffect, useState } from 'react'
import { ArrowFatUpIcon, ArrowFatDownIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface VoteButtonsProps {
    score: number
    contentId: string
    orientation?: 'vertical' | 'horizontal'
    className?: string
}

export function VoteButtons({
                                score,
                                contentId,
                                orientation = 'vertical',
                                className,
                            }: VoteButtonsProps) {
    const { isAuthenticated } = useAuthStore()

    const [currentScore, setCurrentScore] = useState(score)
    const [userVote, setUserVote]         = useState<1 | -1 | 0>(0)
    // The vote table UUID — required for PUT and DELETE routes
    const [voteId, setVoteId]             = useState<string | null>(null)
    const [isLoading, setIsLoading]       = useState(false)

    // Fetch the current user's existing vote on mount
    useEffect(() => {
        if (!isAuthenticated) return
        api.get(`/votes/${contentId}`)
            .then((res) => {
                const v = res.data?.data?.vote
                if (v) {
                    setVoteId(v.id);
                    setUserVote(v.voteType as 1 | -1)
                }
            })
            .catch(() => {
                // 404 = no vote yet, ignore silently
            })
    }, [contentId, isAuthenticated])

    const handleVote = async (value: 1 | -1) => {
        if (!isAuthenticated) {
            toast.error('You must be logged in to vote.')
            return
        }
        if (isLoading) return
        setIsLoading(true)

        try {
            if (userVote === value) {
                // Same direction clicked → remove the vote

                await api.delete(`/votes/${voteId}`)
                setCurrentScore((s) => s - value)
                setUserVote(0)
                setVoteId(null)

            } else if (userVote === 0) {
                // No existing vote → cast a new one
                const res = await api.post('/votes', { contentId, voteType: value })
                const newVote = res.data?.data?.vote

                setVoteId(newVote.id)
                setCurrentScore((s) => s + value)
                setUserVote(value)

            } else {
                // Opposite vote exists → switch direction via PUT
                const delta = value - userVote  // -1→1: +2, 1→-1: -2
                await api.put(`/votes/${voteId}`, { voteType: value })
                setCurrentScore((s) => s + delta)
                setUserVote(value)
                // voteId stays the same row, just updated
            }
        } catch {
            toast.error('Failed to register vote. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const upActive   = userVote === 1
    const downActive = userVote === -1
    const isHorizontal = orientation === 'horizontal'

    return (
        <div
            className={cn(
                'flex items-center gap-0.5',
                isHorizontal ? 'flex-row' : 'flex-col',
                className
            )}
        >
            {/* Upvote */}
            <button
                type="button"
                onClick={() => handleVote(1)}
                disabled={isLoading}
                title="Upvote"
                className={cn(
                    'transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
                    isHorizontal ? 'p-1' : 'p-1.5',
                    upActive
                        ? 'text-primary bg-primary/12'
                        : 'text-muted-foreground/50 hover:text-primary hover:bg-primary/10'
                )}
            >
                <ArrowFatUpIcon
                    weight={upActive ? 'fill' : 'regular'}
                    className={isHorizontal ? 'h-3 w-3' : 'h-4 w-4'}
                />
            </button>

            {/* Score */}
            <span
                className={cn(
                    'font-bold tabular-nums text-center',
                    isHorizontal
                        ? 'text-xs min-w-[1.25rem]'
                        : 'text-sm min-w-[1.75rem] leading-none py-0.5',
                    currentScore > 0 && 'text-primary',
                    currentScore < 0 && 'text-destructive',
                    currentScore === 0 && 'text-muted-foreground/60'
                )}
            >
                {currentScore}
            </span>

            {/* Downvote */}
            <button
                type="button"
                onClick={() => handleVote(-1)}
                disabled={isLoading}
                title="Downvote"
                className={cn(
                    'transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
                    isHorizontal ? 'p-1' : 'p-1.5',
                    downActive
                        ? 'text-destructive bg-destructive/12'
                        : 'text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10'
                )}
            >
                <ArrowFatDownIcon
                    weight={downActive ? 'fill' : 'regular'}
                    className={isHorizontal ? 'h-3 w-3' : 'h-4 w-4'}
                />
            </button>
        </div>
    )
}