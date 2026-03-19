'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { cn } from '@/lib/utils'
import {
    TextB,
    TextItalic,
    Code,
    CodeBlock,
    Link as LinkIcon,
    ListBullets,
    ListNumbers,
    Quotes,
    ArrowCounterClockwise,
    ArrowClockwise,
    Minus,
} from '@phosphor-icons/react'

const lowlight = createLowlight(common)

interface TiptapEditorProps {
    placeholder?: string
    onChange: (json: object) => void
    initialContent?: object
    className?: string
    minHeight?: string
}

interface ToolbarButtonProps {
    onClick: () => void
    isActive?: boolean
    title: string
    children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick() }}
            title={title}
            className={cn(
                'p-1.5 rounded-md transition-all text-sm',
                isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
        >
            {children}
        </button>
    )
}

export function TiptapEditor({ placeholder, onChange, initialContent, className, minHeight = '160px' }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // replaced by CodeBlockLowlight
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write something…',
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-primary underline underline-offset-2 hover:text-primary/80' },
            }),
            CodeBlockLowlight.configure({ lowlight }),
        ],
        content: initialContent || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3',
                style: `min-height: ${minHeight}`,
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON())
        },
    })

    if (!editor) return null

    const addLink = () => {
        const url = window.prompt('Enter URL')
        if (url) {
            editor.chain().focus().extendMarkToLink({ href: url }).setLink({ href: url }).run()
        }
    }

    return (
        <div className={cn(
            'rounded-xl border border-border bg-card overflow-hidden',
            'ring-0 focus-within:ring-2 focus-within:ring-primary/40 transition-all',
            className
        )}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                    <TextB className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                    <TextItalic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline code">
                    <Code className="h-4 w-4" />
                </ToolbarButton>
                <div className="w-px h-4 bg-border mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet list">
                    <ListBullets className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered list">
                    <ListNumbers className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
                    <Quotes className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code block">
                    <CodeBlock className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Add link">
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
                    <Minus className="h-4 w-4" />
                </ToolbarButton>
                <div className="ml-auto flex gap-0.5">
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                        <ArrowCounterClockwise className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                        <ArrowClockwise className="h-4 w-4" />
                    </ToolbarButton>
                </div>
            </div>

            {/* Editor content */}
            <EditorContent editor={editor} />
        </div>
    )
}
