import {cn} from "@/lib/utils";

export default function CharCount({ value, max }: { value: number; max: number }) {
    const over = value > max
    return (
        <span
            className={cn(
                'text-xs tabular-nums transition-colors duration-300',
                over ? 'text-destructive' : 'text-muted-foreground/50'
            )}
        >
            {value}/{max}
        </span>
    )
}