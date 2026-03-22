'use client'

import { useState } from 'react'
import { ArrowFatUp, ArrowFatDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

interface VoteButtonsProps {
    score: number
    contentId: string
    orientation?: 'vertical' | 'horizontal'
    className?: string
}

export function VoteButtons({ score, contentId: _contentId, orientation = 'vertical', className }: VoteButtonsProps) {
    const { isAuthenticated } = useAuthStore()
    const [currentScore, setCurrentScore] = useState(score)
    const [userVote, setUserVote] = useState<1 | -1 | 0>(0)

    const handleVote = (value: 1 | -1) => {
        if (!isAuthenticated) {
            toast.error('You must be logged in to vote.')
            return
        }
        if (userVote === value) {
            setCurrentScore((s) => s - value)
            setUserVote(0)
        } else {
            const delta = value - userVote
            setCurrentScore((s) => s + delta)
            setUserVote(value)
        }
        toast.info('Voting coming soon!')
    }

    return (
        <div
            className={cn(
                'flex items-center gap-0.5',
                orientation === 'vertical' ? 'flex-col' : 'flex-row',
                className
            )}
        >
            {/* Upvote */}
            <button
                type="button"
                onClick={() => handleVote(1)}
                title="Upvote"
                className={cn(
                    'p-1.5 rounded-lg transition-all duration-150',
                    userVote === 1
                        ? 'text-primary bg-primary/12'
                        : 'text-muted-foreground/50 hover:text-primary hover:bg-primary/10'
                )}
            >
                <ArrowFatUp
                    weight={userVote === 1 ? 'fill' : 'regular'}
                    className="h-4 w-4"
                />
            </button>

            {/* Score */}
            <span
                className={cn(
                    'font-bold tabular-nums text-sm min-w-[1.75rem] text-center leading-none py-0.5',
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
                title="Downvote"
                className={cn(
                    'p-1.5 rounded-lg transition-all duration-150',
                    userVote === -1
                        ? 'text-destructive bg-destructive/12'
                        : 'text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10'
                )}
            >
                <ArrowFatDown
                    weight={userVote === -1 ? 'fill' : 'regular'}
                    className="h-4 w-4"
                />
            </button>
        </div>
    )
}