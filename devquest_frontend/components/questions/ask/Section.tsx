import {cn} from "@/lib/utils";

export default function Section({
                     step,
                     hint,
                     children,
                     className,
                 }: {
    step: string
    hint: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('flex flex-col gap-3', className)}>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-primary/70">
                        {step}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>
            </div>
            {children}
        </div>
    )
}