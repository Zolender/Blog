import cors from "cors"
import express , { Application } from "express"
import dotenv from "dotenv"
import { errorHandler } from "./middleware/errorMiddleware.js"
import healthRoute from "./routes/healthRoute.js"
import authRoutes from "./routes/authRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import adminRoutes  from "./routes/adminRoutes.js"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

const app : Application = express()

app.use(helmet())

app.use(cors())
app.use(express.json())

//rate limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {message: "Too many attempts, please try again later"},
    standardHeaders: true,
    legacyHeaders: false
})


//routes
app.use("/auth", authLimiter ,authRoutes)

app.use("/health", healthRoute)

app.use("/posts", postRoutes)

app.use("/admin", adminRoutes)




//global error handling portion of the code
app.use(errorHandler)
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log("server is running at port:", PORT)
})