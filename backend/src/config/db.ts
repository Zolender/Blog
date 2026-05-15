import {Pool} from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

//test connection

pool.on("error", (err)=>{
    console.error("Unexpected error in client side", err)
    process.exit(-1)
})


export default pool;