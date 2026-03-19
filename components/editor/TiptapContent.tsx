'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { cn } from '@/lib/utils'

const lowlight = createLowlight(common)

interface TiptapContentProps {
    content: object | string
    className?: string
}

export function TiptapContent({ content, className }: TiptapContentProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Link.configure({
                openOnClick: true,
                HTMLAttributes: { class: 'text-primary underline underline-offset-2 hover:text-primary/80', target: '_blank', rel: 'noopener noreferrer' },
            }),
            CodeBlockLowlight.configure({ lowlight }),
        ],
        content: content || '',
        editable: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none',
            },
        },
    })

    if (!editor) return null

    return (
        <div className={cn('tiptap-content', className)}>
            <EditorContent editor={editor} />
        </div>
    )
}
