# Z-Tales — Design System

The single source of truth for every visual decision in this project.
When in doubt about a color, font, spacing value, or component structure — check here first.

---

## Brand

**Name:** Z-Tales (displayed as "The Quiet Room")
**Tagline:** *A sanctuary for the literate mind*
**Tone:** Editorial, warm, reading-first. Think Medium meets Substack with a more personal feel and you get an idea of how the app should look.

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
// tailwind.config.ts
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

## Components

### Navbar
- Background: `white` with `border-b border-border`
- Left: Brand name in `font-serif`
- Center: Nav links in `font-sans text-sm`
- Right: Login/Register buttons for guests — user avatar dropdown for logged-in users
- Active nav link: `border-b-2 border-accent`

### PostCard
- White background, `border border-border rounded-sm`
- Top: banner image (fixed height, `object-cover`) — fallback to surface bg if no image
- Body: category/author tag, read time, title (serif), excerpt, author row (avatar + name + date + like count)
- Hover: subtle `shadow-sm` transition
- Grid: 3 columns desktop (`grid-cols-3`), 1 column mobile

### Buttons

| Variant | Classes |
|---|---|
| Primary | `bg-accent hover:bg-accent-hover text-white font-sans text-sm uppercase tracking-wide px-6 py-2` |
| Ghost | `border border-border text-primary hover:bg-surface font-sans text-sm px-6 py-2` |
| Danger | `text-red-600 hover:text-red-800 font-sans text-sm` |

### Input Fields
- Background: `white`
- Border: `border border-border` with `focus:border-accent outline-none`
- Padding: `px-4 py-2`
- Font: `font-sans text-sm`
- Placeholder: `text-muted`

### Pull Quote Block
- Background: `bg-accent`
- Text: `text-white font-serif text-xl italic leading-relaxed`
- Padding: `px-10 py-8`
- Attribution: `text-white/70 font-sans text-sm mt-4`
- Used in: Feed page between post grids, Single post page mid-article

### Initials Avatar
- Circle: `w-9 h-9 rounded-full flex items-center justify-center`
- Background: generated from name (rotate through a set of muted colors)
- Text: `text-white font-sans text-sm font-semibold`
- Used in: Admin table, comment section

### Role Badge
- `border border-border rounded-full px-3 py-0.5 font-sans text-xs`
- `user` → default border + text-primary
- `admin` → `border-accent text-accent`

### Comment Card
- No card border — separated by spacing only
- Author row: avatar (small, 32px) + name + timestamp
- Body: `font-sans text-sm leading-relaxed`
- Reply link: `text-accent text-xs font-sans`
- Nested reply: `ml-10 border-l-2 border-border pl-4`

---

## Page Layouts

### Auth pages (Login / Register)
- Background: `bg-surface`
- Centered card: `bg-white border border-border p-10 max-w-md mx-auto mt-24`
- Brand name + tagline at top of card
- Form below

### Feed page
- Navbar (full width)
- Hero featured post (latest post, full width section)
- Pull quote block (hardcoded brand statement)
- 3-column post grid
- Pagination
- Footer

### Single post page
- Navbar
- Full-width banner image (if exists)
- Reading column centered: title → author row → body → like button → comments
- Footer

### Create / Edit post page
- Navbar (with Publish button replacing auth buttons)
- Centered form: banner URL → title → content textarea
- No sidebar, no distractions

### Admin page
- Fixed left sidebar (`w-56`): logo, nav items, Write New Post CTA, Log Out
- Main panel: page title, user count, table with pagination

---

## Design Decisions & Why

**Why serif for editorial content?**
Serif fonts carry connotations of print, literature, and considered writing. Every major reading-first platform (Medium, Substack, The Atlantic) uses a serif for body text. It signals that the content is worth reading slowly.

**Why dark teal and not a brighter accent?**
Bright accent colors (electric blue, vivid purple) work well on dark backgrounds or product SaaS UIs. On a light, warm editorial layout they feel jarring. Dark teal is assertive without being loud — it fits the "sanctuary" tone of the brand.

**Why 672px reading width?**
This is the typographic sweet spot for comfortable reading at 16px font size — approximately 65-75 characters per line. Medium uses 680px. Going wider causes eye fatigue. Going narrower feels cramped.

**Why border-driven layout instead of shadows?**
Heavy shadows create a sense of elevation and hierarchy suited to dashboards and apps. For an editorial reading experience, flat borders keep focus on the content, not the UI chrome.

**Why Stitch for design reference?**
Stitch generates high-fidelity layouts quickly from natural language prompts. Rather than designing from scratch in Figma, we used Stitch to establish the visual language and then coded from those references. Faster iteration, still fully custom in implementation.
