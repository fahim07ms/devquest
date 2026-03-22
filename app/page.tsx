"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRef } from 'react'
import {Navbar} from "@/components/landing/Navbar";

export default function LandingPage() {
    const heroRef = useRef<HTMLDivElement>(null)

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden" style={{ fontFamily: "'JetBrains Mono', monospace" }}>

            <main className="flex-1 flex flex-col">

                <Navbar />

                {/* ── Hero ── */}
                <section
                    ref={heroRef}
                    className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-16"
                    style={{ '--delay': '0ms' } as React.CSSProperties}
                >
                    {/* Grid texture */}
                    <div
                        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025] dark:opacity-[0.04]"
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
                        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full"
                        style={{
                            width: '720px',
                            height: '480px',
                            background: 'radial-gradient(ellipse, color-mix(in oklch, var(--primary) 18%, transparent) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                        }}
                    />

                    <div className="mx-auto max-w-5xl w-full">

                        {/* Eyebrow */}
                        <p
                            className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-8 opacity-0 animate-fade-up"
                            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
                        >
                            Developer Q&amp;A — Reimagined
                        </p>

                        {/* Headline */}
                        <h1
                            className="font-bold text-foreground opacity-0 animate-fade-up mb-6"
                            style={{
                                fontSize: 'clamp(2.8rem, 8vw, 6.5rem)',
                                lineHeight: '1.03',
                                letterSpacing: '-0.04em',
                                animationDelay: '200ms',
                                animationFillMode: 'forwards',
                            }}
                        >
                            Solve hard<br />
                            problems,{' '}
                            <span
                                style={{
                                    background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 55%, var(--foreground)) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                together.
                            </span>
                        </h1>

                        {/* Subtext */}
                        <p
                            className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10 opacity-0 animate-fade-up"
                            style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
                        >
                            A community platform built by developers, for developers. Find answers, share knowledge, and grow your reputation — without the noise.
                        </p>

                        {/* CTA row */}
                        <div
                            className="flex flex-wrap gap-3 items-center opacity-0 animate-fade-up"
                            style={{ animationDelay: '480ms', animationFillMode: 'forwards' }}
                        >
                            <Button
                                asChild
                                size="lg"
                                className="h-11 px-7 text-sm font-medium shadow-none"
                            >
                                <Link href="/register">Start Exploring</Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="ghost"
                                className="h-11 px-7 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground"
                            >
                                <Link href="/questions">Browse Questions →</Link>
                            </Button>
                        </div>

                        {/*/!* Social proof micro-line *!/*/}
                        {/*<p*/}
                        {/*    className="mt-10 text-xs text-muted-foreground/60 opacity-0 animate-fade-up"*/}
                        {/*    style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}*/}
                        {/*>*/}
                        {/*    Trusted by engineers at early-stage startups to large teams.*/}
                        {/*</p>*/}
                    </div>
                </section>

                {/* ── Divider rule ── */}
                <div className="mx-auto max-w-6xl px-6 w-full">
                    <div className="h-px bg-border/60" />
                </div>

                {/* ── Features ── */}
                <section className="py-24 px-6">
                    <div className="mx-auto max-w-6xl">

                        {/* Section label */}
                        <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-12">
                            What you get
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/50 rounded-2xl overflow-hidden border border-border/50">

                            {[
                                {
                                    number: '01',
                                    title: 'Code-First Discussions',
                                    body: 'Ask questions the way developers actually think — in code. Paste a snippet, describe the problem, get a real answer.',
                                },
                                {
                                    number: '02',
                                    title: 'Instant Answers',
                                    body: 'A clean, focused interface that puts content first. No distractions — just the code and context you need to move forward.',
                                },
                                {
                                    number: '03',
                                    title: 'Community Driven',
                                    body: 'Earn reputation points, unlock badges, and help keep the community clean. Built by people who care about quality.',
                                },
                            ].map((f) => (
                                <div
                                    key={f.number}
                                    className="bg-card p-8 lg:p-10 group hover:bg-accent/30 transition-colors duration-300"
                                >
                                    <span className="text-xs font-medium tracking-widest text-primary/70 mb-6 block">
                                        {f.number}
                                    </span>
                                    <h3
                                        className="text-lg font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300"
                                        style={{ letterSpacing: '-0.02em' }}
                                    >
                                        {f.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {f.body}
                                    </p>
                                </div>
                            ))}

                        </div>
                    </div>
                </section>

                {/* ── CTA Banner ── */}
                <section className="py-24 px-6">
                    <div className="mx-auto max-w-6xl">
                        <div
                            className="rounded-2xl border border-primary/20 px-10 py-16 relative overflow-hidden text-center"
                            style={{
                                background: 'color-mix(in oklch, var(--primary) 6%, var(--card))',
                            }}
                        >
                            {/* Inner glow */}
                            <div
                                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -z-0 rounded-full"
                                style={{
                                    width: '500px',
                                    height: '200px',
                                    background: 'radial-gradient(ellipse, color-mix(in oklch, var(--primary) 22%, transparent) 0%, transparent 70%)',
                                    filter: 'blur(40px)',
                                }}
                            />
                            <div className="relative z-10">
                                <p className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">
                                    Ready to start?
                                </p>
                                <h2
                                    className="font-bold text-foreground mb-4"
                                    style={{
                                        fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                                        letterSpacing: '-0.03em',
                                        lineHeight: '1.1',
                                    }}
                                >
                                    Join the conversation.
                                </h2>
                                <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                                    Create a free account and start asking, answering, and building your reputation in minutes.
                                </p>
                                <Button asChild size="lg" className="h-11 px-8 text-sm font-medium rounded-md shadow-none">
                                    <Link href="/register">Create Free Account</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-border/40 py-8 px-6">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm font-bold tracking-tighter text-muted-foreground" style={{ letterSpacing: '-0.03em' }}>
                        dev<span className="text-primary">quest</span><span className="text-primary">.</span>
                    </span>
                    <p className="text-xs text-muted-foreground/60">
                        © 2026 DevQuest. Built for developers.
                    </p>
                    <div className="flex gap-5">
                        {['About', 'Privacy', 'Terms'].map((item) => (
                            <Link
                                key={item}
                                href={`/${item.toLowerCase()}`}
                                className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>

            {/* ── Animation styles ── */}
            <style jsx global>{`
                @keyframes fade-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-up {
                    animation: fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
            `}</style>
        </div>
    )
}