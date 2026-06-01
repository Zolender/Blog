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

#### Password Reset Tokens
**Attributes:**
- id
- user_id (FK → users, CASCADE DELETE)
- token (unique)
- expires_at
- created_at

#### Password Reset Tokens
**Attributes:**
- id
- user_id (FK → users, CASCADE DELETE)
- token (unique)
- expires_at
- created_at

---

## 2. The API Contract (RESTful Architecture)

### Auth Routes
- [x] POST `/auth/register` - Create new account (default role: "user")
- [x] POST `/auth/login` - Authenticate and return JWT (include role in payload)
- [x] GET `/auth/me` - Return current user from token (Protected)
- [x] POST `/auth/forgot-password` - Send reset token via email (Resend)
- [x] POST `/auth/reset-password` - Validate token and update password
- [ ] PUT `/auth/me` - Update own profile (bio, profile_pic URL) (Protected)

### Post Routes
- [x] GET `/posts` - Fetch all posts (paginated)
- [x] GET `/posts/:id` - Fetch single post with author details, threaded comments, and `is_liked`
- [x] GET `/posts/:id` - Fetch single post with author details, threaded comments, and `is_liked`
- [x] POST `/posts` - Create post (Protected: Authenticated users)
- [x] PUT `/posts/:id` - Edit post (Protected: Author or Admin)
- [x] DELETE `/posts/:id` - Remove post (Protected: Author or Admin)

### Engagement Routes
- [x] POST `/posts/:id/comments` - Add comment or reply (Authenticated users)
- [x] DELETE `/posts/:id/comments/:commentId` - Delete comment (Author or Admin)
- [ ] PUT `/posts/:id/comments/:commentId` - Edit comment (Author only)
- [x] POST `/posts/:id/like` - Toggle like status (Authenticated users)

### User Routes
- [ ] GET `/users/:username` - Fetch public profile + posts by author (paginated)

### Upload Routes
- [ ] POST `/upload/avatar` - Upload avatar to Supabase Storage, return public URL (Protected)

### Admin Routes
- [x] GET `/admin/users` - Fetch all users (Admin only)
- [x] DELETE `/admin/users/:id` - Remove user (Admin only)
- [x] PUT `/admin/users/:id/role` - Update user role (Admin only)
- [ ] GET `/admin/posts` - Fetch all posts with author info (Admin only)
- [ ] DELETE `/admin/posts/:id` - Delete any post (Admin only)

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
- [x] Add tiered rate limiting — strict on auth mutations, relaxed on /auth/me, general on posts/admin
- [x] Add tiered rate limiting — strict on auth mutations, relaxed on /auth/me, general on posts/admin
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
- [x] Build Login and Register pages (merged into AuthPage with tab toggle)
- [x] Build Login and Register pages (merged into AuthPage with tab toggle)
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
- [x] Build `PostCard` (`APostCard`) with skeleton, avatar, read time, engagement row
- [x] Build `PostCard` (`APostCard`) with skeleton, avatar, read time, engagement row
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
- [x] Build 404 page — styled, with document.title
- [x] Add `document.title` to all routes (Feed, Auth, Write, Edit, Post, Admin, 404, Forgot, Reset)
- [x] Add Open Graph + Twitter Card meta tags to Single Post page (`src/utils/meta.ts`)
- [x] Build 404 page — styled, with document.title
- [x] Add `document.title` to all routes (Feed, Auth, Write, Edit, Post, Admin, 404, Forgot, Reset)
- [x] Add Open Graph + Twitter Card meta tags to Single Post page (`src/utils/meta.ts`)
- [x] Add `stripMarkdown` helper — clean excerpts in Feed hero and PostCard
- [x] Fix `liked` state — `GET /posts/:id` uses `optionalProtect` middleware, returns `is_liked` per user
- [x] Add React Error Boundary — wraps `<Outlet>` in RootLayout, Navbar always accessible
- [x] Draft autosave — localStorage, 30s interval, `draftKey` prop, cleared on successful publish
- [x] Mobile responsive audit — all pages verified at 375px
- [x] Refactor Admin page — replace native `<select>` with `RoleToggle` pill component
- [x] Replace `btn-danger` text link with `btn-danger-solid` button in Admin actions
- [x] Fix hydration warning — split `SkeletonAdminRow` into `SkeletonAdminCard` + `SkeletonAdminTableRow`
- [x] Fix 429 rate limit errors — tiered limiters, `/auth/me` gets relaxed limit (200/15min)
- [x] Fix `liked` state — `GET /posts/:id` uses `optionalProtect` middleware, returns `is_liked` per user
- [x] Add React Error Boundary — wraps `<Outlet>` in RootLayout, Navbar always accessible
- [x] Draft autosave — localStorage, 30s interval, `draftKey` prop, cleared on successful publish
- [x] Mobile responsive audit — all pages verified at 375px
- [x] Refactor Admin page — replace native `<select>` with `RoleToggle` pill component
- [x] Replace `btn-danger` text link with `btn-danger-solid` button in Admin actions
- [x] Fix hydration warning — split `SkeletonAdminRow` into `SkeletonAdminCard` + `SkeletonAdminTableRow`
- [x] Fix 429 rate limit errors — tiered limiters, `/auth/me` gets relaxed limit (200/15min)

### Phase 8: Session 1 — "Feels Finished" ✅ COMPLETE
### Phase 8: Session 1 — "Feels Finished" ✅ COMPLETE
Goals: remove every trust-breaker. A stranger can use the app without hitting anything broken or missing.

- [x] `liked` / `is_liked` — GET `/posts/:id` returns whether current user liked the post
- [x] `stripMarkdown` helper — excerpts in Feed + PostCard show clean plain text
- [x] `document.title` on all routes
- [x] React Error Boundary
- [x] 404 page
- [x] Draft autosave (localStorage, PostForm, `draftKey` prop)
- [x] Password reset flow — `ForgotPasswordPage`, `ResetPasswordPage`, Resend email, DB token table
- [x] Fix 429 errors — tiered rate limiting strategy
- [x] Draft autosave (localStorage, PostForm, `draftKey` prop)
- [x] Password reset flow — `ForgotPasswordPage`, `ResetPasswordPage`, Resend email, DB token table
- [x] Fix 429 errors — tiered rate limiting strategy

### Phase 9: Session 2 — "Has Depth"
Goals: give users reasons to stay and come back.

- [ ] Profile pages — `GET /users/:username`, public author page with bio + posts
- [ ] Search — title + content `ILIKE` query, search input in Navbar or Feed
- [ ] Edit comment — PUT endpoint + inline edit UI in CommentItem
- [ ] Tags / categories — fixed tag set, filter feed by tag
- [ ] Admin post management — list and delete any post from Admin Dashboard

### Phase 10: Design Audit & Quality Pass ✅ COMPLETE
Goals: fix every visual and accessibility issue before adding new features.

- [x] Muted color contrast — `--color-muted` `#888` → `#666` (WCAG AA: 3.78:1 → 4.65:1 on `#FAFAFA`)
- [x] Focus-visible rings — accent outline on `btn-primary`, `btn-ghost`, `nav-link`, `input-field`
- [x] `btn-primary` display — `inline-block` → `inline-flex` with `align-items: center` (icon alignment fix)
- [x] Prose code blocks — dark surface `#1c1c1c` + light text to visually distinguish from blockquotes
- [x] Mobile nav panel gap — `top-20` → `top-16` so panel aligns flush with navbar bottom
- [x] Hero post engagement — like count and comment count added to `FeedPage` hero card

### Phase 11: Interaction Bug Fixes
Goals: correct every silent failure and race condition a user could hit.

- [ ] Like button request lock — `useRef` flag prevents duplicate API calls on rapid double-click
- [ ] Orphaned replies — when a parent comment is deleted, also remove its children from local state
- [ ] Banner image clear — fix backend `COALESCE` bug that prevents nulling `banner_image` after it's been set
- [ ] Comment count mismatch — feed SQL counts all comments; `PostPage` header counts only top-level; align both
- [ ] Type coercion — coerce `like_count` and `comment_count` from string to number in the posts API layer, not at every callsite

### Phase 12: Editor Polish
Goals: make the writing experience feel deliberate and professional.

- [ ] Toolbar active state — background highlight on click, clears after 500ms (visual feedback without persistence)
- [ ] Cursor placement — after injecting syntax, select the placeholder text so the user types over it immediately
- [ ] Auto-growing textarea — expand height dynamically with content (`scrollHeight` on every content change)
- [ ] Debounced autosave — save 1–2s after the user stops typing; keep the 30s interval as a fallback
- [ ] Discard draft — add an "Undo" action button to the draft-restored toast so the user can start clean

### Phase 13: App Loading & Motion Polish
Goals: first impressions and motion consistency across the whole app.

- [x] App loading skeleton — replace bare `"Loading..."` text in `App.tsx` with a navbar bar + content pulse skeleton
- [x] Cold-start UX — show `"Waking up the server..."` message if the first API request takes longer than 3 seconds (Render free tier sleeps)
- [x] `prefers-reduced-motion` — use Framer Motion's `useReducedMotion()` hook; disable or reduce transitions for users who have it enabled in their OS
- [x] WriterLayout entrance animation — moved to PostForm root `motion.div` (WriterLayout is now a pure structural wrapper)
- [x] EditPostPage loading state — replace bare text with `SkeletonEditor` component matching the writer layout
- [ ] Route-aware app skeleton — `App.tsx` `isLoading` skeleton currently shows a feed layout even when the user is navigating directly to `/posts/new` or `/posts/:id/edit`; detect route and show the appropriate skeleton

### Phase 14: Feed & Content Fixes
Goals: fix content correctness issues visible to every reader.

- [ ] `stripMarkdown` fenced blocks — current regex misses multi-line ` ``` ` blocks; extend it to strip them
- [ ] Excerpt ellipsis — check stripped text length, not raw `content.length`, before appending `...`
- [ ] Pagination ellipsis — replace full page-number list with `1 … 4 5 6 … 20` pattern for large page counts
- [ ] Page change skeleton — show skeleton only on the grid during pagination; keep the hero card visible
- [ ] `PullQuote` dynamic — pull the quote from the featured post excerpt instead of a static hardcoded string

### Phase 15: Profile & Identity
Goals: every username on the site becomes a link to a real page; users have an identity.

**Backend:**
- [ ] `GET /users/:username` — return user info + their posts paginated
- [ ] `PUT /auth/me` — update `bio` and `profile_pic` URL (Protected)
- [ ] Add `updated_at` column to `posts` table; return in API responses

**Frontend:**
- [ ] `/users/:username` route + `ProfilePage` — bio, post count, join date, post grid
- [ ] `/settings` route + `SettingsPage` — edit bio, profile pic URL input, change password form
- [ ] Clickable author usernames — `FeedPage` hero, `APostCard`, `PostPage`, `CommentItem` all link to `/users/:username`
- [ ] Settings link in Navbar — visible to logged-in users next to the logout button
- [ ] `"Edited"` badge on `PostPage` — show `updated_at` timestamp when a post has been modified

**Profile page dual-view (own vs. visitor):**
- [ ] Detect own profile: compare `currentUser?.username === username` from Redux auth state
- [ ] Own profile view: "Edit profile" button in header linking to `/settings`; personalized empty state with a "Write your first post →" CTA linking to `/posts/new`
- [ ] Visitor profile view: clean read-only — no edit or write actions exposed
- [ ] Enhanced profile header: larger avatar (`w-20 h-20`), surface-bg card with border, stats row (post count + join date) styled as `meta-text`
- [ ] Updated loading skeleton to match the enhanced header layout (larger circle + wider lines)

### Phase 16: Avatar File Upload
Goals: let users upload an actual image instead of pasting a URL.

- [ ] Supabase Storage — create `avatars` bucket, configure public read policy
- [ ] `POST /upload/avatar` — backend generates a signed upload URL or proxies the upload directly
- [ ] `SettingsPage` — replace profile pic URL input with a file picker; upload to Supabase Storage on select; save returned public URL

### Phase 17: Auth & Security Hardening
Goals: close the gaps before the project is fully "done".

- [ ] Auth URL sync — push `/login` or `/register` to browser history when switching tabs in `AuthPage` so the URL stays in sync with the active tab
- [ ] Auth route constant — replace all hardcoded `"/login"` strings in `navigate()` and `<Link to>` with a single shared constant
- [ ] `beforeunload` guard — warn before tab close if `PostForm` content has changed since the last autosave
- [ ] JWT expiry — verify `signToken` sets `expiresIn`; add `"7d"` if missing
- [ ] Expired token cleanup — `DELETE FROM password_reset_tokens WHERE expires_at < NOW()` on every reset use
- [ ] OG image fallback — use a default site image in `setPostMeta` when `post.banner_image` is null
- [ ] Image CLS — add `width` and `height` attributes to all `<img>` elements to prevent layout shift on load

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
│   ├── api/            ← HTTP call modules (auth, posts, admin)
│   ├── api/            ← HTTP call modules (auth, posts, admin)
│   ├── app/            ← Redux store and typed hooks
│   ├── components/     ← Reusable UI (Navbar, PostCard, SkeletonCard, SkeletonPost,
│   │                      SkeletonAdminCard, SkeletonAdminTableRow, ConfirmModal,
│   │                      Toast, ErrorBoundary, FloatingInput, CommentItem...)
│   ├── components/     ← Reusable UI (Navbar, PostCard, SkeletonCard, SkeletonPost,
│   │                      SkeletonAdminCard, SkeletonAdminTableRow, ConfirmModal,
│   │                      Toast, ErrorBoundary, FloatingInput, CommentItem...)
│   ├── features/       ← Redux slices (auth)
│   ├── layouts/        ← RootLayout, WriterLayout
│   ├── pages/          ← FeedPage, PostPage, AuthPage, NewPostPage, EditPostPage,
│   │                      AdminPage, NotFoundPage, ForgotPasswordPage, ResetPasswordPage
│   ├── pages/          ← FeedPage, PostPage, AuthPage, NewPostPage, EditPostPage,
│   │                      AdminPage, NotFoundPage, ForgotPasswordPage, ResetPasswordPage
│   ├── types/          ← Shared TypeScript interfaces
│   ├── utils/          ← formatting.tsx (helpers + stripMarkdown), meta.ts (OG tags)
│   ├── utils/          ← formatting.tsx (helpers + stripMarkdown), meta.ts (OG tags)
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
- Draft autosave — localStorage, 30s interval, cleared on publish, restored with toast on mount
- Error boundaries — graceful fallback on component crashes, Navbar always accessible
- Password reset — time-limited token, Resend email, "check your inbox" confirmation state

- Draft autosave — localStorage, 30s interval, cleared on publish, restored with toast on mount
- Error boundaries — graceful fallback on component crashes, Navbar always accessible
- Password reset — time-limited token, Resend email, "check your inbox" confirmation state
