import type {ReputationHistory, ReputationReason} from "@/types";
import {cn} from "@/lib/utils";
import {ArrowDownRightIcon, ArrowUpRightIcon} from "@phosphor-icons/react";
import {formatDistanceToNow} from "date-fns";

const REPUTATION_LABELS: Record<ReputationReason, string> = {
    QUESTION_UPVOTED:     'Question upvoted',
    QUESTION_DOWNVOTED:   'Question downvoted',
    ANSWER_UPVOTED:       'Answer upvoted',
    ANSWER_DOWNVOTED:     'Answer downvoted',
    ANSWER_ACCEPTED:      'Answer accepted',
    ANSWER_UNACCEPTED:    'Answer acceptance removed',
    BOUNTY_OFFERED:       'Bounty offered',
    BOUNTY_AWARDED:       'Bounty awarded to you',
    DOWNVOTE_GIVEN:       'Downvote cast',
    SPAM_PENALTY:         'Spam penalty',
    MODERATOR_ADJUSTMENT: 'Moderator adjustment',
}

export function ReputationRow({ entry }: { entry: ReputationHistory }) {
    const positive = entry.changeAmount > 0
    console.log(entry)
    return (
        <div className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
            {/* Change amount */}
            <div className={cn(
                'flex-shrink-0 flex items-center gap-0.5 w-14 justify-end font-bold tabular-nums text-sm',
                positive ? 'text-emerald-500' : 'text-destructive'
            )}>
                {positive
                    ? <ArrowUpRightIcon className="h-3.5 w-3.5" weight="bold" />
                    : <ArrowDownRightIcon className="h-3.5 w-3.5" weight="bold" />
                }
                {positive ? '+' : ''}{entry.changeAmount}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/80">
                    {REPUTATION_LABELS[entry.reason] ?? entry.reason}
                </p>
            </div>

            {/* Time */}
            <p className="text-[10px] text-muted-foreground/40 flex-shrink-0">
                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
            </p>
        </div>
    )
}