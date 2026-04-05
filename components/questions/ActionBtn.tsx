import {cn} from "@/lib/utils";

export function ActionBtn({ onClick, icon: Icon, label, variant = 'default', disabled }: {
    onClick: () => void; icon: React.ElementType; label: string
    variant?: 'default' | 'danger'; disabled?: boolean
}) {
    return (
        <button type="button" onClick={onClick} disabled={disabled} className={cn(
            'inline-flex items-center gap-1 text-xs transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
            variant === 'default' && 'text-muted-foreground hover:text-foreground',
            variant === 'danger'  && 'text-muted-foreground hover:text-destructive',
        )}>
            <Icon className="h-3.5 w-3.5" />{label}
        </button>
    )
}