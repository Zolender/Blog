import cors from "cors"
import express, { Application } from "express"
import { errorHandler } from "./middleware/errorMiddleware.js"
import healthRoute from "./routes/healthRoute.js"
import authRoutes from "./routes/authRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

const app: Application = express()

app.use(helmet())

app.use(cors({
    origin: process.env.NODE_ENV === "production"
        ? "https://z-tales.vercel.app"
        : "http://localhost:5173",
    credentials: true
}))

app.use(express.json())

// 10 attempts per 15 min 
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
})

// /auth/me fires on every page load, must not be rate-limited aggressively
const meLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
})

//  posts, admin are protect against spam without blocking normal use
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
})

app.use("/health", healthRoute)
app.use("/auth/me", meLimiter)                         
app.use("/auth", strictLimiter, authRoutes)
app.use("/posts", generalLimiter, postRoutes)
app.use("/admin", generalLimiter, adminRoutes)
app.use("/users", generalLimiter, userRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log("server is running at port:", PORT))