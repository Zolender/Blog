import cors from "cors"
import express , { Application } from "express"
import dotenv from "dotenv"
import { errorHandler } from "./middleware/errorMiddleware.js"
import pool from "./config/db.js"

dotenv.config()

const app : Application = express()

app.use(cors())
app.use(express.json())

app.get("/health", async (req, res)=>{
    try{
        const result =  await pool.query("SELECT NOW()")
        res.json({message: "DB connection working as it should", time: result.rows[0]})
    }catch(err){
        res.status(500).json({ status: "Database connection failed"})
    }
})


//global error handling portion of the code
app.use(errorHandler)

app.listen(Number(process.env.PORT)|| 5000, ()=>{
    console.log("server is running at port", process.env.PORT)
})