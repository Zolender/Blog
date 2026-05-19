# Contributing to Z-Tales

This document covers how to work on this project — branch rules, commit conventions, and local setup.

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production. Only updated when a feature is complete and stable. Never commit directly to main. |
| `dev` | Active development. All work happens here. This is the default working branch. |

### Workflow

```bash
# Always make sure you are on dev before starting work
git checkout dev
git pull origin dev

# Do your work, then commit
git add .
git commit -m "type: short description"
git push origin dev

# When a feature is complete and tested, merge dev into main
git checkout main
git merge dev
git push origin main
git checkout dev
```

---

## Commit Message Convention

Format: `type: short description`

| Type | When to use |
|---|---|
| `feat` | Adding a new feature or page |
| `fix` | Fixing a bug |
| `style` | UI/CSS changes, no logic change |
| `refactor` | Code restructure, no behavior change |
| `docs` | Documentation changes only |
| `chore` | Config, dependencies, tooling |




## Local Setup

### Prerequisites
- Node.js v20+
- PostgreSQL (local) or a Supabase project

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/ztales
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
```

```bash
npm run dev
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:

```env
VITE_API_URL=
```

```bash
npm run dev
# Runs on http://localhost:5173 mostly, but it really depends on whether you are running other softwares locally or not...
```

Both processes must be running simultaneously. Use two terminals.

---

## Environment Variables

Never commit `.env` files. They are in `.gitignore`.

| Variable | Where | What it is |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `JWT_SECRET` | backend | Secret for signing JWTs |
| `NODE_ENV` | backend | `development` or `production` |
| `PORT` | backend | Server port (default 5000) |
| `VITE_API_URL` | frontend | Backend base URL (empty in dev, Render URL in prod) |

---

## Project Structure

```
Blog/
├── backend/
│   ├── src/
│   │   ├── config/       # Database pool
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, error, rate limit
│   │   ├── routes/       # Express routers
│   │   ├── schemas/      # Zod validation schemas
│   │   └── index.ts      # App entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/          # API client and endpoint modules
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store and slices
│   │   └── main.tsx      # App entry point
│   └── package.json
├── DESIGN_SYSTEM.md
├── CONTRIBUTING.md
├── lectures.md
├── Plan.md
└── README.md
```
