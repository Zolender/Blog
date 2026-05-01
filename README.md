# Z-Tales 

A full-stack blogging platform focused on clean architecture and type-safe data handling. This project serves as a deep dive into building relational systems with Node.js and React.

##  The Tech Stack
- **Frontend:** React (Router v7), Redux Toolkit, Tailwind CSS, Framer Motion.
- **Backend:** Node.js, Express, TypeScript, PostgreSQL.
- **Security:** Bcrypt.js (Hashing), JWT (Auth), Zod (Schema Validation).

##  Technical Learning Objectives
- **Relational Data:** Implementing One-to-Many (Users/Posts) and Many-to-Many (Likes) relationships in PostgreSQL.
- **Type Safety:** Utilizing TypeScript across the full stack to reduce runtime errors.
- **State Management:** Using Redux Toolkit to handle global authentication and UI states.
- **Security:** Implementing the "Gatekeeper" pattern with JWT and protected private routes.

##  Features (MVP)
- User Authentication (Sign up/Login).
- CRUD operations for personal blog posts.
- Global "Tales" feed sorted by recent activity.
- Interactive engagement (Comments & Likes).
- Smooth UI transitions via Framer Motion.