'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { TagBadge } from '@/components/ui/TagBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import {
    PencilSimpleIcon,
    LinkSimpleIcon,
    CalendarBlankIcon,
    TrophyIcon,
    MedalIcon,
    ChatDotsIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    CameraIcon,
    XIcon,
    ArrowLeftIcon,
} from '@phosphor-icons/react'
import {Tag} from "@/types";

interface UserProfile {
    id: string
    username: string
    role: string
    reputationPoints: number
    badgeCount: number
    createdAt: string
    firstName?: string
    lastName?: string
    bio?: string
    website?: string
    profilePicture?: string
}

interface UserQuestion {
    id: string
    title: string
    voteScore: number
    answersCount: number
    viewCount: number
    createdAt: string
    isAnswered: boolean
    tags?: Tag[]
}

interface UserAnswer {
    id: string
    questionId: string
    questionTitle: string
    voteScore: number
    createdAt: string
    isAccepted: boolean
}

type ActiveTab = 'questions' | 'answers'

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatPill({
                      icon: Icon,
                      label,
                      value,
                  }: {
    icon: React.ElementType
    label: string
    value: string | number
}) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
            <span className="text-sm text-foreground font-medium tabular-nums">{value}</span>
            <span className="text-xs text-muted-foreground/60">{label}</span>
        </div>
    )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function ProfileAvatar({
                           src,
                           initials,
                           size = 'lg',
                       }: {
    src?: string
    initials: string
    size?: 'lg' | 'sm'
}) {
    const dim = size === 'lg' ? 'h-20 w-20' : 'h-12 w-12'
    const text = size === 'lg' ? 'text-2xl' : 'text-base'
    return (
        <div
            className={cn(
                dim,
                'flex-shrink-0 bg-primary/10 border-2 border-primary/20 overflow-hidden',
                text,
                'flex items-center justify-center font-bold text-primary'
            )}
        >
            {src ? (
                <img src={src} alt="avatar" className="h-full w-full object-cover" />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    )
}

// ── Edit drawer ───────────────────────────────────────────────────────────────
function EditDrawer({
                        open,
                        profile,
                        onClose,
                        onSaved,
                    }: {
    open: boolean
    profile: UserProfile
    onClose: () => void
    onSaved: (updated: Partial<UserProfile>) => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [firstName, setFirstName] = useState(profile.firstName ?? '')
    const [lastName,  setLastName]  = useState(profile.lastName  ?? '')
    const [bio,       setBio]       = useState(profile.bio       ?? '')
    const [website,   setWebsite]   = useState(profile.website   ?? '')
    const [birthDate, setBirthDate] = useState('')
    const [isSaving, setIsSaving]   = useState(false)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.profilePicture)

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        // Local preview immediately
        const reader = new FileReader()
        reader.onload = () => setAvatarPreview(reader.result as string)
        reader.readAsDataURL(file)

        setIsUploadingAvatar(true)
        try {
            const fd = new FormData()
            fd.append('avatar', file)
            const res = await api.put('/users/me/avatar', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            const newPic = res.data?.data?.user?.profilePicture
            if (newPic) {
                setAvatarPreview(newPic)
                onSaved({ profilePicture: newPic })
                toast.success('Avatar updated.')
            }
        } catch {
            toast.error('Failed to upload avatar.')
        } finally {
            setIsUploadingAvatar(false)
            e.target.value = ''
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await api.put('/users/me', {
                firstName: firstName.trim() || null,
                lastName:  lastName.trim()  || null,
                bio:       bio.trim()       || null,
                website:   website.trim()   || null,
                birthDate: birthDate        || null,
            })
            onSaved({ firstName, lastName, bio, website })
            onClose()
            toast.success('Profile updated.')
        } catch {
            toast.error('Failed to save profile.')
        } finally {
            setIsSaving(false)
        }
    }

    const initials = [profile.firstName, profile.lastName]
        .filter(Boolean)
        .map((n) => n![0].toUpperCase())
        .join('') || profile.username.slice(0, 2).toUpperCase()

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300',
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    'fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border/60',
                    'flex flex-col transition-transform duration-300 ease-out',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-primary/70">
                            Your profile
                        </p>
                        <h2
                            className="text-base font-bold text-foreground"
                            style={{ letterSpacing: '-0.02em' }}
                        >
                            Edit details
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
                    >
                        <XIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                    {/* Avatar */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-3">
                            Profile picture
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                                <ProfileAvatar src={avatarPreview} initials={initials} size="lg" />
                                {isUploadingAvatar && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                                        <div className="h-4 w-4 border-2 border-primary border-t-transparent animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="h-8 text-xs gap-1.5 shadow-none"
                                >
                                    <CameraIcon className="h-3.5 w-3.5" />
                                    Change photo
                                </Button>
                                <p className="text-[11px] text-muted-foreground/50 mt-1.5">
                                    PNG, JPG or WebP · max 5 MB
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/40" />

                    {/* Name */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-3">
                            Name
                        </p>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-muted-foreground mb-1 block">First</label>
                                <Input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="First name"
                                    className="h-8 text-sm rounded-none shadow-none border-border/60"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-muted-foreground mb-1 block">Last</label>
                                <Input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last name"
                                    className="h-8 text-sm rounded-none shadow-none border-border/60"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-3">
                            Bio
                        </p>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="A short description about yourself…"
                            rows={4}
                            maxLength={300}
                            className={cn(
                                'w-full text-sm bg-background border border-border/60 px-3 py-2',
                                'resize-none outline-none transition-colors duration-150',
                                'focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
                                'placeholder:text-muted-foreground/40'
                            )}
                        />
                        <p className="text-[11px] text-muted-foreground/40 text-right mt-1">
                            {bio.length}/300
                        </p>
                    </div>

                    {/* Website */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-3">
                            Website
                        </p>
                        <Input
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://yoursite.com"
                            type="url"
                            className="h-8 text-sm rounded-none shadow-none border-border/60"
                        />
                    </div>

                    {/* Birth date */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-3">
                            Date of birth
                        </p>
                        <Input
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            type="date"
                            className="h-8 text-sm rounded-none shadow-none border-border/60"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-border/50 flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 px-5 text-xs text-muted-foreground"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-8 px-5 text-xs shadow-none"
                    >
                        {isSaving ? 'Saving…' : 'Save changes'}
                    </Button>
                </div>
            </div>
        </>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UserProfilePage() {
    const params  = useParams()
    const username = params.username as string
    const { user: authUser, isAuthenticated } = useAuthStore()

    const [profile,   setProfile]   = useState<UserProfile | null>(null)
    const [questions, setQuestions] = useState<UserQuestion[]>([])
    const [answers,   setAnswers]   = useState<UserAnswer[]>([])
    const [activeTab, setActiveTab] = useState<ActiveTab>('questions')
    const [isLoading, setIsLoading] = useState(true)
    const [mounted,   setMounted]   = useState(false)
    const [editOpen,  setEditOpen]  = useState(false)

    const isOwnProfile = isAuthenticated && authUser?.username === username

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        if (!username) return
        const fetchAll = async () => {
            setIsLoading(true)
            try {
                const [profileRes, questionsRes, answersRes] = await Promise.all([
                    api.get(`/users/${username}`),
                    api.get(`/users/${username}/questions`),
                    api.get(`/users/${username}/answers`),
                ])
                setProfile(profileRes.data.data.user)
                setQuestions(questionsRes.data.data.questions ?? [])
                setAnswers(answersRes.data.data.answers ?? [])
            } catch {
                toast.error('Failed to load profile.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchAll()
    }, [username])

    const handleProfileSaved = (updated: Partial<UserProfile>) => {
        setProfile((prev) => prev ? { ...prev, ...updated } : prev)
    }

    const displayName = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username
        : username

    const initials = profile
        ? ([profile.firstName, profile.lastName].filter(Boolean).map((n) => n![0].toUpperCase()).join('') ||
            profile.username.slice(0, 2).toUpperCase())
        : username.slice(0, 2).toUpperCase()

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto w-full px-5 py-8 animate-pulse">
                <div className="flex gap-5 mb-8">
                    <div className="h-20 w-20 bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-2">
                        <div className="h-5 w-40 bg-muted" />
                        <div className="h-3 w-24 bg-muted" />
                        <div className="h-3 w-56 bg-muted" />
                    </div>
                </div>
                <div className="h-px bg-muted mb-6" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted mb-3" />
                ))}
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="max-w-3xl mx-auto w-full px-5 py-20 text-center">
                <p className="text-muted-foreground mb-3">User not found.</p>
                <Link href="/questions" className="text-sm text-primary hover:underline">
                    Back to questions
                </Link>
            </div>
        )
    }

    return (
        <>
            <div
                className={cn(
                    'max-w-3xl mx-auto w-full px-5 py-8 transition-opacity duration-500',
                    mounted ? 'opacity-100' : 'opacity-0'
                )}
            >
                {/* ── Back ── */}
                <Link
                    href="/questions"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 mb-7 group"
                >
                    <ArrowLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
                    All questions
                </Link>

                {/* ── Profile header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-7">
                    <ProfileAvatar src={profile.profilePicture} initials={initials} size="lg" />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                                <h1
                                    className="text-2xl font-bold text-foreground leading-tight"
                                    style={{ letterSpacing: '-0.03em' }}
                                >
                                    {displayName}
                                </h1>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    @{profile.username}
                                    {profile.role !== 'member' && (
                                        <span className="ml-2 text-[10px] font-semibold tracking-wider uppercase text-primary/80 bg-primary/8 px-1.5 py-0.5 border border-primary/15">
                                            {profile.role}
                                        </span>
                                    )}
                                </p>
                            </div>

                            {isOwnProfile && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditOpen(true)}
                                    className="gap-1.5 h-8 text-xs shadow-none"
                                >
                                    <PencilSimpleIcon className="h-3.5 w-3.5" />
                                    Edit profile
                                </Button>
                            )}
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-md">
                                {profile.bio}
                            </p>
                        )}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
                            {profile.website && (
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline underline-offset-2"
                                >
                                    <LinkSimpleIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                    {profile.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
                                <CalendarBlankIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Stats bar ── */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 px-5 bg-muted/20 border border-border/40 mb-7">
                    <StatPill icon={TrophyIcon}    label="reputation" value={profile.reputationPoints.toLocaleString()} />
                    <StatPill icon={MedalIcon}     label="badges"     value={profile.badgeCount} />
                    <StatPill icon={ChatDotsIcon}  label="questions"  value={questions.length} />
                    <StatPill icon={ArrowUpIcon}   label="answers"    value={answers.length} />
                </div>

                {/* ── Tabs ── */}
                <div className="flex items-center gap-0 border-b border-border/40 mb-5">
                    {(['questions', 'answers'] as ActiveTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'px-4 py-2.5 text-xs font-medium capitalize transition-colors duration-150 border-b-2 -mb-px',
                                activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {tab}
                            <span className="ml-1.5 text-[10px] tabular-nums text-muted-foreground/60">
                                ({tab === 'questions' ? questions.length : answers.length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── Questions tab ── */}
                {activeTab === 'questions' && (
                    <div className="flex flex-col">
                        {questions.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-border/50">
                                <p className="text-sm text-muted-foreground">No questions yet.</p>
                            </div>
                        ) : (
                            questions.map((q, i) => (
                                <div
                                    key={q.id}
                                    className="group flex gap-4 py-4 border-b border-border/40 last:border-0 hover:bg-muted/20 -mx-3 px-3 transition-colors duration-150 opacity-0 animate-fade-up"
                                    style={{ animationDelay: `${i * 35}ms`, animationFillMode: 'forwards' }}
                                >
                                    {/* Mini stats */}
                                    <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0 w-14 pt-0.5 text-right">
                                        <span className={cn('text-xs font-bold tabular-nums', q.voteScore > 0 ? 'text-primary' : 'text-muted-foreground/60')}>
                                            {q.voteScore} <span className="font-normal text-muted-foreground/50">votes</span>
                                        </span>
                                        <span className={cn('text-xs font-bold tabular-nums', q.answersCount > 0 ? 'text-emerald-500' : 'text-muted-foreground/60')}>
                                            {q.answersCount} <span className="font-normal text-muted-foreground/50">ans</span>
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/questions/${q.id}`}
                                            className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150 line-clamp-1"
                                            style={{ letterSpacing: '-0.01em' }}
                                        >
                                            {q.title}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {q.tags?.slice(0, 4).map((tag) => (
                                                <TagBadge key={tag["tag_id"]} tag={tag} />
                                            ))}
                                            <span className="text-[11px] text-muted-foreground/50 ml-auto">
                                                {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ── Answers tab ── */}
                {activeTab === 'answers' && (
                    <div className="flex flex-col">
                        {answers.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-border/50">
                                <p className="text-sm text-muted-foreground">No answers yet.</p>
                            </div>
                        ) : (
                            answers.map((a, i) => (
                                <div
                                    key={a.id}
                                    className="group flex gap-4 py-4 border-b border-border/40 last:border-0 hover:bg-muted/20 -mx-3 px-3 transition-colors duration-150 opacity-0 animate-fade-up"
                                    style={{ animationDelay: `${i * 35}ms`, animationFillMode: 'forwards' }}
                                >
                                    {/* Mini stats */}
                                    <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0 w-14 pt-0.5 text-right">
                                        <span className={cn('text-xs font-bold tabular-nums', a.voteScore > 0 ? 'text-primary' : 'text-muted-foreground/60')}>
                                            {a.voteScore} <span className="font-normal text-muted-foreground/50">votes</span>
                                        </span>
                                        {a.isAccepted && (
                                            <CheckCircleIcon weight="fill" className="h-3.5 w-3.5 text-emerald-500 ml-auto" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/questions/${a.questionId}`}
                                            className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150 line-clamp-1"
                                            style={{ letterSpacing: '-0.01em' }}
                                        >
                                            {a.questionTitle}
                                        </Link>
                                        <p className="text-[11px] text-muted-foreground/50 mt-1">
                                            {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                                            {a.isAccepted && (
                                                <span className="ml-2 text-emerald-500 font-medium">· accepted</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* ── Edit drawer ── */}
            {isOwnProfile && (
                <EditDrawer
                    open={editOpen}
                    profile={profile}
                    onClose={() => setEditOpen(false)}
                    onSaved={handleProfileSaved}
                />
            )}

            <style jsx global>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
            `}</style>
        </>
    )
}