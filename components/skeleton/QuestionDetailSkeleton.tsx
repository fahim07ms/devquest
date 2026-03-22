export function QuestionDetailSkeleton() {
    return (
        <div className="max-w-3xl mx-auto w-full px-5 py-8 animate-pulse">
            <div className="h-3 w-24 bg-muted rounded mb-8" />
            <div className="h-7 w-3/4 bg-muted rounded mb-3" />
            <div className="h-7 w-1/2 bg-muted rounded mb-6" />
            <div className="h-px bg-muted mb-6" />
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 bg-muted rounded mb-3 last:w-2/3" />
            ))}
        </div>
    )
}
