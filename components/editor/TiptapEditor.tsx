'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Mathematics from '@tiptap/extension-mathematics'
import FileHandler from '@tiptap/extension-file-handler'
import { common, createLowlight } from "lowlight";
import { JSONContent } from '@tiptap/core'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { useImageUploader } from '@/lib/useImageUploader'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'

// ── Lowlight setup ──────────────────────────────────────────────────────────
const lowlight = createLowlight(common)

// ── Icon helpers (inline SVGs — no extra dependency) ────────────────────────
function Icon({ d, className }: { d: string; className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('h-3.5 w-3.5', className)}
        >
            <path d={d} />
        </svg>
    )
}

// ── Toolbar button ───────────────────────────────────────────────────────────
function ToolbarButton({
                           onClick,
                           active,
                           disabled,
                           title,
                           children,
                       }: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault() // don't blur editor
                onClick()
            }}
            disabled={disabled}
            title={title}
            className={cn(
                'h-7 w-7 flex items-center justify-center rounded-md text-sm transition-all duration-100',
                active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                disabled && 'opacity-30 cursor-not-allowed pointer-events-none'
            )}
        >
            {children}
        </button>
    )
}

// ── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
    return <div className="h-4 w-px bg-border/60 mx-0.5" />
}

// ── Toolbar ──────────────────────────────────────────────────────────────────
function EditorToolbar({
                           editor,
                           onImageUpload,
                       }: {
    editor: Editor
    onImageUpload: () => void
}) {
    const canUndo = editor.can().undo()
    const canRedo = editor.can().redo()

    return (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border/50 bg-muted/20">
            {/* Undo / Redo */}
            <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!canUndo}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7v6h6" /><path d="M3 13a9 9 0 1 0 2.63-6.36L3 9" />
                </svg>
            </ToolbarButton>
            <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!canRedo}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 7v6h-6" /><path d="M21 13a9 9 0 1 1-2.63-6.36L21 9" />
                </svg>
            </ToolbarButton>

            <Divider />

            {/* Headings */}
            <ToolbarButton
                title="Heading 2"
                active={editor.isActive('heading', { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <span className="text-xs font-bold leading-none">H2</span>
            </ToolbarButton>
            <ToolbarButton
                title="Heading 3"
                active={editor.isActive('heading', { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
                <span className="text-xs font-bold leading-none">H3</span>
            </ToolbarButton>

            <Divider />

            {/* Inline marks */}
            <ToolbarButton
                title="Bold"
                active={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <span className="font-extrabold text-sm leading-none">B</span>
            </ToolbarButton>
            <ToolbarButton
                title="Italic"
                active={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <span className="italic font-semibold text-sm leading-none">I</span>
            </ToolbarButton>
            <ToolbarButton
                title="Strikethrough"
                active={editor.isActive('strike')}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <span className="line-through text-sm leading-none">S</span>
            </ToolbarButton>
            <ToolbarButton
                title="Inline code"
                active={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <Icon d="M16 18l6-6-6-6M8 6L2 12l6 6" />
            </ToolbarButton>

            <Divider />

            {/* Lists */}
            <ToolbarButton
                title="Bullet list"
                active={editor.isActive('bulletList')}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
                    <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                title="Ordered list"
                active={editor.isActive('orderedList')}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
                    <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                title="Blockquote"
                active={editor.isActive('blockquote')}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                </svg>
            </ToolbarButton>

            <Divider />

            {/* Code block */}
            <ToolbarButton
                title="Code block"
                active={editor.isActive('codeBlock')}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                </svg>
            </ToolbarButton>

            {/* Math */}
            <ToolbarButton
                title="Insert math (KaTeX)"
                active={editor.isActive('inlineMath') || editor.isActive('blockMath')}
                onClick={() => {
                    const latex = prompt('Enter LaTeX expression:')
                    if (latex) {
                        editor.chain().focus().insertContent(`$${latex}$`).run()
                    }
                }}
            >
                <span className="text-xs font-bold leading-none italic">∑</span>
            </ToolbarButton>

            {/* Horizontal rule */}
            <ToolbarButton
                title="Horizontal rule"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </ToolbarButton>

            <Divider />

            {/* Image upload */}
            <ToolbarButton title="Insert image" onClick={onImageUpload}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            </ToolbarButton>

            {/* Link */}
            <ToolbarButton
                title="Insert link"
                active={editor.isActive('link')}
                onClick={() => {
                    const url = prompt('Enter URL:')
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run()
                    } else if (url === '') {
                        editor.chain().focus().unsetLink().run()
                    }
                }}
            >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
            </ToolbarButton>
        </div>
    )
}

// ── Main editor component ───────────────────────────────────────────────────
interface TiptapEditorProps {
    onChange: (content: JSONContent) => void
    initialContent?: JSONContent | null
    placeholder?: string
    minHeight?: string
    className?: string
}

export function TiptapEditor({
                                 onChange,
                                 initialContent,
                                 placeholder = 'Write your content here…',
                                 minHeight = '200px',
                                 className,
                             }: TiptapEditorProps) {
    const uploadImage = useImageUploader()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                codeBlock: false, // replaced by CodeBlockLowlight
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            Image.configure({
                allowBase64: false,
                HTMLAttributes: { class: 'rounded-lg max-w-full' },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-2 hover:text-primary/80',
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: { class: 'not-prose' },
            }),
            Mathematics,
            FileHandler.configure({
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
                onDrop: (currentEditor, files, pos) => {
                    files.forEach(async (file) => {
                        const url = await uploadImage(file)
                        if (url) {
                            currentEditor
                                .chain()
                                .insertContentAt(pos, { type: 'image', attrs: { src: url } })
                                .focus()
                                .run()
                        }
                    })
                },
                onPaste: (currentEditor, files, htmlContent) => {
                    if (htmlContent) return
                    files.forEach(async (file) => {
                        const url = await uploadImage(file)
                        if (url) {
                            currentEditor
                                .chain()
                                .insertContentAt(currentEditor.state.selection.anchor, {
                                    type: 'image',
                                    attrs: { src: url },
                                })
                                .focus()
                                .run()
                        }
                    })
                },
            }),
        ],
        content: initialContent || '',
        onUpdate({ editor }) {
            onChange(editor.getJSON())
        },
        editorProps: {
            attributes: {
                class: 'outline-none',
            },
        },
    })

    const handleImageButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !editor) return
        const url = await uploadImage(file)
        if (url) {
            editor
                .chain()
                .focus()
                .insertContent({ type: 'image', attrs: { src: url } })
                .run()
        }
        // Reset input so same file can be re-selected
        e.target.value = ''
    }

    if (!editor) return null

    return (
        <div
            className={cn(
                'rounded-lg border border-border/60 bg-background overflow-hidden',
                'focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10',
                'transition-all duration-150',
                className
            )}
        >
            {/* Toolbar */}
            <EditorToolbar editor={editor} onImageUpload={handleImageButtonClick} />

            {/* Hidden file input for image uploads */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Editor area */}
            <EditorContent
                editor={editor}
                className={cn(
                    'px-4 py-3 prose prose-sm dark:prose-invert max-w-none',
                    // Placeholder styling
                    '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
                    '[&_.is-editor-empty:first-child::before]:text-muted-foreground/50',
                    '[&_.is-editor-empty:first-child::before]:float-left',
                    '[&_.is-editor-empty:first-child::before]:pointer-events-none',
                    '[&_.is-editor-empty:first-child::before]:h-0',
                    // Code block styling
                    '[&_pre]:bg-muted/60 [&_pre]:border [&_pre]:border-border/50 [&_pre]:rounded-lg',
                    '[&_pre]:px-4 [&_pre]:py-3 [&_pre]:text-xs [&_pre]:overflow-x-auto',
                    '[&_code:not(pre_code)]:bg-muted/60 [&_code:not(pre_code)]:px-1 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:rounded',
                    '[&_code:not(pre_code)]:text-xs [&_code:not(pre_code)]:text-foreground',
                    // Blockquote
                    '[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground',
                    // Links
                    '[&_a]:text-primary [&_a]:no-underline [&_a]:underline-offset-2 [&_a:hover]:underline',
                    // Images
                    '[&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-3',
                    // Headings
                    '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-tight',
                    '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:tracking-tight',
                )}
                style={{ minHeight }}
            />
        </div>
    )
}

// Re-export from TiptapContent if you have one, or use this minimal version
export { TiptapEditor as default }