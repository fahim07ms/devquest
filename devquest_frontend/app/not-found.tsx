'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const MESSAGES = [
    {
        code: '404',
        headline: 'undefined is not a page.',
        sub: 'You have reached the edge of the known internet. There is nothing here but lint.',
    },
]

export default function NotFound() {
    const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div
            className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
            {/* Subtle grid texture */}
            <div
                className="pointer-events-none fixed inset-0 -z-10 opacity-[0.025] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `
                        linear-gradient(var(--foreground) 1px, transparent 1px),
                        linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
                    `,
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Ambient glow */}
            <div
                className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"
                style={{
                    width: '600px',
                    height: '400px',
                    background: 'radial-gradient(ellipse, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />

            <div
                className="max-w-lg w-full"
                style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)',
                }}
            >
                {/* Error code */}
                <p
                    className="text-[9rem] font-extrabold leading-none text-transparent select-none mb-2"
                    style={{
                        letterSpacing: '-0.06em',
                        WebkitTextStroke: '1px color-mix(in oklch, var(--primary) 35%, var(--border))',
                    }}
                >
                    {msg.code}
                </p>

                {/* Headline */}
                <h1
                    className="text-xl sm:text-2xl font-bold text-foreground mb-3"
                    style={{ letterSpacing: '-0.03em' }}
                >
                    {msg.headline}
                </h1>

                {/* Sub text */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
                    {msg.sub}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        asChild
                        size="sm"
                        className="h-9 px-6 text-sm shadow-none"
                    >
                        <Link href="/questions">Back to Questions</Link>
                    </Button>
                    <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-9 px-6 text-sm shadow-none text-muted-foreground"
                    >
                        <Link href="/">Go Home</Link>
                    </Button>
                </div>

                {/* Footer note */}
                <p className="mt-10 text-xs text-muted-foreground/40">
                    If you think this is a mistake, feel free to{' '}
                    <Link href="/questions/ask" className="text-primary/60 hover:text-primary transition-colors">
                        ask a question
                    </Link>
                    {' '}about it.
                </p>
            </div>
        </div>
    )
}