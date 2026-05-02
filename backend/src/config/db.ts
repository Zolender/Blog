import {Pool} from "pg"
import dotenv from "dotenv"

dotenv.config()
console.log("Looking for .env in:", process.cwd());
console.log("DB_PASSWORD repr:", JSON.stringify(process.env.DB_PASSWORD));
const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
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