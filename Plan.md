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
- role (enum: "user", "admin") ← RBAC

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
- content
- created_at

**Relationships:**
- Belongs to → Post
- Belongs to → User

#### Likes
**Attributes:**
- user_id
- post_id

**Relationships:**
- Links User ↔ Post (Composite Primary Key)

---

## 2. The API Contract (RESTful Architecture)

These are the routes to be built in Node.js.

### Auth Routes
- [ ] POST `/auth/register` - Create new account (default role: "user")
- [ ] POST `/auth/login` - Authenticate and return JWT (include role in payload)

### Post Routes
- [ ] GET `/posts` - Fetch all posts
- [ ] GET `/posts/:id` - Fetch single post with author details
- [ ] POST `/posts` - Create post (Protected: Authenticated users)
- [ ] PUT `/posts/:id` - Edit post (Protected: Author or Admin)
- [ ] DELETE `/posts/:id` - Remove post (Protected: Author or Admin)

### Engagement Routes
- [ ] POST `/posts/:id/comments` - Add comment (Authenticated users)
- [ ] POST `/posts/:id/like` - Toggle like status (Authenticated users)

### Admin Routes
- [ ] GET `/admin/users` - Fetch all users (Admin only)
- [ ] DELETE `/admin/users/:id` - Remove user (Admin only)
- [ ] PUT `/admin/users/:id/role` - Update user role (Admin only)

---

## 3. RBAC (Role-Based Access Control)

### Roles
- **User**
  - Create, edit, and delete own posts
  - Comment and like posts

- **Admin**
  - Full access to all posts and comments
  - Manage users (delete, update roles)

### Backend Enforcement
- [ ] Extend JWT payload to include `role`
- [ ] Create `roleMiddleware(allowedRoles: string[])`
- [ ] Apply middleware to protected routes (Admin-only where required)

---

## 4. Execution Roadmap (The Checklist)

### Phase 1: Environment & Infrastructure
- [ ] Set up TypeScript configuration (`tsconfig.json`)
- [ ] Configure `.env` for local and production variables
- [ ] Create Database Pool connection in `src/config/db.ts`
- [ ] Establish global error-handling middleware

### Phase 2: Authentication Engine (The Gatekeeper)
- [ ] Implement `bcryptjs` for password hashing
- [ ] Create JWT utility (include role in token)
- [ ] Build `authMiddleware.ts` (verify token)
- [ ] Build `roleMiddleware.ts` (RBAC enforcement)
- [ ] Implement Register and Login controllers

### Phase 3: Core Features (The CRUD)
- [ ] Build Post controllers and routes
- [ ] Implement SQL JOINs to fetch author data with posts
- [ ] Add RBAC checks (Author vs Admin logic)
- [ ] Build Comment system with foreign key integrity
- [ ] Implement "Like" logic with prevention of duplicate likes

### Phase 4: Frontend Development (React + RTK)
- [ ] Initialize React with Vite and Tailwind CSS
- [ ] Install and configure Lucide React for icons
- [ ] Set up React Router v7 (Data APIs and Layouts)
- [ ] Configure Redux Toolkit `authSlice` (store user + role)
- [ ] Implement protected routes based on role
- [ ] Build Admin Dashboard UI (user management)
- [ ] Implement Framer Motion for transitions and micro-interactions

### Phase 5: Deployment & Optimization
- [ ] Optimize PostgreSQL queries with indexes
- [ ] Deploy Backend to a cloud provider (e.g., Render)
- [ ] Deploy Frontend to Vercel or Netlify

---

## 5. State Management Strategy (Redux Toolkit)

### Auth Slice
**State:**
- currentUser
- token
- role

**Actions:**
- login
- logout
- setCredentials

### Usage
- Persist authentication state
- Conditionally render UI based on role:
  - Admin → Dashboard, user controls
  - User → Standard blog features

---

## 6. UI Enhancements

### Icons (Lucide React)
- Use consistent icon set across the app
- Suggested usage:
  - Navbar (Home, Profile, Admin)
  - Buttons (Edit, Delete, Like)
  - Alerts and notifications

### UX Considerations
- Show/hide actions based on role
- Provide clear feedback for unauthorized actions