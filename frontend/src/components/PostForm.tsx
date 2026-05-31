import { ArrowLeft, Bold, Code, Code2, Edit2, Eye, Heading2, Image, Italic, Link as LinkIcon, List, Minus, Quote, StrikethroughIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type SubmitEvent } from "react"
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
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [isPreview, setIsPreview] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // on mount we'd restore draft if one exists, otherwise fall back to initialValues
    const [title, setTitle] = useState(() => {
        const saved = localStorage.getItem(draftKey)
        if (saved) {
            try { return JSON.parse(saved).title ?? initialValues?.title ?? "" }
            catch { return initialValues?.title ?? "" }
        }
        return initialValues?.title ?? ""
    })

    const [content, setContent] = useState(() => {
        const saved = localStorage.getItem(draftKey)
        if (saved) {
            try { return JSON.parse(saved).content ?? initialValues?.content ?? "" }
            catch { return initialValues?.content ?? "" }
        }
        return initialValues?.content ?? ""
    })

    const [banner_image, setBanner_image] = useState(() => {
        const saved = localStorage.getItem(draftKey)
        if (saved) {
            try { return JSON.parse(saved).banner_image ?? initialValues?.banner_image ?? "" }
            catch { return initialValues?.banner_image ?? "" }
        }
        return initialValues?.banner_image ?? ""
    })

    // notify user if a draft was restored
    useEffect(() => {
        const saved = localStorage.getItem(draftKey)
        if (saved) {
            showToast("Draft restored", "success")
        }
    }, [])

    // autosave
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem(draftKey, JSON.stringify({ title, content, banner_image }))
        }, 1500)
        return () => clearTimeout(timer)
    }, [title, content, banner_image, draftKey])

    useEffect(()=>{
        const el = textareaRef.current
        if(!el)return 
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }, [content])


    const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        await onSubmit({ title, content, banner_image })
        // clear draft on successful submit
        localStorage.removeItem(draftKey)
    }

    const injectWrap = useCallback((before: string, after: string, defaultText: string) => {
        const el = textareaRef.current
        if (!el) return
        const start = el.selectionStart
        const end = el.selectionEnd
        const selected = content.slice(start, end) || defaultText
        const next = content.slice(0, start) + before + selected + after + content.slice(end)
        setContent(next)
        requestAnimationFrame(() => {
            el.focus()
            const selfStart = start + before.length
            const selfEnd = selfStart + selected.length
            el.setSelectionRange(selfStart, selfEnd)
        })
    }, [content])

    const injectLinePrefix = useCallback((prefix: string) => {
        const el = textareaRef.current
        if (!el) return
        const start = el.selectionStart
        const lineStart = content.lastIndexOf("\n", start - 1) + 1
        const next = content.slice(0, lineStart) + prefix + content.slice(lineStart)
        setContent(next)
        requestAnimationFrame(() => {
            el.focus()
            el.setSelectionRange(start + prefix.length, start + prefix.length)
        })
    }, [content])

    const toolbarItems = [
        { icon: <Bold size={14} />, label: "Bold", action: () => injectWrap("**", "**", "bold text") },
        { icon: <Italic size={14} />, label: "Italic", action: () => injectWrap("*", "*", "italic text") },
        { icon: <Heading2 size={14} />, label: "Heading", action: () => injectLinePrefix("## ") },
        { icon: <Code size={14} />, label: "Inline code", action: () => injectWrap("`", "`", "code") },
        { icon: <Quote size={14} />, label: "Blockquote", action: () => injectLinePrefix("> ") },
        { icon: <List size={14} />, label: "List Item", action: () => injectLinePrefix("- ") },
        { icon: <Minus size={14} />, label: "Divider", action: () => injectWrap("\n\n---\n\n", "", "") },
        { icon: <StrikethroughIcon size={14} />, label: "StrikeThrough", action: () => injectWrap("~~", "~~", "strikethrough text") },
        { icon: <Code2 size={14} />, label: "Code Block", action: () => injectWrap("\n```\n", "\n```\n", "code here") },
        { icon: <LinkIcon size={14} />, label: "Link", action: () => injectWrap("[", "](url)", "link text") },
        { icon: <Image size={14} />, label: "Image", action: () => injectWrap("![", "](url)", "alt text") },
    ]

    return (
        <div className="min-h-screen flex flex-col">

            <header className="sticky top-0 z-10 bg-base border-b border-border">
                <div className="page-wrapper h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span className="hidden sm:inline text-sm">Back</span>
                        </button>
                        <span className="text-border select-none">|</span>
                        <span className="brand-name text-base!">Z-Tales</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="meta-text hidden sm:inline">{wordCount} words</span>
                        <button
                            type="button"
                            onClick={() => setIsPreview(v => !v)}
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
                            {isLoading ? "Saving..." : submitLabel}
                        </button>
                    </div>
                </div>
            </header>

            <form id="post-form" onSubmit={handleSubmit} className="flex-1 reading-column py-10 flex flex-col">
                {error && <div className="error-banner mb-4">{error}</div>}

                <div className="flex flex-col gap-0">
                    <div className="flex items-center gap-2 py-2">
                        <Image size={13} className="text-muted shrink-0" />
                        <input
                            type="url"
                            value={banner_image}
                            onChange={e => setBanner_image(e.target.value)}
                            placeholder="Paste a banner image URL..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-muted placeholder:text-muted/50 font-sans"
                        />
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

                <textarea
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Title"
                    required
                    rows={2}
                    className="w-full bg-transparent border-none outline-none heading-hero placeholder:text-muted/30 leading-tight"
                />

                <hr className="divider" />

                {isPreview ? (
                    <div className="prose min-h-[60vh] pt-2">
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
                                    title={item.label}
                                    onClick={item.action}
                                    className="p-2 text-muted hover:text-primary hover:bg-surface transition-colors rounded-sm"
                                >
                                    {item.icon}
                                </button>
                            ))}
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Begin your narrative here..."
                            required
                            className="w-full bg-transparent border-none outline-none resize-none body-text placeholder:text-muted/30 p-5 min-h-[60vh]"
                        />
                    </div>
                )}

                <p className="meta-text sm:hidden mt-2">{wordCount} words</p>
            </form>
        </div>
    )
}

export default PostForm