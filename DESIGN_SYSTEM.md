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
| `text-muted` | `#888888` | Metadata, timestamps, placeholders |
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
  --color-muted:         #888888;
  --color-base:          #FAFAFA;
  --color-primary:       #111111;
  --color-danger:        #dc2626;
  --color-danger-hover:  #991b1b;
  --color-danger-bg:     #fef2f2;
  --color-danger-border: #fecaca;
}
```

>  This project uses **Tailwind CSS v4**. There is no `tailwind.config.ts`.
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
- Mobile: full width, sticky top bar with Publish button
- Desktop: `reading-column` centered, Publish in top bar

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

Panel is positioned `fixed top-20 right-4 w-64`. Contains nav links (Feed always enabled,
Write disabled/muted when not logged in), auth section at bottom.
Wrap with `<AnimatePresence>` for exit animation.

### Hero Featured Post
First post from the feed, rendered prominently. Not a special DB field.

- Full-width image `w-full h-72 object-cover` (letter fallback if no image)
- Meta line: `Featured · date` in `meta-text uppercase`
- Title: `heading-hero`
- Excerpt: 2 lines, `line-clamp-2`
- Author row: `avatar` + name
- Uses the `card` utility with `group` for hover title color change

### PostCard
- `card` utility — white, bordered, subtle hover shadow
- Image always on top `w-full h-48 object-cover` (letter fallback if no image)
- Meta: `READ TIME · DATE` in `meta-text uppercase`
- Title: `heading-card line-clamp-2`
- Excerpt: `line-clamp-2`
- Author row: `avatar` + name (left) — like + comment counts (right)
- Wrapped in `motion.div whileHover={{ y: -2 }}`

### Avatar
Two sizes defined as utilities:

| Utility | Size | Usage |
|---|---|---|
| `avatar` | `1.75rem` (28px) | PostCard, CommentItem, Feed hero |
| `avatar-md` | `2.5rem` (40px) | Single post author header |

Color is generated deterministically from the username string.
Helper: `getAvatarColor(name)` in `src/utils/formatting.ts`.
Initial text: `avatar-initial` utility.

### Buttons

| Utility | Description |
|---|---|
| `btn-primary` | Accent bg, white text, uppercase, tracking |
| `btn-ghost` | Border only, hover surface bg |
| `btn-danger` | Danger color text, no border |

### Input Fields

| Utility | Description |
|---|---|
| `input-field` | Standard bordered input with focus accent |
| `textarea-field` | Same as input-field, resizable |
| `write-title` | Transparent, serif, large — for post title in write mode |
| `write-area` | Transparent, serif, for post body in write mode |

**FloatingInput** — the `<FloatingInput>` component wraps `input-field` with an animated
label that lifts to the top border on focus or when the field has a value.
Used exclusively on the Auth page.

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
- Author + timestamp in same row
- Inline confirm on delete (no `window.confirm()`)
- Nested reply: `ml-10 border-l-2 border-border pl-4`

### Error Banner
```css
/* Utility: error-banner */
background-color: var(--color-danger-bg);
border: 1px solid var(--color-danger-border);
color: var(--color-danger);
padding: 0.75rem 1rem;
```

---

## Shared Utilities — `src/utils/formatting.ts`

All helpers that are used across more than one component live here.

| Export | Description |
|---|---|
| `getAvatarColor(name)` | Returns a Tailwind bg class deterministically from a string |
| `getReadTime(content)` | Returns `"N min read"` based on word count at 200 wpm |
| `formatDate(dateString, options?)` | Returns a localised date string, defaults to `MMM D, YYYY` |

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

No scroll animations, no staggered lists, no parallax for MVP.

---

## UX States

Every data-fetching component handles four states:

| State | Treatment |
|---|---|
| **Loading** | 6 `SkeletonCard` components in the grid |
| **Error** | `state-container` with message + retry button |
| **Empty** | `state-container` with serif message + CTA |
| **Success** | Normal rendered state |

Inline destructive actions (delete post, delete comment, delete user) use
an inline confirm pattern — no `window.confirm()` or `window.alert()`.

---

## Accessibility (a11y)

- Every `<img>` must have `alt`
- Every icon-only button must have `aria-label`
- Every form input must have a `<label>` via `htmlFor` / `id`
- Error banners use `role="alert"` and `aria-live="polite"`
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
<meta property="og:description" content="{first 160 chars of content}" />
<meta property="og:image" content="{post.banner_image or fallback}" />
<meta property="og:type" content="article" />
```

---

## Design Decisions & Why

**Why serif for editorial content?**
Serif fonts carry connotations of print, literature, and considered writing. Every major
reading-first platform uses a serif for body text. It signals the content is worth reading slowly.

**Why dark teal?**
Bright accents feel jarring on light editorial layouts. Dark teal is assertive without
being loud — it fits the "sanctuary" tone.

**Why 672px reading width?**
The typographic sweet spot for comfortable reading at 16px — approximately 65–75
characters per line. Medium uses 680px. Wider causes eye fatigue, narrower feels cramped.

**Why mobile-first?**
Most blog readers are on their phones. Mobile-first produces cleaner CSS and forces
you to think about what is truly essential before adding complexity.

**Why skeleton screens instead of spinners?**
Skeletons preserve layout and reduce perceived load time. Spinners communicate nothing
about what is coming or how much space it will occupy.

**Why image always on top in PostCard?**
Consistent card shape at all screen sizes. The card looks the same on a phone as it does
on a desktop — only the grid column count changes.

**Why a floating panel from the right for mobile nav?**
A small floating panel with a gap on the left feels intentional rather than a takeover.
The gap signals the user can tap the overlay to dismiss it.

**Why border-driven layout instead of shadows?**
Heavy shadows create elevation suited to dashboards. For editorial reading, flat borders
keep focus on the content, not the UI chrome.

**Why inline confirm instead of `window.confirm()`?**
Browser native dialogs are unstyled, block the thread, and cannot be tested. Inline
confirms stay in the design system and give us full control.

**Why `@utility` in Tailwind v4?**
Defining reusable patterns as utilities keeps components clean — a single class name
instead of 8 inline ones. When a style needs to change, it changes in one place.