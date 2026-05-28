# The Master Plan: Project Z-Tales

This plan is structured into three main modules:
- Technical Architecture
- Phase-by-Phase Roadmap
- State Management Strategy

---

## 1. The Database & Relationship Model (The Foundation)

Before writing a single query, we must define how our data lives together.

### Entities

#### Users
**Attributes:**
- id
- username
- email
- password_hash
- bio
- profile_pic
- role (enum: "user", "admin") — RBAC

**Relationships:**
- One-to-Many → Posts
- One-to-Many → Comments

#### Posts
**Attributes:**
- id
- author_id
- title
- content
- banner_image
- created_at

**Relationships:**
- Belongs to → User
- One-to-Many → Comments
- Many-to-Many → Likes

#### Comments
**Attributes:**
- id
- post_id
- author_id
- parent_id (nullable — self-referencing for replies)
- content
- created_at

**Relationships:**
- Belongs to → Post
- Belongs to → User
- One-to-Many → Comments (self-referencing for reply threads)

#### Likes
**Attributes:**
- user_id
- post_id

**Relationships:**
- Links User <-> Post (Composite Primary Key)

---

## 2. The API Contract (RESTful Architecture)

### Auth Routes
- [x] POST `/auth/register` - Create new account (default role: "user")
- [x] POST `/auth/login` - Authenticate and return JWT (include role in payload)
- [x] GET `/auth/me` - Return current user from token (Protected)
- [ ] POST `/auth/forgot-password` - Send reset token via email
- [ ] POST `/auth/reset-password` - Validate token and update password

### Post Routes
- [x] GET `/posts` - Fetch all posts (paginated)
- [x] GET `/posts/:id` - Fetch single post with author details and threaded comments
- [x] POST `/posts` - Create post (Protected: Authenticated users)
- [x] PUT `/posts/:id` - Edit post (Protected: Author or Admin)
- [x] DELETE `/posts/:id` - Remove post (Protected: Author or Admin)

### Engagement Routes
- [x] POST `/posts/:id/comments` - Add comment or reply (Authenticated users)
- [x] DELETE `/posts/:id/comments/:commentId` - Delete comment (Author or Admin)
- [ ] PUT `/posts/:id/comments/:commentId` - Edit comment (Author only)
- [x] POST `/posts/:id/like` - Toggle like status (Authenticated users)

### User Routes
- [ ] GET `/users/:username` - Fetch public profile + posts by author

### Admin Routes
- [x] GET `/admin/users` - Fetch all users (Admin only)
- [x] DELETE `/admin/users/:id` - Remove user (Admin only)
- [x] PUT `/admin/users/:id/role` - Update user role (Admin only)

---

## 3. RBAC (Role-Based Access Control)

### Roles
- **User**
  - Create, edit, and delete own posts
  - Add, edit, and delete own comments and replies
  - Like and unlike posts

- **Admin**
  - Full access to all posts and comments
  - Manage users (delete, update roles)
  - Cannot delete or demote their own account

### Backend Enforcement
- [x] Extend JWT payload to include `role`
- [x] Create `roleMiddleware(allowedRoles: string[])`
- [x] Apply middleware to protected routes (Admin-only where required)
- [x] Ownership checks inside controllers where role alone is insufficient

### Frontend Enforcement
- [x] ProtectedRoute component — redirects to /login if not authenticated
- [x] GuestRoute component — redirects to / if already authenticated
- [x] adminOnly prop on ProtectedRoute — redirects to / if not admin
- [x] Conditionally render edit/delete buttons based on ownership and role

---

## 4. Execution Roadmap (The Checklist)

### Phase 1: Environment & Infrastructure
- [x] Set up TypeScript configuration (`tsconfig.json`)
- [x] Configure environment variables via Node's native `--env-file` flag
- [x] Create Database Pool connection in `src/config/db.ts`
- [x] Establish global error-handling middleware

### Phase 2: Authentication Engine (The Gatekeeper)
- [x] Implement `bcryptjs` for password hashing
- [x] Create JWT utility (include role in token)
- [x] Build `authMiddleware.ts` (verify token)
- [x] Build `roleMiddleware.ts` (RBAC enforcement)
- [x] Implement Register and Login controllers
- [x] Implement GET /auth/me (session rehydration on refresh)

### Phase 3: Core Features (The CRUD)
- [x] Build Post controllers and routes
- [x] Implement SQL JOINs to fetch author data with posts
- [x] Add RBAC checks (Author vs Admin logic)
- [x] Build Comment system with reply support (self-referencing parent_id)
- [x] Implement comment deletion (Author or Admin)
- [x] Implement Like toggle with duplicate prevention
- [x] Build Admin routes (user management, role updates)

### Phase 4: Hardening
- [x] Add rate limiting to auth routes (`express-rate-limit`)
- [x] Add security headers (`helmet`)
- [x] Add pagination to `GET /posts`
- [x] Add database indexes on foreign key columns
- [x] Add `GET /auth/me` route

### Phase 5: Frontend Development (React + RTK)
- [x] Initialize React with Vite and Tailwind CSS v4
- [x] Install Lucide React, Framer Motion, Redux Toolkit, React Router v7
- [x] Configure Vite proxy (forward /api requests to backend)
- [x] Define shared TypeScript types (`src/types/index.ts`)
- [x] Build centralized API client (`src/api/client.ts`)
- [x] Build API modules — auth, posts, admin (`src/api/`)
- [x] Configure Redux store and typed hooks (`src/app/`)
- [x] Build authSlice with rehydrateAuth async thunk
- [x] Wire Redux Provider and session rehydration in main.tsx and App.tsx
- [x] Build RootLayout with Navbar and Outlet
- [x] Build ProtectedRoute and GuestRoute components
- [x] Set up full React Router v7 route tree in App.tsx
- [x] Build Login and Register pages
- [x] Build Feed page with pagination
- [x] Build single Post page with threaded comments
- [x] Build Create and Edit post forms
- [x] Build Admin Dashboard

### Phase 6: Deployment
- [x] Migrate database to Supabase
- [x] Update environment variables for production
- [x] Deploy Backend to Render
- [x] Deploy Frontend to Vercel
- [x] Fix IPv6 ENETUNREACH error (switched to Supabase connection pooler)
- [x] Fix production API URL (removed /api prefix mismatch)
- [x] Set up dev/main branch strategy

### Phase 7: Design & UX Polish
- [x] Add Lora + Inter fonts via Google Fonts
- [x] Configure design system tokens in `index.css` (`@theme`, `@utility`)
- [x] Apply design system to Navbar — desktop + mobile floating panel
- [x] Apply design system to Footer
- [x] Build `FloatingInput` component (animated label)
- [x] Build `PostCard` with skeleton, avatar, read time, engagement row
- [x] Build `SkeletonCard` and `PullQuote` as standalone components
- [x] Extract shared helpers into `src/utils/formatting.tsx`
- [x] Merge Login and Register into single `AuthPage` with tab toggle
- [x] Apply design system to Feed page — hero, pull quote, grid, pagination
- [x] Apply design system to Create/Edit Post page — writer mode, markdown toolbar, preview toggle
- [x] Install `react-markdown` + `remark-gfm` — markdown rendering in preview and post body
- [x] Build `WriterLayout` — distraction-free layout for write/edit routes
- [x] Add `prose` utility to `index.css` for markdown rendering
- [x] Build `ConfirmModal` component — reusable, mobile-friendly, overlay-dismissible
- [x] Build `Toast` system — `useToast` hook, `ToastProvider`, slide-up animation
- [x] Apply design system to Single Post page — reading layout, markdown body, threaded comments
- [x] Apply design system to Admin page — mobile cards + desktop table, RBAC-safe
- [x] Fix comment crash — `addComment` controller now returns full JOIN'd comment shape
- [x] Add `btn-danger-solid` utility to `index.css`
- [x] Build 404 page
- [x] Add `document.title` to all remaining routes (Feed, Auth, Write, Edit)
- [x] Add Open Graph tags to Single Post page
- [x] Add `stripMarkdown` helper — clean excerpts in Feed hero and PostCard
- [x] Fix `liked` state — backend returns `is_liked` per authenticated user
- [ ] Add React Error Boundary — prevent full-page crashes
- [ ] Draft autosave — localStorage, cleared on successful publish
- [ ] Mobile responsive audit — pass through all pages on 375px

### Phase 8: Session 1 — "Feels Finished" (current focus)
Goals: remove every trust-breaker. A stranger can use the app without hitting anything broken or missing.

- [ ] `liked` / `is_liked` — GET `/posts/:id` returns whether current user liked the post
- [ ] `stripMarkdown` helper — excerpts in Feed + PostCard show clean plain text
- [ ] `document.title` on all routes
- [ ] React Error Boundary
- [ ] 404 page
- [ ] Draft autosave (localStorage, PostForm)
- [ ] Password reset flow (forgot + reset, email via Resend or Nodemailer)

### Phase 9: Session 2 — "Has Depth" (next week)
Goals: give users reasons to stay and come back.

- [ ] Profile pages — `GET /users/:username`, public author page with bio + posts
- [ ] Search — title + content `ILIKE` query, search input in Navbar or Feed
- [ ] Edit comment — PUT endpoint + inline edit UI in CommentItem
- [ ] Tags / categories — fixed tag set, filter feed by tag
- [ ] Admin post management — list and delete any post from Admin Dashboard

---

## 5. State Management Strategy (Redux Toolkit)

### Auth Slice
**State:**
- user (User | null)
- token (string | null)
- isLoading (true until rehydration completes)

**Actions:**
- setCredentials — called after login or register
- logout — clears user, token, and localStorage
- rehydrateAuth (async thunk) — calls GET /auth/me on app load

### Usage
- On app load: read token from localStorage, call GET /auth/me, dispatch result into state
- If GET /auth/me returns 401: clear token, treat as guest
- Conditionally render UI based on role:
  - Admin → Dashboard link visible in Navbar, adminOnly routes accessible
  - User → Write link visible, own post controls visible
  - Guest → Login/Register links visible, feed readable

---

## 6. Frontend Architecture

### API Layer
All HTTP calls go through a single configured client (`src/api/client.ts`).
The client handles the base URL, attaches the Bearer token automatically,
and parses errors uniformly. Feature-specific modules call the client:
- `src/api/auth.ts`
- `src/api/posts.ts`
- `src/api/admin.ts`

### Vite Proxy
In development, all `/api/*` requests are proxied to `http://localhost:5000`.
In production, `VITE_API_URL` is set to the Render backend URL and the client
uses that directly. No component code changes between environments.

### Folder Structure
```
frontend/
├── src/
│   ├── api/            ← HTTP call modules
│   ├── app/            ← Redux store and typed hooks
│   ├── components/     ← Reusable UI (Navbar, PostCard, SkeletonCard, ConfirmModal, Toast, ErrorBoundary...)
│   ├── features/       ← Redux slices (auth)
│   ├── layouts/        ← RootLayout, WriterLayout
│   ├── pages/          ← Page-level components
│   ├── types/          ← Shared TypeScript interfaces
│   ├── utils/          ← Shared helpers (formatting, avatar colors, stripMarkdown)
│   ├── App.tsx         ← Router definition
│   └── main.tsx        ← Entry point, Redux Provider, ToastProvider
```

---

## 7. UI Enhancements

### Icons (Lucide React)
- Navbar: Menu, X, Rss, PenLine, Shield, LogIn, LogOut, UserPlus
- Post page: Heart, MessageCircle, Edit2, Trash2
- Feed page: RefreshCcw
- Write page: ArrowLeft, Eye, Edit2, Bold, Italic, Heading2, Code, Code2, Quote, Minus, List, LinkIcon, Strikethrough, Image

### UX Considerations
- Show/hide actions based on role and ownership
- Optimistic UI for likes (update count instantly, reconcile with server)
- Thread replies visually indented under their parent comment with left border
- Skeleton loaders during data fetching (not spinners)
- Empty states for zero-result screens
- Error states with retry for failed fetches
- Modal confirmation for all destructive actions (no `window.confirm()` or `window.alert()`)
- Toast notifications for post-action feedback (success/failure)
- Framer Motion page transitions and micro-interactions
- Mobile-first responsive — implemented inline per page, not as a separate pass
- Markdown support in post body — written with toolbar, rendered with `react-markdown` + `remark-gfm`
- Draft autosave — localStorage, 30s interval, cleared on publish
- Error boundaries — graceful fallback on component crashes