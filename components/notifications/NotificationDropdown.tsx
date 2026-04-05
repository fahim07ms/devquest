'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Notification, NotificationType } from '@/types'
import {
    BellIcon,
    BellRingingIcon,
    CheckIcon,
    ChatDotsIcon,
    TrophyIcon,
    CheckCircleIcon,
    PencilSimpleIcon,
    AtIcon,
    ArrowBendDownRightIcon,
    CurrencyDollarIcon,
} from '@phosphor-icons/react'

// ── Icon per notification type ────────────────────────────────────────────────

function NotifIcon({ type }: { type: NotificationType }) {
    const base = 'h-3.5 w-3.5 flex-shrink-0'
    switch (type) {
        case 'NEW_ANSWER':      return <ArrowBendDownRightIcon className={cn(base, 'text-primary')}           weight="bold" />
        case 'NEW_COMMENT':     return <ChatDotsIcon           className={cn(base, 'text-blue-500')}          weight="bold" />
        case 'BADGE_EARNED':    return <TrophyIcon             className={cn(base, 'text-amber-500')}         weight="fill" />
        case 'ANSWER_ACCEPTED': return <CheckCircleIcon        className={cn(base, 'text-emerald-500')}       weight="fill" />
        case 'BOUNTY_AWARDED':
        case 'BOUNTY_EXPIRING': return <CurrencyDollarIcon     className={cn(base, 'text-blue-400')}          weight="bold" />
        case 'QUESTION_EDITED': return <PencilSimpleIcon       className={cn(base, 'text-muted-foreground')}  weight="bold" />
        case 'MENTIONED':       return <AtIcon                 className={cn(base, 'text-violet-500')}        weight="bold" />
        default:                return <BellIcon               className={cn(base, 'text-muted-foreground')}  weight="bold" />
    }
}

// ── Human-readable label ──────────────────────────────────────────────────────

function notifLabel(type: NotificationType, actorUsername?: string): string {
    const who = actorUsername ? `@${actorUsername}` : 'Someone'
    switch (type) {
        case 'NEW_ANSWER':      return `${who} answered your question`
        case 'NEW_COMMENT':     return `${who} commented on your post`
        case 'BADGE_EARNED':    return 'You earned a new badge'
        case 'ANSWER_ACCEPTED': return 'Your answer was accepted'
        case 'BOUNTY_AWARDED':  return `${who} awarded you a bounty`
        case 'BOUNTY_EXPIRING': return 'A bounty on your question is expiring soon'
        case 'QUESTION_EDITED': return `${who} edited your question`
        case 'MENTIONED':       return `${who} mentioned you in a comment`
        default:                return 'New notification'
    }
}

// ── Single row ────────────────────────────────────────────────────────────────

function NotifRow({
                      notif,
                      onRead,
                      onClose,
                  }: {
    notif: Notification
    onRead: (id: string) => void
    onClose: () => void
}) {
    const handleClick = () => {
        if (!notif.isRead) onRead(notif.id)
        onClose()
    }

    const inner = (
        <div
            onClick={handleClick}
            className={cn(
                'flex items-start gap-3 px-4 py-3 transition-colors duration-150 cursor-pointer',
                notif.isRead
                    ? 'hover:bg-muted/40'
                    : 'bg-primary/[0.04] hover:bg-primary/[0.08] border-l-2 border-primary/50'
            )}
        >
            <div className="flex-shrink-0 mt-0.5 h-6 w-6 flex items-center justify-center bg-muted/60 border border-border/40">
                <NotifIcon type={notif.type} />
            </div>

            <div className="flex-1 min-w-0">
                <p className={cn('text-xs leading-snug', notif.isRead ? 'text-foreground/70' : 'text-foreground font-medium')}>
                    {notifLabel(notif.type, notif.actor?.username)}
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </p>
            </div>

            {!notif.isRead && <div className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 bg-primary" />}
        </div>
    )

    if (notif.actionUrl) {
        return <Link href={notif.actionUrl} className="block">{inner}</Link>
    }
    return inner
}

// ── Main dropdown ─────────────────────────────────────────────────────────────

export function NotificationDropdown() {
    const { isAuthenticated } = useAuthStore()

    const [open, setOpen]                   = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount]     = useState(0)
    const [isLoading, setIsLoading]         = useState(false)
    const [hasLoaded, setHasLoaded]         = useState(false)
    const dropdownRef                        = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return
        setIsLoading(true)
        try {
            const res  = await api.get('/notifications', { params: { limit: 20, page: 1 } })
            const data = res.data?.data
            setNotifications(data?.notifications ?? [])
            setUnreadCount(data?.unreadCount    ?? 0)
            setHasLoaded(true)
        } catch {
            // fail silently — don't break the navbar
        } finally {
            setIsLoading(false)
        }
    }, [isAuthenticated])

    // Populate badge count on mount (once auth is hydrated from persist)
    useEffect(() => {
        if (isAuthenticated) fetchNotifications()
    }, [isAuthenticated, fetchNotifications])

    const handleOpen = () => {
        const next = !open
        setOpen(next)
        // Always refresh the list when opening
        if (next) fetchNotifications()
    }

    const handleRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`)
            setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
            setUnreadCount((c) => Math.max(0, c - 1))
        } catch {
            // silently ignore
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await api.patch('/notifications/read-all')
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch {
            // silently ignore
        }
    }

    // Don't render if not authenticated (Navbar also guards this, but be safe)
    if (!isAuthenticated) return null

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={handleOpen}
                title="Notifications"
                className={cn(
                    'relative h-8 w-8 flex items-center justify-center transition-all duration-150',
                    open
                        ? 'text-foreground bg-muted/60'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
            >
                {unreadCount > 0
                    ? <BellRingingIcon className="h-3.5 w-3.5" weight="fill" />
                    : <BellIcon       className="h-3.5 w-3.5" />
                }

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-3.5 min-w-[14px] flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold leading-none px-0.5">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Panel */}
            {open && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-80 bg-popover border border-border shadow-lg shadow-black/10 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60">
                                Inbox
                            </p>
                            <h3 className="text-sm font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>
                                Notifications
                            </h3>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors duration-150"
                            >
                                <CheckIcon className="h-3 w-3" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {isLoading && !hasLoaded ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-border/20 last:border-0 animate-pulse">
                                    <div className="h-6 w-6 bg-muted flex-shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 bg-muted w-3/4" />
                                        <div className="h-2.5 bg-muted w-1/3" />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                <BellIcon className="h-8 w-8 text-muted-foreground/20 mb-3" weight="thin" />
                                <p className="text-sm text-muted-foreground/60">All caught up.</p>
                                <p className="text-xs text-muted-foreground/40 mt-0.5">No new notifications.</p>
                            </div>
                        ) : (
                            notifications.map((notif, i) => (
                                <div key={notif.id} className={cn(i < notifications.length - 1 && 'border-b border-border/20')}>
                                    <NotifRow notif={notif} onRead={handleRead} onClose={() => setOpen(false)} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}