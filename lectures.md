# Z-Tales: Engineering Lecture Log

### 1. Database Reliability (Event Listeners)
- **Concept:** `pool.on('error')`
- **Lesson:** Database connections can fail randomly (network blips). Listeners allow the server to handle these "idle" errors gracefully instead of crashing.

### 2. Password Security (One-Way Hashing)
- **Concept:** Bcrypt + Salting.
- **Lesson:** We never "encrypt" passwords (which can be decrypted). We "hash" them (a one-way math function).
- **Salting:** Adding random data to the password before hashing ensures that two users with the password "123456" end up with completely different hashes, protecting against "Rainbow Table" attacks.

### 3. Module Systems (CJS vs. ESM)
- **Concept:** `"type": "module"` in package.json.
- **Lesson:** Modern JS uses ES Modules (`import/export`). Node.js needs explicit instructions to use this mode, otherwise it defaults to CommonJS (`require`).