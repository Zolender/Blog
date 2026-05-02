import cors from "cors"
import express , { Application } from "express"
import dotenv from "dotenv"
import { errorHandler } from "./middleware/errorMiddleware.js"
import healthRoute from "./routes/healthRoute.js"
import authRoutes from "./routes/authRoutes.js"
import pool from "./config/db.js"



const app : Application = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)

app.get("/health", async (req, res)=>{
    try{
        const result = await pool.query("SELECT NOW()")
        res.json({message: "DB connection working as it should", time: result.rows[0]})
    }catch(err){
        res.status(500).json({ status: "Database connection failed"})
    }})




//global error handling portion of the code
app.use(errorHandler)
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log("server is running at port:", PORT)
})