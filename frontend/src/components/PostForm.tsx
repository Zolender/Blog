import { ArrowLeft, Bold, Code, Code2, Edit2, Eye, Heading2, Image, ImagePlus, Italic, Link as LinkIcon, List, Minus, Quote, StrikethroughIcon, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type SubmitEvent } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useToast } from "./Toast"

interface PostFormValues {
    title: string
    content: string
    banner_image: string
}

interface PostFormProps {
    initialValues?: Partial<PostFormValues>
    onSubmit: (values: PostFormValues) => Promise<void>
    submitLabel: string
    isLoading: boolean
    error: string | null
    draftKey: string
}

const PostForm = ({ initialValues, onSubmit, submitLabel, isLoading, error, draftKey }: PostFormProps) => {
    const navigate       = useNavigate()
    const { showToast }  = useToast()
    const [isPreview, setIsPreview] = useState(false)

    // Two separate active-state buckets:
    // flashedButtons — temporary click/shortcut feedback (fades after 500ms)
    // contextualActive — persistent highlight when cursor is inside that formatting
    const [flashedButtons, setFlashedButtons]     = useState<Set<string>>(new Set())
    const [contextualActive, setContextualActive] = useState<Set<string>>(new Set())

    const textareaRef    = useRef<HTMLTextAreaElement>(null)
    const titleRef       = useRef<HTMLTextAreaElement>(null)
    const timersRef      = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
    const isFirstRender  = useRef(true)

    const [title, setTitle] = useState<string>(() => {
        const saved = localStorage.getItem(draftKey)
        if (saved) { try { return JSON.parse(saved).title ?? initialValues?.title ?? "" } catch {} }
        return initialValues?.title ?? ""
    })

    const [content, setContent] = useState<string>(() => {
        const saved = localStorage.getItem(draftKey)
        if (saved) { try { return JSON.parse(saved).content ?? initialValues?.content ?? "" } catch {} }
        return initialValues?.content ?? ""
    })

    const [banner_image, setBanner_image] = useState<string>(() => {
        const saved = localStorage.getItem(draftKey)
        if (saved) { try { return JSON.parse(saved).banner_image ?? initialValues?.banner_image ?? "" } catch {} }
        return initialValues?.banner_image ?? ""
    })

    // Notify on draft restore
    useEffect(() => {
        const saved = localStorage.getItem(draftKey)
        if (saved) {
            showToast("Draft restored", "success", {
                label: "Discard",
                onClick: () => {
                    localStorage.removeItem(draftKey)
                    setTitle(initialValues?.title ?? "")
                    setContent(initialValues?.content ?? "")
                    setBanner_image(initialValues?.banner_image ?? "")
                }
            })
        }
    }, [])

    // Warn before tab close when the form has unsaved changes
    useEffect(() => {
        const isDirty =
            title   !== (initialValues?.title        ?? "") ||
            content !== (initialValues?.content      ?? "") ||
            banner_image !== (initialValues?.banner_image ?? "")
        if (!isDirty) return
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
        window.addEventListener("beforeunload", handler)
        return () => window.removeEventListener("beforeunload", handler)
    }, [title, content, banner_image, initialValues])

    // Debounced autosave — skip the very first render to avoid writing back the same draft
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return }
        const timer = setTimeout(() => {
            localStorage.setItem(draftKey, JSON.stringify({ title, content, banner_image }))
        }, 1500)
        return () => clearTimeout(timer)
    }, [title, content, banner_image, draftKey])

    // Content textarea auto-grow
    useEffect(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = `${el.scrollHeight}px`
    }, [content])

    // Title textarea auto-grow
    useEffect(() => {
        const el = titleRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = `${el.scrollHeight}px`
    }, [title])

    const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length

    // Derive the loading button label from the action label so "Publish" → "Publishing..."
    const loadingLabel = submitLabel === "Publish" ? "Publishing..." : "Saving..."

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            showToast("Add a title before publishing", "error")
            titleRef.current?.focus()
            return
        }
        if (!content.trim()) {
            showToast("Post content can't be empty", "error")
            textareaRef.current?.focus()
            return
        }
        try {
            await onSubmit({ title, content, banner_image })
            localStorage.removeItem(draftKey)
        } catch {
            // parent already displays the error; don't clear the draft
        }
    }

    // Flash a toolbar button briefly (click/shortcut feedback)
    const flashButton = useCallback((label: string) => {
        if (timersRef.current.has(label)) clearTimeout(timersRef.current.get(label))
        setFlashedButtons(prev => new Set([...prev, label]))
        const timer = setTimeout(() => {
            setFlashedButtons(prev => { const n = new Set(prev); n.delete(label); return n })
            timersRef.current.delete(label)
        }, 500)
        timersRef.current.set(label, timer)
    }, [])

    // Scan the cursor's surroundings and update which toolbar buttons should appear active
    const checkContext = useCallback(() => {
        const el = textareaRef.current
        if (!el) return
        const pos  = el.selectionStart
        const end  = el.selectionEnd
        const active = new Set<string>()

        // Line-prefix checks
        const lineStart = content.lastIndexOf("\n", pos - 1) + 1
        const line = content.slice(lineStart)
        if (line.startsWith("## ")) active.add("Heading")
        if (line.startsWith("> "))  active.add("Blockquote")
        if (line.startsWith("- "))  active.add("List Item")

        // Inline-wrap checks (single-line only)
        const before = content.slice(0, pos)
        const after  = content.slice(end)

        const checkWrap = (marker: string, label: string) => {
            const last = before.lastIndexOf(marker)
            if (last === -1) return
            // Guard: a single * must not be part of ** (avoids italic false-positive inside bold)
            if (marker === "*" && last > 0 && before[last - 1] === "*") return
            const between = before.slice(last + marker.length)
            if (between.includes(marker) || between.includes("\n")) return
            if (after.indexOf(marker) !== -1) active.add(label)
        }

        // Check ** before * so bold doesn't trigger the italic check
        checkWrap("**", "Bold")
        if (!active.has("Bold")) checkWrap("*", "Italic")
        checkWrap("`",  "Inline code")
        checkWrap("~~", "StrikeThrough")

        // Link detection: cursor is between [ and ](...)
        const lastBracket = before.lastIndexOf("[")
        if (lastBracket !== -1) {
            const betweenBrackets = before.slice(lastBracket + 1)
            const noNested = !betweenBrackets.includes("[") && !betweenBrackets.includes("]") && !betweenBrackets.includes("\n")
            if (noNested && /^\]\([^)]*\)/.test(after)) active.add("Link")
        }

        setContextualActive(active)
    }, [content])

    // Toggle a line-prefix on/off (heading, blockquote, list)
    const toggleLinePrefix = useCallback((prefix: string) => {
        const el = textareaRef.current
        if (!el) return
        const start     = el.selectionStart
        const lineStart = content.lastIndexOf("\n", start - 1) + 1
        const line      = content.slice(lineStart)

        if (line.startsWith(prefix)) {
            const next = content.slice(0, lineStart) + line.slice(prefix.length)
            setContent(next)
            requestAnimationFrame(() => {
                el.focus()
                el.setSelectionRange(Math.max(lineStart, start - prefix.length), Math.max(lineStart, start - prefix.length))
            })
        } else {
            const next = content.slice(0, lineStart) + prefix + content.slice(lineStart)
            setContent(next)
            requestAnimationFrame(() => {
                el.focus()
                el.setSelectionRange(start + prefix.length, start + prefix.length)
            })
        }
    }, [content])

    // Toggle inline-wrap markers on/off.
    // multiline — skip the \n guard (needed for fenced code blocks)
    // closeRegex — match a flexible closing pattern (e.g. ]\([^)]*\) for real link URLs)
    const toggleWrap = useCallback((
        before: string,
        after: string,
        defaultText: string,
        multiline = false,
        closeRegex?: RegExp
    ) => {
        const el = textareaRef.current
        if (!el) return
        const selStart = el.selectionStart
        const selEnd   = el.selectionEnd
        const selected = content.slice(selStart, selEnd)

        // No closing marker — pure insertion
        if (!after) {
            const next = content.slice(0, selStart) + before + content.slice(selEnd)
            setContent(next)
            requestAnimationFrame(() => {
                el.focus()
                el.setSelectionRange(selStart + before.length, selStart + before.length)
            })
            return
        }

        // Remove: selection already surrounded by markers
        if (selStart >= before.length) {
            const hasBefore = content.slice(selStart - before.length, selStart) === before
            const hasAfter  = closeRegex
                ? closeRegex.test(content.slice(selEnd))
                : content.slice(selEnd, selEnd + after.length) === after
            if (hasBefore && hasAfter) {
                const closeLen = closeRegex
                    ? (closeRegex.exec(content.slice(selEnd))?.[0].length ?? after.length)
                    : after.length
                const next = content.slice(0, selStart - before.length) + selected + content.slice(selEnd + closeLen)
                setContent(next)
                requestAnimationFrame(() => {
                    el.focus()
                    el.setSelectionRange(selStart - before.length, selEnd - before.length)
                })
                return
            }
        }

        // Remove: cursor sits inside markers (no selection)
        if (selStart === selEnd) {
            const textBefore = content.slice(0, selStart)
            const textAfter  = content.slice(selStart)
            const lastMark   = textBefore.lastIndexOf(before)
            if (lastMark !== -1) {
                const between = textBefore.slice(lastMark + before.length)
                const noClose = !between.includes(after) && (multiline || !between.includes("\n"))
                const match   = closeRegex ? closeRegex.exec(textAfter) : null
                const firstClose = closeRegex ? (match?.index ?? -1) : textAfter.indexOf(after)
                const closeLen   = closeRegex ? (match?.[0].length ?? 0) : after.length
                if (noClose && firstClose !== -1) {
                    const inner = between + textAfter.slice(0, firstClose)
                    const next  = content.slice(0, lastMark) + inner + content.slice(selStart + firstClose + closeLen)
                    setContent(next)
                    requestAnimationFrame(() => {
                        el.focus()
                        const p = lastMark + between.length
                        el.setSelectionRange(p, p)
                    })
                    return
                }
            }
        }

        // Default: wrap with selection or placeholder
        const insert = selected || defaultText
        const next   = content.slice(0, selStart) + before + insert + after + content.slice(selEnd)
        setContent(next)
        requestAnimationFrame(() => {
            el.focus()
            el.setSelectionRange(selStart + before.length, selStart + before.length + insert.length)
        })
    }, [content])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Tab → 2 spaces instead of losing focus
        if (e.key === "Tab") {
            e.preventDefault()
            const el = textareaRef.current!
            const s = el.selectionStart
            const end = el.selectionEnd
            setContent(prev => prev.slice(0, s) + "  " + prev.slice(end))
            requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + 2, s + 2) })
            return
        }

        const mod = e.metaKey || e.ctrlKey
        if (!mod) return
        const key = e.key.toLowerCase()

        if (e.shiftKey) {
            if (key === "c") { e.preventDefault(); toggleWrap("\n```\n", "\n```\n", "code here", true); flashButton("Code Block") }
            return
        }

        switch (key) {
            case "b": e.preventDefault(); toggleWrap("**", "**", "bold text");                              flashButton("Bold");        break
            case "i": e.preventDefault(); toggleWrap("*",  "*",  "italic text");                            flashButton("Italic");      break
            case "k": e.preventDefault(); toggleWrap("[",  "](url)", "link text", false, /^\]\([^)]*\)/);  flashButton("Link");        break
            case "e": e.preventDefault(); toggleWrap("`",  "`",  "code");                                   flashButton("Inline code"); break
        }
    }, [toggleWrap, flashButton])

    const handleToolbarClick = useCallback((label: string, action: () => void) => {
        action()
        flashButton(label)
    }, [flashButton])

    const toolbarItems = [
        { icon: <Bold size={14} />,             label: "Bold",        hint: "Ctrl+B",       action: () => toggleWrap("**", "**", "bold text") },
        { icon: <Italic size={14} />,           label: "Italic",      hint: "Ctrl+I",       action: () => toggleWrap("*", "*", "italic text") },
        { icon: <Heading2 size={14} />,         label: "Heading",     hint: "",             action: () => toggleLinePrefix("## ") },
        { icon: <Code size={14} />,             label: "Inline code", hint: "Ctrl+E",       action: () => toggleWrap("`", "`", "code") },
        { icon: <Quote size={14} />,            label: "Blockquote",  hint: "",             action: () => toggleLinePrefix("> ") },
        { icon: <List size={14} />,             label: "List Item",   hint: "",             action: () => toggleLinePrefix("- ") },
        {
            icon: <Minus size={14} />,
            label: "Divider",
            hint: "",
            // Divider is always an insertion — no toggling, no wrapping
            action: () => {
                const el = textareaRef.current
                if (!el) return
                const pos = el.selectionEnd
                const divider = "\n\n---\n\n"
                setContent(prev => prev.slice(0, pos) + divider + prev.slice(pos))
                requestAnimationFrame(() => { el.focus(); el.setSelectionRange(pos + divider.length, pos + divider.length) })
            }
        },
        { icon: <StrikethroughIcon size={14} />, label: "StrikeThrough", hint: "",             action: () => toggleWrap("~~", "~~", "strikethrough text") },
        { icon: <Code2 size={14} />,             label: "Code Block",    hint: "Ctrl+Shift+C", action: () => toggleWrap("\n```\n", "\n```\n", "code here", true) },
        { icon: <LinkIcon size={14} />,          label: "Link",          hint: "Ctrl+K",       action: () => toggleWrap("[", "](url)", "link text", false, /^\]\([^)]*\)/) },
        { icon: <Image size={14} />,             label: "Image",         hint: "",             action: () => toggleWrap("![", "](url)", "alt text",  false, /^\]\([^)]*\)/) },
    ]

    return (
        <motion.div
            className="min-h-screen flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <header className="sticky top-0 z-10 bg-base border-b border-border">
                <div className="page-wrapper h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors px-1 py-2"
                        >
                            <ArrowLeft size={18} />
                            <span className="hidden sm:inline text-sm">Back</span>
                        </button>
                        <span className="text-border select-none">|</span>
                        <span className="brand-name text-base!">Z-Tales</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Word count visible on all screen sizes */}
                        <span className="meta-text">{wordCount} words</span>
                        <button
                            type="button"
                            onClick={() => {
                                setIsPreview(v => !v)
                                window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className="btn-ghost flex items-center gap-1.5 px-3! text-xs!"
                        >
                            {isPreview ? <><Edit2 size={12} /> Write</> : <><Eye size={12} /> Preview</>}
                        </button>
                        <button
                            className="btn-primary px-4! py-1.5! text-xs!"
                            type="submit"
                            form="post-form"
                            disabled={isLoading}
                        >
                            {isLoading ? loadingLabel : submitLabel}
                        </button>
                    </div>
                </div>
            </header>

            <form id="post-form" onSubmit={handleSubmit} className="flex-1 reading-column py-10 flex flex-col">
                {error && <div className="error-banner mb-4">{error}</div>}

                {/* Banner image */}
                <div className="flex flex-col gap-0">
                    <div className="flex items-center gap-2 py-2">
                        <ImagePlus size={13} className="text-muted shrink-0" />
                        <input
                            type="url"
                            value={banner_image}
                            onChange={e => setBanner_image(e.target.value)}
                            placeholder="Paste a banner image URL..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-muted placeholder:text-muted/50 font-sans"
                        />
                        {banner_image && (
                            <button
                                type="button"
                                onClick={() => setBanner_image("")}
                                aria-label="Remove banner image"
                                className="text-muted hover:text-primary transition-colors shrink-0 p-1"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    {banner_image && (
                        <img
                            src={banner_image}
                            alt="Banner preview"
                            className="w-full h-44 object-cover"
                            onError={e => (e.currentTarget.style.display = "none")}
                        />
                    )}
                </div>

                <hr className="divider" />

                {/* Title — auto-grows, character counter appears near limit */}
                <div>
                    <textarea
                        ref={titleRef}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Title"
                        rows={1}
                        maxLength={200}
                        className="w-full bg-transparent border-none outline-none heading-hero placeholder:text-muted/30 leading-tight resize-none overflow-hidden"
                    />
                    {title.length > 160 && (
                        <p className={`meta-text text-right ${title.length >= 200 ? "text-danger" : ""}`}>
                            {title.length} / 200
                        </p>
                    )}
                </div>

                <hr className="divider" />

                {isPreview ? (
                    // Preview matches the reading layout exactly — no extra min-height
                    <div className="prose pt-2">
                        {content.trim()
                            ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                            : <p className="meta-text italic">Nothing to preview yet.</p>
                        }
                    </div>
                ) : (
                    <div className="flex flex-col border border-border bg-white">
                        <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-border">
                            {toolbarItems.map(item => (
                                <button
                                    key={item.label}
                                    type="button"
                                    title={item.hint ? `${item.label} (${item.hint})` : item.label}
                                    onClick={() => handleToolbarClick(item.label, item.action)}
                                    className={`p-2.5 transition-colors rounded-sm ${
                                        flashedButtons.has(item.label) || contextualActive.has(item.label)
                                            ? "text-accent bg-surface"
                                            : "text-muted hover:text-primary hover:bg-surface"
                                    }`}
                                >
                                    {item.icon}
                                </button>
                            ))}
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onSelect={checkContext}
                            onClick={checkContext}
                            onKeyUp={checkContext}
                            placeholder="Begin your narrative here..."
                            autoCorrect="off"
                            autoCapitalize="off"
                            className="w-full bg-transparent border-none outline-none resize-none body-text placeholder:text-muted/30 p-5 min-h-[40vh]"
                        />
                    </div>
                )}
            </form>
        </motion.div>
    )
}

export default PostForm
