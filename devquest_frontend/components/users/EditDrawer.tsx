import { Input } from '@/components/ui/input'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import api from "@/lib/api"
import {cn} from "@/lib/utils";
import {XIcon, CameraIcon} from "@phosphor-icons/react";
import {ProfileAvatar} from "@/components/users/ProfileAvatar";
import {UserProfile} from "@/app/(root)/users/[username]/page";


export function EditDrawer({
                               open, profile, onClose, onSaved,
                           }: {
    open: boolean
    profile: UserProfile
    onClose: () => void
    onSaved: (updated: Partial<UserProfile>) => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [firstName, setFirstName]           = useState(profile.firstName ?? '')
    const [lastName, setLastName]             = useState(profile.lastName  ?? '')
    const [bio, setBio]                       = useState(profile.bio       ?? '')
    const [website, setWebsite]               = useState(profile.website   ?? '')
    const [birthDate, setBirthDate]           = useState('')
    const [isSaving, setIsSaving]             = useState(false)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [avatarPreview, setAvatarPreview]   = useState<string | undefined>(profile.profilePicture)

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return }
        if (file.size > 5 * 1024 * 1024)     { toast.error('Image size should be less than 5MB.'); return }

        const reader = new FileReader()
        reader.onload = () => setAvatarPreview(reader.result as string)
        reader.readAsDataURL(file)

        setIsUploadingAvatar(true)
        try {
            const fd = new FormData()
            fd.append('avatar', file)
            const res = await api.put('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
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
            .filter(Boolean).map((n) => n![0].toUpperCase()).join('') ||
        profile.username.slice(0, 2).toUpperCase()

    return (
        <>
            <div
                className={cn('fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300', open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
                onClick={onClose}
            />
            <div className={cn('fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border/60', 'flex flex-col transition-transform duration-300 ease-out', open ? 'translate-x-0' : 'translate-x-full')}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-primary/70">Your profile</p>
                        <h2 className="text-base font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>Edit details</h2>
                    </div>
                    <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
                        <XIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                    {/* Avatar */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-3">Profile picture</p>
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
                                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar} className="h-8 text-xs gap-1.5 shadow-none">
                                    <CameraIcon className="h-3.5 w-3.5" />
                                    Change photo
                                </Button>
                                <p className="text-[11px] text-muted-foreground/50 mt-1.5">PNG, JPG or WebP · max 5 MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/40" />

                    {/* Name */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-3">Name</p>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-muted-foreground mb-1 block">First</label>
                                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="h-8 text-sm rounded-none shadow-none border-border/60" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-muted-foreground mb-1 block">Last</label>
                                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="h-8 text-sm rounded-none shadow-none border-border/60" />
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-3">Bio</p>
                        <textarea
                            value={bio} onChange={(e) => setBio(e.target.value)}
                            placeholder="A short description about yourself…"
                            rows={4} maxLength={300}
                            className={cn('w-full text-sm bg-background border border-border/60 px-3 py-2', 'resize-none outline-none transition-colors duration-150', 'focus:border-primary/50 focus:ring-2 focus:ring-primary/10', 'placeholder:text-muted-foreground/40')}
                        />
                        <p className="text-[11px] text-muted-foreground/40 text-right mt-1">{bio.length}/300</p>
                    </div>

                    {/* Website */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-3">Website</p>
                        <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" type="url" className="h-8 text-sm rounded-none shadow-none border-border/60" />
                    </div>

                    {/* Birth date */}
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-3">Date of birth</p>
                        <Input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" className="h-8 text-sm rounded-none shadow-none border-border/60" />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-border/50 flex items-center justify-end gap-3">
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 px-5 text-xs text-muted-foreground">
                        Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={handleSave} disabled={isSaving} className="h-8 px-5 text-xs shadow-none">
                        {isSaving ? 'Saving…' : 'Save changes'}
                    </Button>
                </div>
            </div>
        </>
    )
}