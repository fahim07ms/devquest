import {useEffect, useState} from "react";
import api from "@/lib/api";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

export function AddBountyDialog({
                             open,
                             onClose,
                             onSuccess,
                             questionId,
                         }: {
    open: boolean
    onClose: () => void
    onSuccess: (bounty: { id: string; amount: number; expiresAt: string }) => void
    questionId: string
}) {
    const [amount,    setAmount]    = useState('')
    const [reason,    setReason]    = useState('')
    const [isPosting, setIsPosting] = useState(false)
    const [error,     setError]     = useState<string | null>(null)

    useEffect(() => {
        if (open) { setAmount(''); setReason(''); setError(null) }
    }, [open])

    const handleSubmit = async () => {
        const parsed = parseInt(amount, 10)
        if (!parsed || parsed < 50) { setError('Minimum bounty amount is 50 reputation.'); return }
        if (!reason.trim())         { setError('A reason is required.'); return }

        setIsPosting(true)
        setError(null)
        try {
            const res = await api.post(`/questions/${questionId}/bounties`, {
                amount: parsed,
                reason: reason.trim(),
            })
            const bounty = res.data.data.bounty
            onSuccess({ id: bounty.bounty_id, amount: bounty.amount, expiresAt: bounty.expires_at })
            toast.success('Bounty posted successfully.')
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to post bounty.')
        } finally {
            setIsPosting(false)
        }
    }

    if (!open) return null

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-background border border-border shadow-xl">
                <div className="px-5 py-4 border-b border-border/50">
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-primary/70">
                        Incentivise answers
                    </p>
                    <h2 className="text-base font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>
                        Add a bounty
                    </h2>
                </div>

                <div className="px-5 py-5 space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Bounties are deducted from your reputation immediately and cannot be refunded. The amount will be awarded to the best answer you choose.
                    </p>

                    <div>
                        <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-1.5 block">
                            Amount (rep points)
                        </label>
                        <Input
                            type="number" min={50} value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="e.g. 50"
                            className="h-9 text-sm rounded-none shadow-none border-border/60 focus:border-primary/50"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/60 mb-1.5 block">
                            Reason
                        </label>
                        <Input
                            type="text" value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g. Needs a detailed canonical answer"
                            className="h-9 text-sm rounded-none shadow-none border-border/60 focus:border-primary/50"
                        />
                    </div>

                    {error && <p className="text-xs text-destructive/80">{error}</p>}
                </div>

                <div className="px-5 py-4 border-t border-border/50 flex items-center justify-end gap-3">
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 px-4 text-xs text-muted-foreground">
                        Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={handleSubmit} disabled={isPosting} className="h-8 px-5 text-xs shadow-none">
                        {isPosting ? 'Posting…' : 'Post bounty'}
                    </Button>
                </div>
            </div>
        </>
    )
}