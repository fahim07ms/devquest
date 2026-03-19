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
        // Coming soon – vote API route not built yet
        if (userVote === value) {
            // Cancel vote
            setCurrentScore((s) => s - value)
            setUserVote(0)
        } else {
            const delta = value - userVote // handles switching vote
            setCurrentScore((s) => s + delta)
            setUserVote(value)
        }
        toast.info('Voting coming soon!')
    }

    return (
        <div
            className={cn(
                'flex items-center gap-1',
                orientation === 'vertical' ? 'flex-col' : 'flex-row',
                className
            )}
        >
            <button
                type="button"
                id={`upvote-${_contentId}`}
                onClick={() => handleVote(1)}
                className={cn(
                    'p-1.5 rounded-lg transition-all',
                    userVote === 1
                        ? 'text-primary bg-primary/15'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                )}
                title="Upvote"
            >
                <ArrowFatUp weight={userVote === 1 ? 'fill' : 'regular'} className="h-5 w-5" />
            </button>

            <span
                className={cn(
                    'font-bold tabular-nums min-w-[2rem] text-center',
                    'text-base',
                    currentScore > 0 && 'text-primary',
                    currentScore < 0 && 'text-destructive',
                    currentScore === 0 && 'text-muted-foreground'
                )}
            >
                {currentScore}
            </span>

            <button
                type="button"
                id={`downvote-${_contentId}`}
                onClick={() => handleVote(-1)}
                className={cn(
                    'p-1.5 rounded-lg transition-all',
                    userVote === -1
                        ? 'text-destructive bg-destructive/15'
                        : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                )}
                title="Downvote"
            >
                <ArrowFatDown weight={userVote === -1 ? 'fill' : 'regular'} className="h-5 w-5" />
            </button>
        </div>
    )
}
