'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Mathematics from '@tiptap/extension-mathematics'
import { common, createLowlight } from 'lowlight'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'

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
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-2 hover:text-primary/80',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            Image.configure({
                HTMLAttributes: { class: 'max-w-full my-3' },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: { class: 'not-prose' },
            }),
            Mathematics,
        ],
        content: content || '',
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm dark:prose-invert max-w-none outline-none',
                    // Code blocks
                    '[&_pre]:bg-muted/60 [&_pre]:border [&_pre]:border-border/50',
                    '[&_pre]:px-4 [&_pre]:py-3 [&_pre]:text-xs [&_pre]:overflow-x-auto',
                    '[&_code:not(pre_code)]:bg-muted/60 [&_code:not(pre_code)]:px-1 [&_code:not(pre_code)]:py-0.5',
                    '[&_code:not(pre_code)]:text-xs [&_code:not(pre_code)]:text-foreground',
                    // Blockquote
                    '[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground',
                    // Links
                    '[&_a]:text-primary [&_a]:no-underline [&_a]:underline-offset-2 [&_a:hover]:underline',
                    // Images
                    '[&_img]:max-w-full [&_img]:my-3',
                    // Headings
                    '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-tight',
                    '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:tracking-tight',
                ),
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