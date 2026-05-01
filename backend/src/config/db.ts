import {Pool} from "pg"
import dotenv from "dotenv"

dotenv.config()

const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
})

//test connection
pool.on("connect", ()=>{
    console.log("PostgreSQL DB connected")
})

pool.on("error", (err)=>{
    console.error("Unexpected error in client side", err)
    process.exit(-1)
})


export default pool;