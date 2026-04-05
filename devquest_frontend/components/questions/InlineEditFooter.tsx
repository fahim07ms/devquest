import {Button} from "@/components/ui/button";

export function InlineEditFooter({ onSave, onCancel, isSaving, saveLabel = 'Save' }: {
    onSave: () => void; onCancel: () => void; isSaving: boolean; saveLabel?: string
}) {
    return (
        <div className="flex items-center justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-7 px-4 text-xs">Cancel</Button>
            <Button type="button" size="sm" onClick={onSave} disabled={isSaving} className="h-7 px-4 text-xs shadow-none">
                {isSaving ? 'Saving…' : saveLabel}
            </Button>
        </div>
    )
}
