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
| `accent-text` | `#FFFFFF` | Text on accent backgrounds |
| `white` | `#FFFFFF` | Navbar, cards, form surfaces |

### Tailwind config additions

```typescript
theme: {
  extend: {
    colors: {
      accent: {
        DEFAULT: '#1A4D3E',
        hover: '#163D31',
      },
      surface: '#F0EFED',
      border: '#E5E5E5',
      muted: '#888888',
    }
  }
}
```

---

## Typography

### Fonts

| Role | Font | Usage |
|---|---|---|
| Editorial | **Lora** (serif) | Post titles, post body, pull quotes, brand name |
| UI | **Inter** (sans-serif) | Navbar, buttons, labels, metadata, forms |

### Loading in index.html

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

### Tailwind config additions

```typescript
fontFamily: {
  serif: ['Lora', 'Georgia', 'serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```

### Type Scale

| Element | Class |
|---|---|
| Brand name | `font-serif text-2xl font-bold` |
| Hero post title | `font-serif text-4xl font-bold leading-tight` |
| Post card title | `font-serif text-xl font-semibold` |
| Section heading (in post body) | `font-serif text-2xl font-semibold` |
| Body text | `font-serif text-base leading-relaxed` |
| UI labels / nav | `font-sans text-sm` |
| Metadata (date, read time) | `font-sans text-xs text-muted` |
| Button | `font-sans text-sm font-medium uppercase tracking-wide` |

---

## Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| Reading column | `max-w-2xl` (672px) | Post body, forms, auth pages |
| Page max width | `max-w-6xl` (1152px) | Feed, navbar, general layout |
| Navbar height | `h-16` (64px) | Fixed across all pages |
| Sidebar width | `w-56` (224px) | Admin layout only |
| Section padding | `px-6 py-12` | Standard page section padding |
| Card padding | `p-6` | Standard card inner padding |

---

## Responsive Breakpoints

We use a **mobile-first** approach. Write base styles for mobile, then override with
`md:` and `lg:` prefixes for larger screens.

| Breakpoint | Screen | Tailwind prefix |
|---|---|---|
| Mobile | `< 640px` | (base, no prefix) |
| Tablet | `640px – 1024px` | `sm:` / `md:` |
| Desktop | `> 1024px` | `lg:` |

### Layout changes per breakpoint

**Navbar**
- Mobile: brand name left, hamburger icon right. Nav links hidden behind a slide-in modal.
- Desktop: brand name left, nav links center, auth buttons right.

**Feed / Post grid**
- Mobile: `grid-cols-1`
- Tablet: `sm:grid-cols-2`
- Desktop: `lg:grid-cols-3`

**Hero featured post**
- Mobile and desktop: image on top, text below — consistent at all screen sizes.
- Takes full width of the content column at all sizes.
- Image is taller than a regular card (`h-72` vs `h-48`), title is larger serif.

**PostCard**
- Image always on top, text always below — no side-by-side layout at any breakpoint.
- Consistent card shape across all screen sizes, only the grid column count changes.

**Single post reading column**
- Mobile: `px-4` full width
- Desktop: `max-w-2xl mx-auto` centered

**Admin sidebar**
- Mobile: top tab bar replacing sidebar (Users / Posts / Log Out)
- Desktop: fixed left sidebar `w-56`

**Auth pages (Login / Register)**
- Mobile: `mx-4` full width card
- Desktop: `max-w-md mx-auto` centered card

**Create / Edit post**
- Mobile: full width, Publish button sticky at bottom
- Desktop: `max-w-2xl mx-auto`, Publish button in navbar

---

## Components

### Navbar
- Background: `white` with `border-b border-border`
- Left: Brand name in `font-serif`
- Center: Nav links in `font-sans text-sm` — hidden on mobile
- Right: Login/Register buttons for guests — user avatar + name for logged-in users — hidden on mobile
- Mobile: hamburger icon (Lucide `Menu`) on the right, opens the nav modal
- Active nav link: `border-b-2 border-accent`

### Mobile Nav Modal
A slide-in panel from the left — not a full-screen overlay, not a dropdown.

**Behavior:**
- Triggered by the hamburger icon in the mobile navbar
- Panel slides in from the left using Framer Motion `x: -100% → 0`
- A semi-transparent dark overlay covers the rest of the screen (`bg-black/40`)
- The panel does NOT fill the full screen width — it stops with a visible gap on the right
  so it feels like a floating panel, not a takeover. Use `w-3/4 max-w-xs`.
- Clicking the overlay or a nav link closes the panel
- Panel slides back out on close `x: 0 → -100%`

**Panel contents (top to bottom):**
- Brand name at the top with a close button (`X`) on the right
- Divider
- Nav links stacked vertically with comfortable padding
- Divider
- Login/Register links for guests — or username + Logout for logged-in users

**Framer Motion config:**
```tsx
const panelVariants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { type: 'tween', duration: 0.25 } },
  exit: { x: '-100%', transition: { type: 'tween', duration: 0.2 } },
}
```

Wrap with `<AnimatePresence>` so the exit animation plays when the modal closes.

### Hero Featured Post
The first post from the feed rendered prominently at the top of the page.
This is not a special database field — it is simply the most recent post displayed differently.

**Layout (same at all screen sizes — image on top, text below):**
- Full-width image: `w-full h-72 object-cover`
- Below the image: category/author tag, large serif title (`text-3xl md:text-4xl`),
  short excerpt (3 lines max), author row (avatar + name + date + read time)
- Separated from the card grid below by a divider or generous spacing

### PostCard
- White background, `border border-border rounded-sm`
- **Image always on top** — `w-full h-48 object-cover` — no side-by-side layout at any breakpoint
- Fallback when no banner image: `bg-surface` block with the post title initial centered
- Body below image: author tag, read time, title (serif), excerpt (2 lines truncated),
  author row (avatar + name + date + like count)
- Hover: subtle `translateY(-2px)` lift with `transition-transform duration-200`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### Buttons

| Variant | Classes |
|---|---|
| Primary | `bg-accent hover:bg-accent-hover text-white font-sans text-sm uppercase tracking-wide px-6 py-2 transition-colors duration-200` |
| Ghost | `border border-border text-primary hover:bg-surface font-sans text-sm px-6 py-2 transition-colors duration-200` |
| Danger | `text-red-600 hover:text-red-800 font-sans text-sm transition-colors duration-200` |

### Input Fields
- Background: `white`
- Border: `border border-border focus:border-accent outline-none transition-colors duration-200`
- Padding: `px-4 py-2`
- Font: `font-sans text-sm`
- Placeholder: `text-muted`
- Label: `font-sans text-sm font-medium text-primary mb-1 block`
- Every input must have an associated `<label>` via `htmlFor` / `id`

### Pull Quote Block
- Background: `bg-accent`
- Text: `text-white font-serif text-xl italic leading-relaxed`
- Padding: `px-10 py-8`
- Attribution: `text-white/70 font-sans text-sm mt-4`
- Used in: Feed page between hero and post grid, Single post page mid-article

### Initials Avatar
- Circle: `w-9 h-9 rounded-full flex items-center justify-center`
- Background: generated from name — rotate through `['bg-teal-600','bg-violet-600','bg-amber-600','bg-rose-600']`
- Text: `text-white font-sans text-sm font-semibold`

### Role Badge
- `border border-border rounded-full px-3 py-0.5 font-sans text-xs`
- `user` → default border + `text-primary`
- `admin` → `border-accent text-accent`

### Comment Card
- No card border — separated by spacing only
- Author row: avatar (32px) + name + timestamp
- Body: `font-sans text-sm leading-relaxed`
- Reply link: `text-accent text-xs font-sans`
- Nested reply: `ml-10 border-l-2 border-border pl-4`

---

## Micro Animations (MVP)

Keep it purposeful and minimal. Every animation must serve a reason — feedback,
orientation, or delight. Never animate for the sake of animating.

### Page transitions
Applied once at the layout level. Every page fades in on mount.

```tsx
const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

<motion.div variants={pageVariants} initial="hidden" animate="visible">
  {children}
</motion.div>
```

### Mobile nav modal
Slide in from left on open, slide back out on close. See Mobile Nav Modal section above.

### PostCard hover
```tsx
<motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
```

### Like button
A small scale bounce when toggled to give tactile feedback.

```tsx
<motion.button
  whileTap={{ scale: 0.85 }}
  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
>
```

### That is it for MVP
No scroll animations, no staggered list entrances, no parallax. Those are post-MVP
if the app feels like it needs more life after the design pass is done.

---

## UX States

Every data-fetching component must handle four states explicitly.
Never leave any of them undesigned.

### 1. Loading — Skeleton screens

Do not use a spinner floating in the center of the page. Use skeleton screens.

**PostCard skeleton:**
```tsx
<div className="animate-pulse border border-border rounded-sm">
  <div className="h-48 bg-surface" />
  <div className="p-6 space-y-3">
    <div className="h-3 bg-surface rounded w-1/4" />
    <div className="h-5 bg-surface rounded w-3/4" />
    <div className="h-3 bg-surface rounded w-full" />
    <div className="h-3 bg-surface rounded w-2/3" />
  </div>
</div>
```

Show 6 skeleton cards on the Feed page while posts are loading.

### 2. Empty state

```tsx
<div className="text-center py-24">
  <p className="font-serif text-2xl text-primary mb-2">No tales yet</p>
  <p className="font-sans text-sm text-muted">Be the first to write something worth reading.</p>
</div>
```

**Comments:**
```tsx
<p className="font-sans text-sm text-muted py-6">No conversations yet. Start one.</p>
```

### 3. Error state

```tsx
<div className="text-center py-24">
  <p className="font-serif text-xl text-primary mb-2">Something went wrong</p>
  <p className="font-sans text-sm text-muted mb-6">{error}</p>
  <button onClick={retry}>Try again</button>
</div>
```

### 4. Success state
The normal rendered state.

---

## Accessibility (a11y)

### Color contrast
| Text | Background | Pass |
|---|---|---|
| `#111111` on `#FAFAFA` | Page bg | ✅ |
| `#888888` on `#FFFFFF` | Card bg | ✅ Large text only |
| `#FFFFFF` on `#1A4D3E` | Accent button | ✅ |

⚠️ `text-muted` (`#888888`) only passes for large text (18px+). Use `#666666` for
smaller muted text that needs to be readable.

### Rules to follow in every component
- Every `<img>` must have `alt` — decorative images use `alt=""`
- Every icon-only button must have `aria-label`
- Every form input must have a `<label>` associated via `htmlFor` / `id`
- Do not remove focus outlines — use `focus:ring-2 focus:ring-accent` instead

---

## SEO & Meta Tags

| Page | Title format |
|---|---|
| Feed | `Z-Tales — A sanctuary for the literate mind` |
| Single post | `{post.title} — Z-Tales` |
| Login | `Sign in — Z-Tales` |
| Register | `Create an account — Z-Tales` |
| Create post | `New post — Z-Tales` |
| Admin | `Admin — Z-Tales` |
| 404 | `Page not found — Z-Tales` |

Open Graph tags on the Single Post page:

```html
<meta property="og:title" content="{post.title}" />
<meta property="og:description" content="{first 160 chars of post.content}" />
<meta property="og:image" content="{post.banner_image or fallback}" />
<meta property="og:type" content="article" />
```

---

## 404 Page

```tsx
<div className="min-h-screen bg-base flex flex-col items-center justify-center text-center px-4">
  <p className="font-sans text-sm text-muted uppercase tracking-widest mb-4">404</p>
  <h1 className="font-serif text-4xl text-primary mb-4">This page does not exist</h1>
  <p className="font-sans text-sm text-muted mb-8">
    The tale you were looking for has either moved or was never written.
  </p>
  <Link to="/">Return to the feed</Link>
</div>
```

Register as a catch-all in the router:
```tsx
<Route path="*" element={<NotFoundPage />} />
```

---

## Page Layouts

### Auth pages (Login / Register)
- Background: `bg-surface`
- Mobile: `mx-4` full width card
- Desktop: `bg-white border border-border p-10 max-w-md mx-auto mt-24`

### Feed page
- Navbar (sticky)
- Hero featured post (latest post, image on top, text below, full width)
- Pull quote block (hardcoded brand statement)
- Post grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- Pagination
- Footer

### Single post page
- Navbar
- Full-width banner image (if exists)
- Reading column `max-w-2xl mx-auto px-4`: title → author row → body → like button → comments
- Footer

### Create / Edit post page
- Navbar (Publish button replaces auth buttons)
- Centered form `max-w-2xl mx-auto px-4`

### Admin page
- Desktop: fixed left sidebar `w-56` + main panel
- Mobile: top tab bar

---

## Design Decisions & Why

**Why serif for editorial content?**
Serif fonts carry connotations of print, literature, and considered writing. Every major
reading-first platform uses a serif for body text. It signals the content is worth reading slowly.

**Why dark teal?**
Bright accents feel jarring on light editorial layouts. Dark teal is assertive without
being loud — it fits the "sanctuary" tone.

**Why 672px reading width?**
The typographic sweet spot for comfortable reading at 16px — approximately 65-75
characters per line. Medium uses 680px. Wider causes eye fatigue, narrower feels cramped.

**Why mobile-first?**
Most blog readers are on their phones. Mobile-first produces cleaner CSS and forces
you to think about what is truly essential before adding complexity.

**Why skeleton screens instead of spinners?**
Skeletons preserve layout and reduce perceived load time. Spinners communicate nothing
about what is coming or how much space it will occupy. Layout shift on data arrival feels broken.

**Why image always on top in PostCard?**
Consistent card shape at all screen sizes is simpler to build and visually more coherent.
The card looks the same on a phone as it does on a desktop — only the grid column count changes.

**Why a slide-in modal instead of a dropdown for mobile nav?**
A dropdown appears directly under the trigger and can feel cluttered on small screens.
A slide-in panel with a gap on the right has clear intentionality — it feels like a
deliberate UI surface rather than an afterthought. The gap signals to the user that they
can tap the overlay to dismiss it.

**Why border-driven layout instead of shadows?**
Heavy shadows create elevation suited to dashboards. For editorial reading, flat borders
keep focus on the content, not the UI chrome.

**Why Stitch for design reference?**
Stitch generates high-fidelity layouts quickly from natural language prompts. Rather than
designing from scratch in Figma, we used Stitch to establish the visual language and coded
from those references. Faster iteration, still fully custom in implementation.