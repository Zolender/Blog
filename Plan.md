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

### Post Routes
- [x] GET `/posts` - Fetch all posts (paginated)
- [x] GET `/posts/:id` - Fetch single post with author details and threaded comments
- [x] POST `/posts` - Create post (Protected: Authenticated users)
- [x] PUT `/posts/:id` - Edit post (Protected: Author or Admin)
- [x] DELETE `/posts/:id` - Remove post (Protected: Author or Admin)

### Engagement Routes
- [x] POST `/posts/:id/comments` - Add comment or reply (Authenticated users)
- [x] DELETE `/posts/:id/comments/:commentId` - Delete comment (Author or Admin)
- [x] POST `/posts/:id/like` - Toggle like status (Authenticated users)

### Admin Routes
- [x] GET `/admin/users` - Fetch all users (Admin only)
- [x] DELETE `/admin/users/:id` - Remove user (Admin only)
- [x] PUT `/admin/users/:id/role` - Update user role (Admin only)

---

## 3. RBAC (Role-Based Access Control)

### Roles
- **User**
  - Create, edit, and delete own posts
  - Add and delete own comments and replies
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
- [ ] Initialize React with Vite and Tailwind CSS
- [ ] Install and configure Lucide React for icons
- [ ] Set up React Router v7 (layouts and protected routes)
- [ ] Configure Redux Toolkit `authSlice` (store user + role)
- [ ] Call `GET /auth/me` on app load to rehydrate session
- [ ] Implement protected routes based on role
- [ ] Build global post feed with pagination controls
- [ ] Build single post page with threaded comments
- [ ] Build create/edit post forms
- [ ] Build Admin Dashboard (user management)
- [ ] Implement Framer Motion for transitions and micro-interactions

### Phase 6: Deployment
- [ ] Migrate database to Supabase
- [ ] Update environment variables for production
- [ ] Deploy Backend to Render
- [ ] Deploy Frontend to Vercel

---

## 5. State Management Strategy (Redux Toolkit)

### Auth Slice
**State:**
- currentUser
- token
- role
- isLoading (for the initial GET /auth/me call on refresh)

**Actions:**
- setCredentials (login or register success)
- logout
- setLoading

### Usage
- On app load: read token from localStorage, call GET /auth/me, dispatch setCredentials
- On 401 response anywhere in the app: dispatch logout, redirect to login
- Conditionally render UI based on role:
  - Admin → Dashboard, user management controls
  - User → Standard blog features
  - Guest → Read-only feed, login/register prompts

---

## 6. Frontend Architecture Notes

### API Layer
All HTTP calls will be centralized in a dedicated `src/api/` folder rather than
scattered across components. Each feature has its own file:
- `src/api/auth.ts`
- `src/api/posts.ts`
- `src/api/admin.ts`

### Folder Structure (planned)
```
frontend/
├── src/
│   ├── api/
│   ├── app/          <- Redux store setup
│   ├── components/   <- Reusable UI components
│   ├── features/     <- Redux slices (auth, posts)
│   ├── layouts/      <- Route layouts
│   ├── pages/        <- Page-level components
│   ├── types/        <- Shared TypeScript types
│   └── main.tsx
```

---

## 7. UI Enhancements

### Icons (Lucide React)
- Navbar (Home, Profile, Admin panel)
- Buttons (Edit, Delete, Like, Reply)
- Alerts and notifications
- Empty states

### UX Considerations
- Show/hide actions based on role and ownership
- Optimistic UI for likes (update count instantly, reconcile with server)
- Thread replies visually indented under their parent comment
- Skeleton loaders during data fetching
- Clear feedback for unauthorized actions