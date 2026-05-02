import { Request, Response } from "express"
import pool from "../config/db.js"

const healthController = async (req: Request, res: Response)=>{
    try{
        const result = await pool.query("SELECT NOW()")
        res.json({message: "DB connection working as it should", time: result.rows[0]})
    }catch(err){
        res.status(500).json({ status: "Database connection failed"})
    }
}

export default healthController