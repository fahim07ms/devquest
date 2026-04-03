import {cn} from "@/lib/utils";

export function ProfileAvatar({ src, initials, size = 'lg' }: { src?: string; initials: string; size?: 'lg' | 'sm' }) {
    const dim  = size === 'lg' ? 'h-20 w-20' : 'h-12 w-12'
    const text = size === 'lg' ? 'text-2xl' : 'text-base'
    return (
        <div className={cn(dim, 'flex-shrink-0 bg-primary/10 border-2 border-primary/20 overflow-hidden', text, 'flex items-center justify-center font-bold text-primary')}>
            {src ? <img src={src} alt="avatar" className="h-full w-full object-cover" /> : <span>{initials}</span>}
        </div>
    )
}