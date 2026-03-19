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
import { Badge } from '@/components/ui/badge'
import {
    House,
    ListBullets,
    Tag,
    Users,
    BookmarkSimple,
    Trophy,
    SignOut,
    Star,
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
        } catch (_) {
            // ignore server error and still clear local state
        }
        logout()
        toast.success('Logged out successfully')
        router.push('/login')
    }

    const initials = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .map((n) => n![0].toUpperCase())
        .join('') || user?.username?.slice(0, 2).toUpperCase() || 'DQ'

    return (
        <Sidebar className="border-sidebar-border">
            {/* ── Brand ────────────────────────────────────────── */}
            <SidebarHeader className="px-4 py-4">
                <Link href="/questions" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                        <Star weight="fill" className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        DevQuest
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarSeparator />

            {/* ── Main Navigation ───────────────────────────────── */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                        Navigate
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map(({ label, href, icon: Icon }) => (
                                <SidebarMenuItem key={label}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === href || (label === 'Questions' && pathname.startsWith('/questions'))}
                                    >
                                        <Link
                                            href={href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                                                'hover:text-primary'
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* ── User-specific links ───────────────────────── */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                        My Activity
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {userItems.map(({ label, href, icon: Icon }) => (
                                <SidebarMenuItem key={label}>
                                    <SidebarMenuButton asChild isActive={pathname === href}>
                                        <Link
                                            href={href}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary"
                                        >
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── User Panel ────────────────────────────────────── */}
            <SidebarFooter className="p-4">
                <SidebarSeparator className="mb-3" />
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                        <AvatarImage src={user?.profilePicture || ''} alt={user?.username} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.username}</p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.firstName} {user?.lastName}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-muted-foreground hover:text-destructive transition-colors rounded-md p-1.5 hover:bg-destructive/10"
                        title="Logout"
                    >
                        <SignOut className="h-4 w-4" />
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
