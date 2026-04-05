import type {Badge, BadgeTier} from "@/types";
import {cn} from "@/lib/utils";
import {ClockIcon} from "@phosphor-icons/react";
import {formatDistanceToNow} from "date-fns";
import {TIER_STYLES} from "@/app/(root)/users/[username]/page";

export function BadgeCard({ badge }: { badge: Badge }) {
    const s = TIER_STYLES[badge.tier]
    return (
        <div className={cn('flex items-start gap-3 p-4 border', s.ring, s.bg)}>
            <div className={cn('flex-shrink-0 mt-0.5 h-2 w-2', s.dot)} />
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground" style={{ letterSpacing: '-0.01em' }}>
                        {badge.name}
                    </span>
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', s.label)}>
                        {badge.tier}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug">
                    {badge.description}
                </p>
                <p className="text-[10px] text-muted-foreground/40 mt-1.5 flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    Earned {formatDistanceToNow(new Date(badge.awardedAt), { addSuffix: true })}
                </p>
            </div>
        </div>
    )
}