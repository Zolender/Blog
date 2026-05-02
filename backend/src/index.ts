import cors from "cors"
import express , { Application } from "express"
import dotenv from "dotenv"
import { errorHandler } from "./middleware/errorMiddleware.js"
import healthRoute from "./routes/healthRoute.js"
dotenv.config()

const app : Application = express()

app.use(cors())
app.use(express.json())

app.use("/health", healthRoute)




//global error handling portion of the code
app.use(errorHandler)
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log("server is running at port:", PORT)
})