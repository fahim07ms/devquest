export function UserProfilePageSkeleton() {
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
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-muted mb-3" />)}
        </div>
    )
}