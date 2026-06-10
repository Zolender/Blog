# Z-Tales — Design System

The single source of truth for every visual decision in this project.
When in doubt about a color, font, spacing value, or component structure — check here first.

---

## Brand

**Name:** Z-Tales  
**Tagline:** *A sanctuary for the literate mind*  
**Tone:** Editorial, warm, reading-first. Think Medium meets Substack with a more personal feel.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#FAFAFA` | Page background |
| `bg-surface` | `#F0EFED` | Cards, sidebar, input backgrounds |
| `border` | `#E5E5E5` | All borders, dividers, table lines |
| `text-primary` | `#111111` | Headings, body text |
| `text-muted` | `#666666` | Metadata, timestamps, placeholders |
| `accent` | `#1A4D3E` | Buttons, active states, links, pull quote bg |
| `accent-hover` | `#163D31` | Hover state on accent elements |
| `danger` | `#dc2626` | Delete actions, error text |
| `danger-hover` | `#991b1b` | Hover on danger elements |
| `danger-bg` | `#fef2f2` | Error banner background |
| `danger-border` | `#fecaca` | Error banner border |
| `white` | `#FFFFFF` | Navbar, cards, form surfaces |

### Tailwind v4 — `@theme` in `index.css`

```css
@theme {
  --color-accent:        #1A4D3E;
  --color-accent-hover:  #163D31;
  --color-surface:       #F0EFED;
  --color-border:        #E5E5E5;
  --color-muted:         #666666;
  --color-base:          #FAFAFA;
  --color-primary:       #111111;
  --color-danger:        #dc2626;
  --color-danger-hover:  #991b1b;
  --color-danger-bg:     #fef2f2;
  --color-danger-border: #fecaca;
}
```

> This project uses **Tailwind CSS v4**. There is no `tailwind.config.ts`.
> All tokens live in `@theme {}` inside `frontend/src/index.css`.
> All reusable class patterns live in `@utility {}` blocks in the same file.
> Never use inline `style={{}}` for values that belong to the design system.

---

## Typography

### Fonts

| Role | Font | Usage |
|---|---|---|
| Editorial | **Lora** (serif) | Post titles, post body, pull quotes, brand name |
| UI | **Inter** (sans-serif) | Navbar, buttons, labels, metadata, forms |

### Loading in `index.html`

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

### `@theme` additions

```css
--font-family-serif: 'Lora', Georgia, serif;
--font-family-sans:  'Inter', system-ui, sans-serif;
```

### Utility classes (defined in `index.css`)

| Element | Utility |
|---|---|
| Brand name | `brand-name` |
| Hero post title | `heading-hero` |
| Post card title | `heading-card` |
| Section heading | `heading-section` |
| Post body text | `body-text` |
| UI metadata | `meta-text` |
| Fine print / copyright | `fine-text` |

---

## Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| Reading column | `max-w-2xl` (672px) | Post body, write form |
| Page max width | `max-w-6xl` (1152px) | Feed, navbar, general layout |
| Navbar height | `h-16` (64px) | Fixed across all pages |
| Section padding | `px-6 py-12` | Standard page section padding |
| Card padding | `p-5` or `p-6` | Standard card inner padding |

### Utility classes

| Utility | Value |
|---|---|
| `page-wrapper` | `max-w-6xl mx-auto px-6` |
| `reading-column` | `max-w-2xl mx-auto px-4` |

---

## Responsive Breakpoints

Mobile-first. Write base styles for mobile, then override with `sm:` and `lg:`.

| Breakpoint | Screen | Prefix |
|---|---|---|
| Mobile | `< 640px` | (base) |
| Tablet | `640px – 1024px` | `sm:` / `md:` |
| Desktop | `> 1024px` | `lg:` |

### Layout changes per breakpoint

**Navbar**
- Mobile: brand name left, hamburger icon right. Nav links hidden.
- Desktop: brand name left, nav links center, auth buttons right.

**Mobile nav panel**
- Slides in from the **right** as a floating dropdown (`top-20 right-4 w-64`)
- Not full-screen, not a sidebar — a small floating panel
- Semi-transparent overlay behind it

**Feed / Post grid**
- Mobile: `grid-cols-1`
- Tablet: `sm:grid-cols-2`
- Desktop: `lg:grid-cols-3`

**Single post reading column**
- Mobile: `px-4` full width
- Desktop: `max-w-2xl mx-auto` centered

**Auth page**
- Mobile: `px-6` full width card
- Desktop: `max-w-md mx-auto` centered card

**Create / Edit post**
- Mobile: full width, sticky top bar with Publish button, word count at bottom
- Desktop: `reading-column` centered, word count in top bar

---

## Components

### Navbar
- `bg-white border-b border-border h-16 sticky top-0 z-40`
- Left: `brand-name`
- Center (desktop): `nav-link` / `nav-link-active`
- Right (desktop): `btn-primary` for Register, `nav-link` for Sign in / Logout
- Mobile: `<Menu>` icon opens floating panel

### Mobile Nav Panel
Slides in from the **right** as a floating panel. Not full-screen.

```tsx
const panelVariants = {
  hidden:  { x: '100%' },
  visible: { x: 0, transition: { type: 'tween', duration: 0.25 } },
  exit:    { x: '100%', transition: { type: 'tween', duration: 0.2 } },
}
```

Panel is positioned `fixed top-20 right-4 w-64`. Contains nav links, auth section at bottom.
Wrap with `<AnimatePresence>` for exit animation.

### Hero Featured Post
First post from the feed rendered prominently.

- Full-width image `w-full h-72 object-cover` (letter fallback if no image)
- Meta line: `Featured · date` in `meta-text uppercase`
- Title: `heading-hero`
- Excerpt: plain text via `stripMarkdown()`, `line-clamp-2`
- Author row: `avatar` + name
- Uses `card` utility with `group` for hover title color change

### PostCard
- `card` utility — white, bordered, subtle hover shadow
- Image always on top `w-full h-48 object-cover` (letter fallback if no image)
- Meta: `READ TIME · DATE` in `meta-text uppercase`
- Title: `heading-card line-clamp-2`
- Excerpt: plain text via `stripMarkdown()`, `line-clamp-2`
- Author row: `avatar` + name (left) — like + comment counts (right)
- Wrapped in `motion.div whileHover={{ y: -2 }}`

### Avatar
Two sizes defined as utilities:

| Utility | Size | Usage |
|---|---|---|
| `avatar` | `1.75rem` (28px) | PostCard, CommentItem, Feed hero |
| `avatar-md` | `2.5rem` (40px) | Single post author header |

Color is generated deterministically from the username string.
Helper: `getAvatarColor(name: string = '')` in `src/utils/formatting.tsx`.
Has a default value of `''` to prevent crashes on undefined usernames.
Initial text: `avatar-initial` utility.

### Buttons

| Utility | Description |
|---|---|
| `btn-primary` | Accent bg, white text, uppercase, tracking — brand CTA |
| `btn-ghost` | Border only, hover surface bg |
| `btn-danger` | Danger color text, no bg — inline destructive links |
| `btn-danger-solid` | Danger bg, white text — used in ConfirmModal confirm button |

### Input Fields

| Utility | Description |
|---|---|
| `input-field` | Standard bordered input with focus accent |
| `write-title` | Transparent, serif, large — for post title in write mode |
| `write-area` | Transparent, serif, for post body in write mode |

**FloatingInput** — wraps `input-field` with an animated label that lifts on focus or when the field has a value. Used exclusively on the Auth page.

### WriterLayout
Distraction-free layout used by `/posts/new` and `/posts/:id/edit`.
No Navbar. Replaced by a custom sticky top bar inside `PostForm`:
- Left: back arrow + brand name
- Right: word count (desktop only) + Write/Preview toggle + Publish/Save button

### PostForm (Write / Edit)
- Full canvas feel — borderless title textarea, bordered writing area
- Sticky top bar with back, mode toggle, submit
- Banner image URL input with live preview strip
- Markdown toolbar: Bold, Italic, Strikethrough, Heading, Blockquote, Bullet list, Inline code, Code block, LinkIcon, Divider, Image
- Preview mode renders content via `react-markdown` + `remark-gfm` inside `prose` utility
- Word count — top bar on desktop, bottom of form on mobile
- **Draft autosave** — saves `{title, content, banner_image}` to localStorage every 30s under key `draft_post` (or `draft_post_{id}` for edits). Restored on mount if present. Cleared on successful publish/save. User is shown a "Draft restored" toast on restore.

### ConfirmModal
Reusable modal for all destructive actions. Replaces `window.confirm()` everywhere.

```tsx
<ConfirmModal
  title="Delete post"
  message="This cannot be undone."
  confirmLabel="Delete"
  isOpen={open}
  onConfirm={fn}
  onCancel={fn}
/>
```

**Design decisions:**
- `max-w-xs` (320px) — small footprint, not intrusive
- Always inline buttons (`justify-end`) — Cancel left, Confirm right. No stacked full-width buttons.
- `btn-ghost` for Cancel, `btn-danger-solid` for Confirm
- `p-6` inner padding with `<hr className="divider" />` separating text from actions
- Title: `font-sans text-sm font-semibold` — a prompt, not a section heading
- Entrance: `y: 16 → 0` slide-up, matches Toast entrance
- Overlay: `bg-black/30` — lighter than typical, less oppressive
- Click handling: `onClick={onCancel}` on the wrapper div, `e.stopPropagation()` on the card — overlay click correctly dismisses

### Toast
Lightweight feedback system for post-action results.

- Positioned `fixed bottom-4 left-4 right-4` on mobile, `sm:bottom-6 sm:right-6 sm:left-auto sm:w-80` on desktop
- Two variants: `success` (accent left border) and `error` (danger left border)
- Auto-dismisses after 3 seconds, manual dismiss via `X` button
- Framer Motion `y: 16→0` slide-up entrance, fade exit via `AnimatePresence`
- Triggered via `useToast()` hook from anywhere inside `<ToastProvider>`
- `aria-live="polite"` on the container for screen readers

```tsx
const { showToast } = useToast()
showToast("Post deleted")               // success
showToast("Something went wrong", "error")
```

### ErrorBoundary
Class component wrapping the main content area in `RootLayout`.
Catches render-time errors and displays a friendly recovery UI instead of a blank screen.
Does not wrap the Navbar — navigation always remains accessible.

### Pull Quote
```css
/* Utility: pull-quote */
background-color: var(--color-accent);
padding: 2.5rem;

/* Utility: pull-quote-text */
font-serif, italic, white/90

/* Utility: pull-quote-attr */
font-sans, small, white/60, mt-4
```

### CommentItem
- No card border — separated by spacing only
- Layout: `avatar` left, content right (`flex gap-3`)
- Author + timestamp in same row (`meta-text`)
- Comment body: `body-text` at `text-sm`, `wrap-break-word`
- Actions row: Reply (`nav-link` style), Edit (`nav-link` style, author only), Delete (`btn-danger`)
- Edit mode: inline auto-growing textarea replaces the comment body; actions row hidden while editing; Save exits on success, stays open on failure so the user can retry
- `canEdit` prop: `user.id === comment.author_id` — authors may edit their own words; admins may not (they can delete but should not alter someone else's writing)
- Delete triggers `ConfirmModal` — self-contained state inside `CommentItem`
- Nested reply indentation: `ml-10 border-l-2 border-border pl-4`

### Prose (Markdown Renderer)
`prose` utility in `index.css` — applied to any `ReactMarkdown` render container.

Covers: headings, paragraphs, bold, italic, blockquotes, inline code, code blocks,
lists, horizontal rules, links, images, tables (via `remark-gfm`), strikethrough, del.

### Error Banner
```css
/* Utility: error-banner */
background-color: var(--color-danger-bg);
border: 1px solid var(--color-danger-border);
color: var(--color-danger);
padding: 0.75rem 1rem;
```

---

## Shared Utilities — `src/utils/formatting.tsx`

| Export | Description |
|---|---|
| `getAvatarColor(name: string = '')` | Returns a Tailwind bg class deterministically from a string. Defaults to `''` to prevent crashes on undefined. |
| `getReadTime(content)` | Returns `"N min read"` based on word count at 200 wpm |
| `formatDate(dateString, options?)` | Returns a localised date string, defaults to `MMM D, YYYY` |
| `stripMarkdown(content)` | Strips markdown syntax from a string — used for plain-text excerpts in Feed hero and PostCard |

---

## Micro Animations

Keep it purposeful. Every animation must serve a reason.

| Element | Animation |
|---|---|
| Page mount | `opacity: 0→1, y: 10→0, duration: 0.3` |
| Auth tab switch | `opacity + x slide, AnimatePresence mode="wait"` |
| Mobile nav panel | `x: 100%→0` slide from right |
| PostCard hover | `whileHover={{ y: -2 }}` |
| Like button tap | `whileTap={{ scale: 0.85 }}, spring` |
| ConfirmModal entrance | `y: 16→0, opacity: 0→1, duration: 0.22` |
| Toast entrance | `y: 16→0, opacity: 0→1` slide up |
| Toast exit | `opacity: 1→0, duration: 0.2` |

No scroll animations, no staggered lists, no parallax for MVP.

---

## UX States

Every data-fetching component handles four states:

| State | Treatment |
|---|---|
| **Loading** | Skeleton cards (Feed) or `meta-text` loading message (Post, Admin) |
| **Error** | `state-container` with message + retry button |
| **Empty** | `state-container` with serif message + CTA |
| **Success** | Normal rendered state |

Destructive actions always go through `ConfirmModal`. Never `window.confirm()`.
Post-action feedback uses the `Toast` system.
Silent rollback for optimistic UI failures (like toggle) — no toast needed.

---

## Accessibility (a11y)

- Every `<img>` must have `alt`
- Every icon-only button must have `aria-label`
- Every form input must have a `<label>` via `htmlFor` / `id`
- Error banners use `role="alert"` and `aria-live="polite"`
- ConfirmModal uses `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Toast container uses `aria-live="polite"`
- Do not remove focus outlines

---

## SEO & Meta Tags

| Page | Title |
|---|---|
| Feed | `Z-Tales — A sanctuary for the literate mind` |
| Single post | `{post.title} — Z-Tales` |
| Auth | `Sign in — Z-Tales` |
| Write | `New post — Z-Tales` |
| Edit | `Editing — Z-Tales` |
| Admin | `Admin — Z-Tales` |
| 404 | `Page not found — Z-Tales` |

Open Graph on Single Post:
```html
<meta property="og:title" content="{post.title}" />
<meta property="og:description" content="{first 160 chars of stripped content}" />
<meta property="og:image" content="{post.banner_image or fallback}" />
<meta property="og:type" content="article" />
```

---

## Design Decisions & Why

**Why serif for editorial content?**
Serif fonts carry connotations of print, literature, and considered writing. Every major reading-first platform uses a serif for body text. It signals the content is worth reading slowly.

**Why dark teal?**
Bright accents feel jarring on light editorial layouts. Dark teal is assertive without being loud — it fits the "sanctuary" tone.

**Why 672px reading width?**
The typographic sweet spot for comfortable reading at 16px — approximately 65–75 characters per line. Medium uses 680px. Wider causes eye fatigue, narrower feels cramped.

**Why mobile-first?**
Most blog readers are on their phones. Mobile-first produces cleaner CSS and forces you to think about what is truly essential before adding complexity.

**Why skeleton screens instead of spinners?**
Skeletons preserve layout and reduce perceived load time. Spinners communicate nothing about what is coming or how much space it will occupy.

**Why image always on top in PostCard?**
Consistent card shape at all screen sizes. The card looks the same on a phone as it does on a desktop — only the grid column count changes.

**Why a floating panel from the right for mobile nav?**
A small floating panel with a gap on the left feels intentional rather than a takeover. The gap signals the user can tap the overlay to dismiss it.

**Why border-driven layout instead of shadows?**
Heavy shadows create elevation suited to dashboards. For editorial reading, flat borders keep focus on the content, not the UI chrome.

**Why ConfirmModal instead of `window.confirm()`?**
Browser native dialogs are unstyled, block the thread, and cannot be tested. A modal stays in the design system, works correctly on mobile with large tap targets, and gives us full control over copy and styling.

**Why `max-w-xs` for the ConfirmModal?**
A confirmation prompt is not a form. It needs just enough space for a clear question and two buttons. Anything wider feels like the app is making a big deal of a small action. Small = decisive.

**Why always-inline buttons in ConfirmModal?**
Stacked full-width buttons on mobile look like a form submit flow. Two compact inline buttons — Cancel left, Confirm right — is the universal confirmation pattern across every major platform. Users know it instantly.

**Why `btn-danger-solid` instead of overriding `btn-primary`?**
`btn-primary` has uppercase + letter-spacing baked in as brand identity. Overriding it with `bg-danger!` is a hack. A destructive confirm button should have its own semantic utility — filled red, no uppercase, same sizing. Clean and intentional.

**Why Toast for post-action feedback?**
Toasts are feedback after an action, not before. They confirm something happened without blocking the user. Auto-dismiss keeps the UI clean.

**Why draft autosave?**
If a user writes 500 words and accidentally closes the tab, it's gone. That happens once and they never come back. localStorage autosave is free, requires no backend, and is the difference between a writing tool people trust and one they don't.

**Why an Error Boundary?**
One component crash currently produces a blank white screen with no explanation or recovery path. An error boundary catches the crash, renders a friendly fallback, and keeps the Navbar accessible so the user can navigate away. It's the difference between "the app broke" and "something went wrong on this page."

**Why `@utility` in Tailwind v4?**
Defining reusable patterns as utilities keeps components clean — a single class name instead of 8 inline ones. When a style needs to change, it changes in one place.

**Why markdown for post content?**
Markdown gives writers formatting power without a complex rich text editor. It's portable, plain text under the hood, renders predictably, and keeps our bundle small.