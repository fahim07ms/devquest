import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star, Code, Users, Lightning, CaretRight } from '@phosphor-icons/react/dist/ssr'

const inter = Inter({ subsets: ['latin'] })

export default function LandingPage() {
    return (
        <div className={`min-h-screen bg-background flex flex-col ${inter.className}`}>
            {/* Minimal Public Navbar */}
            <header className="flex h-16 items-center justify-between px-6 border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2 group">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Star weight="fill" className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        DevQuest
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Sign In
                    </Link>
                    <Button asChild>
                        <Link href="/register">Join Now</Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center">
                {/* Hero Section */}
                <section className="w-full relative overflow-hidden py-24 sm:py-32 px-6 lg:px-8 mt-12 bg-card/10">
                    {/* Background glow effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
                    
                    <div className="mx-auto max-w-4xl text-center items-center flex flex-col relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
                            <Star weight="fill" className="h-3.5 w-3.5" />
                            <span>The New Standard for Developer Q&A</span>
                        </div>
                        
                        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
                            Solve hard problems, <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                                together.
                            </span>
                        </h1>
                        
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-mono">
                            DevQuest is a modern community platform built by developers, for developers. Find answers, share knowledge, and build your reputation.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 group w-full sm:w-auto" asChild>
                                <Link href="/register">
                                    Start Exploring
                                    <CaretRight weight="bold" className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base w-full sm:w-auto" asChild>
                                <Link href="/questions">Current Questions</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="w-full py-24 bg-muted/20 border-y border-border/40">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                    <Code weight="duotone" className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Modern Editor</h3>
                                <p className="text-muted-foreground">Rich-text markdown editor powered by TipTap with syntax highlighting for maximum clarity.</p>
                            </div>
                            
                            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                    <Lightning weight="duotone" className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Instant Answers</h3>
                                <p className="text-muted-foreground">Find the exact code you need instantly. A streamlined interface that puts content first, not clutter.</p>
                            </div>
                            
                            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                    <Users weight="duotone" className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Community Driven</h3>
                                <p className="text-muted-foreground">Earn reputation points, unlock badges, and help moderate the community. Built collectively.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
            {/* Footer */}
            <footer className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
               <Star weight="fill" className="h-3 w-3" /> DevQuest 2026. Built for developers.
            </footer>
        </div>
    )
}
