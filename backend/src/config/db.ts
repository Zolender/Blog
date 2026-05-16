import {Pool} from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
})

//test connection

pool.on("error", (err)=>{
    console.error("Unexpected error in client side", err)
    process.exit(-1)
})

//logs so we resolve the bug in deployment
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("SSL enabled:", process.env.NODE_ENV === "production")


export default pool;