# Z-Tales — Contributing

Setup, conventions, and ground rules for working on this project.

---

## Local Setup

### Prerequisites

- Node.js 20+
- A running PostgreSQL database (local or Supabase)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secret_here
RESEND_API_KEY=re_xxxx
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev   # starts Express on port 5000 via tsx watch
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (optional — Vite proxy handles `/api` in dev):

```
VITE_API_URL=   # leave blank for dev, set to Render URL in prod
```

```bash
npm run dev   # starts Vite on port 5173
```

Both must run at the same time. The Vite proxy forwards all `/api/*` requests to `http://localhost:5000`.

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — deploys to Vercel + Render automatically |
| `dev` | Active development — merge here first |

Never commit directly to `main`. Open a PR from `dev` (or a feature branch off `dev`) and merge when ready.

---

## Commit Conventions

Use the conventional commit format:

```
type: short description in lowercase
```

| Type | When |
|---|---|
| `feat` | New user-visible feature |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `style` | CSS / design changes |
| `chore` | Config, deps, scripts |
| `docs` | Documentation only |

Examples:

```
feat: add inline comment edit with auto-growing textarea
fix: clear orphaned replies from local state on parent delete
refactor: replace hardcoded login paths with ROUTES constant
style: fix btn-danger-solid alignment to inline-flex
```

---

## Design System

All colors, fonts, spacing, and component patterns are documented in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

The short version:

- **Do not** hardcode color hex values or font names in components — use CSS variables and `@utility` classes
- **Do not** use inline `style={{}}` for values that belong to the design system
- All tokens live in `frontend/src/index.css` inside `@theme {}` and `@utility {}` blocks (Tailwind v4)
- When in doubt about a visual decision, check DESIGN_SYSTEM.md before inventing something new

---

## API Conventions

- All routes are RESTful
- Auth routes: `POST /auth/...`
- Post routes: `/posts/:id/...`
- Admin routes: `/admin/...` — require `protect` + `restrictTo("admin")` middleware
- Validation with Zod on all request bodies
- Error responses always return `{ message: string }`
- Ownership checks live in controllers, not middleware (role alone is not enough for author-vs-admin logic)

---

## TypeScript

- `tsc -b` must pass before merging (uses `tsconfig.app.json`, stricter than `--noEmit`)
- No `any` unless truly unavoidable and commented
- Extend Express's `Request` interface via `AuthRequest` — do not assign to `req.user` without the type
- All new API modules go in `frontend/src/api/` and use `apiClient` from `client.ts`

---

## Tests

There are no automated tests yet. Before merging:

1. Manually verify the golden path for any feature you changed
2. Run `tsc -b && vite build` in `frontend/` — build must be clean
3. Check mobile at 375px width in browser devtools

---

*This project is a solo learning build. "Contributing" mostly means future-me coming back to it.*
