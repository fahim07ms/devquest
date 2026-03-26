'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MagnifyingGlassIcon, MoonIcon, SunIcon, PencilSimpleIcon } from '@phosphor-icons/react'
import { useTheme } from 'next-themes'

export function Navbar() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const { theme, setTheme } = useTheme()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [focused, setFocused] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (search.trim()) params.set('search', search.trim())
        router.push(`/questions?${params.toString()}`)
    }

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-md px-4">
            {/* Sidebar toggle */}
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors -ml-1" />

            {/* Thin divider */}
            <div className="h-5 w-px bg-border/60" />

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                    <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors duration-150 ${
                            focused ? 'text-primary' : 'text-muted-foreground'
                        }`}
                    />
                    <Input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="Search questions…"
                        className={`pl-8 h-8 text-sm bg-muted/40 border transition-all duration-200 ${
                            focused
                                ? 'border-primary/50 bg-background ring-2 ring-primary/10'
                                : 'border-transparent hover:border-border'
                        }`}
                    />
                </div>
            </form>

            <div className="ml-auto flex items-center gap-1.5">
                {/* Ask Question */}
                {isAuthenticated ? (
                    <Button
                        asChild
                        size="sm"
                        className="h-8 gap-1.5 hidden sm:flex text-xs px-3 shadow-none"
                    >
                        <Link href="/questions/ask">
                            <PencilSimpleIcon weight="bold" className="h-3 w-3" />
                            Ask Question
                        </Link>
                    </Button>
                ) : (
                    <Button onClick={() => (router.push('/register'))} className={`h-8 gap-1.5 hidden sm:flex text-xs px-3 shadow-none cursor-pointer`}>
                        Join Now
                    </Button>
                )}

                {/* Theme toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
                    title="Toggle theme"
                >
                    {theme === 'dark' ? (
                        <SunIcon className="h-3.5 w-3.5" />
                    ) : (
                        <MoonIcon className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>
        </header>
    )
}