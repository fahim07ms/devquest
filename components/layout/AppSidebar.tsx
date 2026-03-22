'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    House,
    ListBullets,
    Tag,
    Users,
    BookmarkSimple,
    Trophy,
    SignOut,
} from '@phosphor-icons/react'

const navItems = [
    { label: 'Home', href: '/questions', icon: House },
    { label: 'Questions', href: '/questions', icon: ListBullets },
    { label: 'Tags', href: '/tags', icon: Tag },
    { label: 'Users', href: '/users', icon: Users },
]

const userItems = [
    { label: 'Bookmarks', href: '/bookmarks', icon: BookmarkSimple },
    { label: 'Reputation', href: '/reputation', icon: Trophy },
]

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuthStore()

    const handleLogout = async () => {
        try {
            await api.get('/auth/logout')
        } catch (_) {}
        logout()
        toast.success('Logged out successfully')
        router.push('/login')
    }

    const initials = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .map((n) => n![0].toUpperCase())
        .join('') || user?.username?.slice(0, 2).toUpperCase() || 'DQ'

    return (
        <Sidebar className="border-r border-sidebar-border">
            {/* ── Brand ── */}
            <SidebarHeader className="px-5 py-5">
                <Link href="/questions" className="group flex items-baseline gap-0">
                    <span
                        className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200"
                        style={{ letterSpacing: '-0.04em' }}
                    >
                        dev
                    </span>
                    <span
                        className="text-xl font-bold text-primary"
                        style={{ letterSpacing: '-0.04em' }}
                    >
                        quest
                    </span>
                    <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-primary mb-0.5 self-end" />
                </Link>
            </SidebarHeader>

            <SidebarSeparator className="opacity-50" />

            <SidebarContent className="px-2 py-3">
                {/* ── Main nav ── */}
                <SidebarGroup>
                    <SidebarGroupLabel
                        className="px-3 mb-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/60"
                    >
                        Navigate
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            {navItems.map(({ label, href, icon: Icon }) => {
                                const isActive =
                                    pathname === href ||
                                    (label === 'Questions' && pathname.startsWith('/questions'))
                                return (
                                    <SidebarMenuItem key={label}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link
                                                href={href}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                                                    isActive
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                                )}
                                            >
                                                <Icon
                                                    weight={isActive ? 'duotone' : 'regular'}
                                                    className="h-4 w-4 flex-shrink-0"
                                                />
                                                {label}
                                                {isActive && (
                                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="my-3 mx-3 h-px bg-border/50" />

                {/* ── User activity ── */}
                <SidebarGroup>
                    <SidebarGroupLabel
                        className="px-3 mb-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/60"
                    >
                        My Activity
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            {userItems.map(({ label, href, icon: Icon }) => {
                                const isActive = pathname === href
                                return (
                                    <SidebarMenuItem key={label}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link
                                                href={href}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                                                    isActive
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                                )}
                                            >
                                                <Icon
                                                    weight={isActive ? 'duotone' : 'regular'}
                                                    className="h-4 w-4 flex-shrink-0"
                                                />
                                                {label}
                                                {isActive && (
                                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── User panel ── */}
            <SidebarFooter className="p-3">
                <div className="h-px bg-border/50 mb-3" />
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors duration-150">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/15 flex-shrink-0">
                        <AvatarImage src={user?.profilePicture || ''} alt={user?.username} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight">{user?.username}</p>
                        <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                            {user?.firstName} {user?.lastName}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-muted-foreground/60 hover:text-destructive transition-colors duration-150 rounded-md p-1.5 hover:bg-destructive/10 flex-shrink-0"
                        title="Logout"
                    >
                        <SignOut className="h-4 w-4" />
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}