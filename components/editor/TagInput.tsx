'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'
import Pill from '@/components/ui/Pill'

export type Tag = {
    tag_id: string
    name: string
}

interface TagInputProps {
    tags: Tag[]
    setTags: (tags: Tag[]) => void
    allTags: Tag[]
    placeholder?: string
    maxTags?: number
    className?: string
}

// Bare command input — no search icon, styled inline
const InlineCommandInput = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Input>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Input
        ref={ref}
        className={cn(
            'flex-1 min-w-[80px] bg-transparent text-sm outline-none',
            'placeholder:text-muted-foreground/50',
            'disabled:cursor-not-allowed',
            className
        )}
        {...props}
    />
))
InlineCommandInput.displayName = 'InlineCommandInput'

export function TagInput({
                             tags,
                             setTags,
                             allTags,
                             placeholder = 'Add a tag…',
                             maxTags = 5,
                             className,
                         }: TagInputProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const filteredTags = allTags.filter(
        (tag) =>
            tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !tags.some((t) => t["tag_id"] === tag["tag_id"])
    )

    const handleSelect = (tag: Tag) => {
        if (tags.length >= maxTags) return
        setTags([...tags, tag])
        setInputValue('')
        setOpen(false)
        inputRef.current?.focus()
    }

    const handleRemove = (tag: Tag) => {
        setTags(tags.filter((t) => t["tag_id"] !== tag["tag_id"]))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Backspace with empty input removes the last tag
        if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            e.preventDefault()
            setTags(tags.slice(0, -1))
        }
        if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    const reachedMax = tags.length >= maxTags

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <Command shouldFilter={false} className="overflow-visible bg-transparent">
                {/* Input field with pills inside */}
                <div
                    onClick={() => inputRef.current?.focus()}
                    className={cn(
                        'flex flex-wrap items-center gap-1.5 min-h-[40px]',
                        'border border-border/60 bg-background px-3 py-2',
                        'cursor-text transition-colors duration-150',
                        'focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10',
                        reachedMax && 'opacity-60'
                    )}
                >
                    {tags.map((tag:Tag) => (
                        <Pill
                            key={tag["tag_id"]}
                            label={tag.name}
                            onClick={() => handleRemove(tag)}
                        />
                    ))}

                    {!reachedMax && (
                        <InlineCommandInput
                            ref={inputRef}
                            placeholder={tags.length === 0 ? placeholder : 'Add more…'}
                            value={inputValue}
                            onValueChange={(v) => {
                                setInputValue(v)
                                setOpen(v.length > 0 || true)
                            }}
                            onFocus={() => setOpen(true)}
                            onKeyDown={handleKeyDown}
                        />
                    )}
                </div>

                {/* Helper text */}
                <p className="mt-1.5 text-xs text-muted-foreground/60">
                    {reachedMax
                        ? `Maximum of ${maxTags} tags reached.`
                        : `${tags.length} of ${maxTags} tags added. Press backspace to remove the last one.`}
                </p>

                {/* Dropdown */}
                {open && !reachedMax && filteredTags.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1">
                        <CommandList
                            className={cn(
                                'max-h-48 overflow-y-auto border border-border/60',
                                'bg-popover shadow-md shadow-black/10',
                            )}
                        >
                            <CommandGroup>
                                {filteredTags.map((tag) => (
                                    <CommandItem
                                        key={tag["tag_id"]}
                                        value={tag.name}
                                        onSelect={() => handleSelect(tag)}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                                            'text-foreground/80 hover:text-foreground',
                                            'aria-selected:bg-primary/8 aria-selected:text-primary',
                                        )}
                                    >
                                        <span className="h-1.5 w-1.5 bg-primary/40 flex-shrink-0" />
                                        {tag.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                )}

                {/* No results */}
                {open && !reachedMax && inputValue.length > 0 && filteredTags.length === 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1">
                        <div className="border border-border/60 bg-popover px-3 py-3 text-sm text-muted-foreground shadow-md">
                            No matching tags found.
                        </div>
                    </div>
                )}
            </Command>
        </div>
    )
}