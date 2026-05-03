import z from "zod";
import { authRequest } from "../types/index.js";
import { NextFunction, Response } from "express";
import pool from "../config/db.js";


const roleSchema = z.object({
    role: z.enum(["user", "admin"])
})

//getting all users if we an admin
export const getAllUsers = async (req: authRequest, res: Response, next: NextFunction)=>{
    try{
        const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC")
        res.status(200).json({users: result.rows})
    }catch(err){
        next(err)
    }
}


//deleting a single user