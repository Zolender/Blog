# Z-Tales

A full-stack blog platform built for writers and readers. Clean architecture, type-safe throughout, deployed and production-ready.

**Live:** [z-tales.vercel.app](https://z-tales.vercel.app) — Frontend  
**API:** [z-tales.onrender.com](https://z-tales.onrender.com) — Backend

> Note: The backend runs on Render's free tier and may take ~30 seconds to wake up on the first request after a period of inactivity.

---

## Tech Stack

### Frontend
- React 19 + TypeScript
- React Router v7
- Redux Toolkit (global auth state)
- Tailwind CSS
- Framer Motion
- Vite

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (Supabase)
- JWT authentication
- Bcrypt password hashing
- Zod schema validation
- Helmet + express-rate-limit

---

## Features

- **Authentication** — Register, login, JWT-based session rehydration on page load
- **Posts** — Create, read, update, delete — with optional banner images
- **Feed** — Paginated post feed with author info, like counts, comment counts
- **Likes** — Toggle like/unlike on any post
- **Comments** — Threaded comments with one level of replies
- **Admin panel** — User management, role assignment, post moderation
- **RBAC** — Role-based access control (user / admin) enforced at the API level

---

## Local Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full setup instructions.

Short version:

```bash
# Backend (terminal 1)
cd backend && npm install && npm run dev

# Frontend (terminal 2)
cd frontend && npm install && npm run dev
```

---

## Project Docs

| File | What it covers |
|---|---|
| [Plan.md](./Plan.md) | Phase-by-phase build plan and progress |
| [lectures.md](./lectures.md) | Concepts, decisions, and hard lessons from building this |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Colors, typography, spacing, components |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Branch rules, commit conventions, local setup |

---

## Architecture

```
Browser (React + Redux)
        │
        │  HTTPS
        ▼
Vercel (Static hosting)
        │
        │  fetch() to Render
        ▼
Render (Express API)
        │
        │  pg Pool over TLS
        ▼
Supabase (PostgreSQL)
```

---

## Database Schema (simplified)

```sql
users       — id, username, email, password_hash, role, created_at
posts       — id, title, content, banner_image, author_id → users
comments    — id, body, post_id → posts, author_id → users, parent_id → comments
likes       — user_id → users, post_id → posts  (composite PK)
```

---

*Built from scratch as a full-stack learning project — every line written and understood.*
