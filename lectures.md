# Z-Tales — Lecture Notes

A running document of concepts, decisions, and hard lessons from building this project.
Updated at the end of every phase.

---

## Phase 1 — Infrastructure

### The PostgreSQL Connection Pool

A `Pool` manages multiple persistent database connections. The server does not open and
close a connection on every request — that would be expensive. Instead, the pool keeps
a set of connections alive and lends them out as needed.

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
- Double quotes `"value"` mean an identifier (column name, table name)
- Single quotes `'value'` mean a string literal

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
from which the command was run, not the file that called it. This makes it fragile,
especially on Windows where path resolution can behave inconsistently.

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

### GET /auth/me and session rehydration

When a user refreshes the page, React re-mounts from scratch. Redux state is gone.
The token persisted in localStorage is the only thing that survives.

On every app load, the frontend reads the token from localStorage and calls
`GET /auth/me`. The server verifies the token and returns the full user object.
The frontend dispatches this into Redux, restoring the session silently.

If the token is expired or invalid, the server returns 401. The frontend catches
this, clears the token from localStorage, and treats the user as a guest.
This is the correct pattern — the server is always the source of truth.

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

## Phase 3 — Core Features

### SQL JOINs and why we use them

Instead of making separate queries to get a post and then its author, a `JOIN` fetches
both in a single round trip to the database:

```sql
SELECT posts.*, users.username AS author_username
FROM posts
JOIN users ON posts.author_id = users.id
```

`LEFT JOIN` is used for likes and comments because a post with zero likes or comments
should still be returned — an `INNER JOIN` would exclude it.

### COUNT with DISTINCT

```sql
COUNT(DISTINCT likes.user_id) AS like_count
COUNT(DISTINCT comments.id) AS comment_count
```

When joining multiple tables that have a one-to-many relationship with the main table,
rows multiply. `DISTINCT` ensures we count unique entries, not duplicates introduced
by the join.

### COALESCE for partial updates

```sql
SET title = COALESCE($1, title)
```

`COALESCE` returns the first non-null value. If `$1` is null (the field was not sent
in the request), it falls back to the existing column value. This allows a client to
send only the fields they want to update without overwriting the rest with nulls.

### The like toggle pattern

A single endpoint handles both liking and unliking. The server checks the database
for an existing like record. If it exists, it deletes it. If it does not, it inserts one.

This is cleaner than separate `/like` and `/unlike` routes. The client does not need
to track state. The database is always the source of truth.

### RBAC enforcement at the controller level

For post edit and delete, ownership is checked inside the controller:

```typescript
const isAuthor = post.author_id === req.user.id;
const isAdmin = req.user.role === "admin";

if (!isAuthor && !isAdmin) {
  res.status(403).json({ message: "Not allowed" });
  return;
}
```

The `roleMiddleware` alone is not sufficient here because the rule is not just about
role — it is about ownership. An admin can edit any post. A user can only edit their own.
This logic requires knowing both the requester's identity and the resource's owner.

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
Without this check, a client could craft a request that links a reply across posts,
corrupting the data structure.

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

Every route registered after this line inherits both middleware automatically.

### Guarding against self-targeting in admin operations

An admin should not be able to delete their own account or change their own role.
If they could, they might accidentally remove the last admin, locking everyone out.

```typescript
if (Number(id) === req.user!.id) {
  res.status(400).json({ message: "You cannot delete your own account" });
  return;
}
```

---

## Phase 4 — Hardening

### Rate limiting

Auth routes are the most vulnerable surface — a bot can attempt thousands of
password combinations per minute without rate limiting. `express-rate-limit`
solves this:

```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/auth", authLimiter, authRoutes);
```

A `429 Too Many Requests` response is returned when the limit is exceeded.
`standardHeaders: true` sends `RateLimit-*` headers so clients know their remaining quota.

### Security headers with Helmet

`helmet()` sets a collection of HTTP response headers that protect against common
web vulnerabilities — clickjacking, MIME type sniffing, cross-site scripting via
headers, and others. It is one line and has no downside:

```typescript
app.use(helmet());
```

Always apply it before your routes.

### Pagination

Returning every row from a table in a single query is a server killer at scale.
Pagination limits the result set:

```sql
LIMIT $1 OFFSET $2
```

Where `OFFSET = (page - 1) * limit`. The response always includes a `pagination`
object so the frontend never has to calculate page state itself:

```json
{
  "currentPage": 1,
  "totalPages": 12,
  "totalPosts": 114,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

Cap the maximum `limit` server-side. Never trust the client to be reasonable.

### Promise.all for parallel queries

When two queries do not depend on each other, run them in parallel:

```typescript
const [postsResult, countResult] = await Promise.all([
  pool.query("SELECT ... LIMIT $1 OFFSET $2", [limit, offset]),
  pool.query("SELECT COUNT(*) FROM posts"),
]);
```

`Promise.all` fires both queries simultaneously and waits for both to finish.
Running them sequentially would take twice as long for no reason.

### Database indexes

An index is a data structure the database maintains to allow fast lookups on a column.
Without one, a query with `WHERE author_id = 5` reads every single row in the table.
With one, it jumps directly to the matching rows.

Create indexes on every foreign key column and every column used in `ORDER BY`:

```sql
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
```

The tradeoff: indexes slightly slow down writes (INSERT/UPDATE/DELETE) because the
index must be updated too. For a read-heavy application like a blog, this is always
worth it.

---

## Challenges Faced

### The server would not start

Root cause: `ts-node-dev` does not support ESM. Replacing it with `tsx` resolved the
issue. Lesson: always verify that tooling supports your module system before choosing it.

### `pool.on("connect")` never fired

This was not a bug. The pg pool is lazy — it does not connect until the first query
is executed. Waiting for a log that will never come is a misleading debugging strategy.
The health check route with a real query is the correct verification method.

### `dotenv` returning `undefined` for all variables

The `.env` file existed and had correct content. The issue was that `dotenv.config()`
resolves relative to `process.cwd()`, which on Windows behaved unexpectedly.
The native `--env-file` flag bypasses this entirely by loading variables before
any application code runs.

### PostgreSQL password authentication intermittently failing

`localhost` on Windows can resolve to a Unix socket (peer authentication) rather than
TCP. Using `127.0.0.1` forces TCP and consistent password authentication behavior.
The `--env-file` fix made this moot since the variables were not being loaded at all.