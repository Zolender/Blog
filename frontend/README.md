# Z-Tales — Frontend

The React frontend for Z-Tales. Built with Vite, TypeScript, Tailwind CSS v4, Redux Toolkit, and Framer Motion.

---

## Stack

- **React 19** + TypeScript
- **React Router v7** — client-side routing
- **Redux Toolkit** — global auth state
- **Tailwind CSS v4** — utility-first styling with custom design system tokens
- **Framer Motion** — page transitions and micro-interactions
- **Lucide React** — icons
- **Vite** — dev server and build tool

---

## Getting Started

```bash
npm install
npm run dev

```

Requires the backend to be running at `localhost:5000`.
The Vite proxy forwards all `/api/*` requests automatically in development.

---

## Design System

Colors, fonts, spacing, and component patterns all live in two places:

- `src/index.css` — Tailwind v4 `@theme` tokens and `@utility` class definitions
- `DESIGN_SYSTEM.md` (root) — full documentation of every visual decision

Do not hardcode colors or font values in components. Use the utilities.

---

## Key Directories

```
src/
├── api/          # HTTP calls — auth.ts, posts.ts, admin.ts
├── app/          # Redux store, typed hooks
├── components/   # Reusable UI — Navbar, PostCard, FloatingInput...
├── features/     # Redux slices — authSlice
├── layouts/      # RootLayout (Navbar + Outlet + Footer)
├── pages/        # Page components — FeedPage, PostPage, AuthPage...
├── types/        # Shared TypeScript interfaces
├── utils/        # formatting.ts — getAvatarColor, getReadTime, formatDate
├── App.tsx       # Route tree
└── main.tsx      # Entry point, Redux Provider
```