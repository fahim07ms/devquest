'use client'

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            {/* ── Navbar ── */}
            <header
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
                style={{
                    borderBottom: scrolled ? '1px solid color-mix(in oklch, var(--border) 60%, transparent)' : '1px solid transparent',
                    background: scrolled ? 'color-mix(in oklch, var(--background) 85%, transparent)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(16px)' : 'none',
                }}
            >
                <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
                    {/* Wordmark logo — no icon */}
                    <Link href="/" className="group flex items-baseline gap-0.5">
                        <span
                            className="text-2xl font-bold tracking-tighter text-foreground transition-colors duration-200 group-hover:text-primary"
                            style={{ letterSpacing: '-0.04em' }}
                        >
                            dev
                        </span>
                        <span
                            className="text-2xl font-bold tracking-tighter text-primary"
                            style={{ letterSpacing: '-0.04em' }}
                        >
                            quest
                        </span>
                        <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-primary mb-0.5 self-end" />
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link
                            href="/questions"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hidden sm:block"
                        >
                            Questions
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                            Sign In
                        </Link>
                        <Button asChild size="sm" className="px-5 text-md shadow-none">
                            <Link href="/register">Join Now</Link>
                        </Button>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Navbar