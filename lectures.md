# Z-Tales — Lecture Notes

A running document of concepts, decisions, and hard lessons from building this project.
To be updated at the end of every phase.

---

## Phase 1 — Infrastructure

### The PostgreSQL Connection Pool

A `Pool` manages multiple persistent database connections. The server does not open and close
a connection on every request — that would be expensive. Instead, the pool keeps a set of
connections alive and lends them out as needed.

`pool.on("connect")` fires only when a brand new physical connection is established.
Once the pool has live connections it reuses them silently. This is why the connect log
is not a reliable health signal. An actual query (`SELECT NOW()`) is the correct test.

### Why `ON DELETE CASCADE` matters

When a user is deleted, everything they own — posts, comments, likes — is automatically
removed by the database. Without this, deleting a user would either throw a foreign key
violation error or leave orphaned rows behind. Referential integrity is enforced at the
database level, not the application level. The database is the last line of defense.

### The CHECK constraint and PostgreSQL quoting rules

In PostgreSQL:
- Double quotes `"value"` mean an **identifier** (column name, table name)
- Single quotes `'value'` mean a **string literal**

Writing `CHECK (role IN ("user", "admin"))` tells PostgreSQL to look for columns named
`user` and `admin`, which do not exist. The correct syntax is:

```sql
CHECK (role IN ('user', 'admin'))
```

To add a constraint to an existing table after the fact:

```sql
ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('user', 'admin'));
```

### ESM vs CommonJS — the module system conflict

Node.js supports two module systems. They do not mix cleanly.

- `"type": "module"` in `package.json` means the project uses ESM (`import`/`export`)
- `"type": "commonjs"` means it uses CommonJS (`require`/`module.exports`)

The `tsconfig.json` must match. For an ESM project on a modern TypeScript version:

```json
"module": "NodeNext",
"moduleResolution": "NodeNext"
```

`"moduleResolution": "node"` is the legacy CommonJS resolver. It does not understand ESM
and is deprecated in TypeScript 5+. Using it in an ESM project causes silent resolution
failures.

### Why `.js` extensions are required in ESM imports

```typescript
import pool from "../config/db.js"
```

This looks wrong but is correct. In ESM, Node.js does not automatically resolve file
extensions. You must be explicit. TypeScript compiles `db.ts` to `db.js`, so the import
must reference the compiled output extension. This is a NodeNext requirement.

### `ts-node-dev` and ESM

`ts-node-dev` is effectively abandoned and has broken ESM support. It should not be used
in modern TypeScript/ESM projects. The replacement is `tsx`, which has first-class ESM
support and is actively maintained.

```bash
tsx watch src/index.ts
```

### `dotenv` and the `--env-file` flag

`dotenv.config()` resolves the `.env` path relative to `process.cwd()` — the directory
from which the command was run, not the file that called it. This makes it fragile.

Node.js v20.6+ provides a built-in alternative that loads the file before any code runs:

```json
"dev": "tsx --env-file=.env watch src/index.ts"
```

No import, no config call, no path issues. The variables are available on `process.env`
everywhere in the process from the moment it starts.

---

## Phase 2 — Authentication

### Never store plain text passwords

Passwords are hashed using bcrypt before being written to the database. A hash is
one-directional — you cannot reverse it to recover the original password. On login,
bcrypt compares the incoming password against the stored hash.

The cost factor (salt rounds) controls how expensive the hashing operation is.
A value of 12 is the production standard: slow enough to make brute force attacks
impractical, fast enough that legitimate users do not notice the delay.

### JWT structure and the Gatekeeper pattern

A JSON Web Token has three parts: header, payload, signature. The server signs the
payload with a secret. On every protected request, the server verifies the signature.
If the token was tampered with, verification fails.

The payload in this project carries:
```typescript
{ id: number, username: string, role: "user" | "admin" }
```

This means the server never needs to query the database to know who is making a request
or what their role is. The token is self-contained.

The flow:
1. Client logs in, receives a token
2. Client sends `Authorization: Bearer <token>` on every subsequent request
3. `authMiddleware` verifies the token and stamps `req.user` with the decoded payload
4. Route handlers read `req.user` freely

### Extending Express's Request type

By default, Express does not know what `req.user` is. Adding an arbitrary property
to it would be an unsafe `any` hack. The correct approach is to extend the `Request`
interface:

```typescript
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
```

Route handlers that require authentication use `AuthRequest` as their request type.
This gives full type safety and IntelliSense on `req.user`.

### The 401 vs 403 distinction

- `401 Unauthorized` — the server does not know who you are (no token or invalid token)
- `403 Forbidden` — the server knows who you are but you do not have permission

Using them interchangeably is incorrect and misleading to API consumers.

### Why the same error message for wrong email and wrong password

```typescript
res.status(401).json({ message: "Invalid email or password" });
```

Returning different messages for "email not found" vs "wrong password" is a security
vulnerability. An attacker can use the distinction to enumerate valid email addresses
in your database. A single generic message removes that information.

### SQL injection prevention

Never concatenate user input into a SQL string:

```typescript
// Dangerous
`SELECT * FROM users WHERE email = '${email}'`

// Correct — parameterized query
pool.query("SELECT * FROM users WHERE email = $1", [email])
```

The `pg` driver escapes the values before sending them to PostgreSQL. The attacker
cannot break out of the value context.

### The `roleMiddleware` closure pattern

```typescript
export const restrictTo = (...roles: Array<"user" | "admin">) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => { ... }
}
```

`restrictTo` is a factory function. It returns the actual middleware. This pattern
allows expressive declarations in route files:

```typescript
router.delete("/admin/users/:id", protect, restrictTo("admin"), deleteUser);
```

The outer function captures `roles` in a closure. The inner function has access to it
when Express eventually calls it.

---
## Phase 3 — Admin & Comment Replies

### Self-referencing foreign keys

A table can reference itself. The `comments` table uses this to model reply threads:

```sql
ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE;
```

A comment where `parent_id IS NULL` is a top-level comment.
A comment where `parent_id = 5` is a reply to comment 5.
`ON DELETE CASCADE` means deleting a parent comment automatically deletes all its replies.
No extra application logic required.

### Validating a reply belongs to the same post

When adding a reply, it is not enough to check that the parent comment exists.
You must also verify it belongs to the same post the client is replying to.
Without this check, a client could craft a request that links a reply to an
unrelated post, corrupting the data.

```typescript
const parentExists = await pool.query(
  "SELECT id FROM comments WHERE id = $1 AND post_id = $2",
  [parent_id, post_id]
);
```

### Applying middleware at the router level

Instead of repeating `protect` and `restrictTo("admin")` on every admin route,
apply them once at the router level:

```typescript
router.use(protect, restrictTo("admin"));
```

Every route registered on that router after this line inherits both middleware.
Cleaner and eliminates the risk of forgetting to protect a route.

### Guarding against self-targeting in admin operations

An admin should not be able to delete their own account or change their own role.
If they could, they might accidentally remove the last admin, locking everyone out.
This is checked inside the controller by comparing the target user's id
against `req.user.id`:

```typescript
if (Number(id) === req.user!.id) {
  res.status(400).json({ message: "You cannot delete your own account" });
  return;
}
```

---

## Still To Build

- Hardening pass (rate limiting, helmet, pagination, indexes, GET /auth/me)
- Frontend: React, Redux Toolkit, React Router v7, Tailwind CSS, Framer Motion
- Supabase migration
- Render + Vercel deployment