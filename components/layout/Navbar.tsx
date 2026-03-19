'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MagnifyingGlass, Moon, Sun, PencilSimple } from '@phosphor-icons/react'
import { useTheme } from 'next-themes'

export function Navbar() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const { theme, setTheme } = useTheme()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('search') || '')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (search.trim()) params.set('search', search.trim())
        router.push(`/questions?${params.toString()}`)
    }

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-sm px-4">
            {/* Sidebar toggle */}
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="navbar-search"
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search questions…"
                        className="pl-9 h-9 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
                    />
                </div>
            </form>

            <div className="ml-auto flex items-center gap-2">
                {/* Ask Question */}
                {isAuthenticated && (
                    <Button
                        asChild
                        size="sm"
                        className="gap-1.5 hidden sm:flex"
                        id="ask-question-btn"
                    >
                        <Link href="/questions/ask">
                            <PencilSimple className="h-3.5 w-3.5" />
                            Ask Question
                        </Link>
                    </Button>
                )}

                {/* Theme toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    title="Toggle theme"
                    id="theme-toggle-btn"
                >
                    {theme === 'dark' ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                </button>
            </div>
        </header>
    )
}
