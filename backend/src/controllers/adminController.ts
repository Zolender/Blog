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


//deleting a single user(using the id of that one)
export const deleteUser = async (req: authRequest, res: Response, next: NextFunction)=>{
    try{
        const {id} = req.params
        //admin shouldn't delete themselves
        if(Number(id)=== req.user!.id){
            res.status(400).json({message: "You can't delete your own account"})
            return
        }

        const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING *", [id])
        res.status(200).json({message: `User ${result.rows[0].username} deleted successfully`})
    }catch(err){
        next(err)
    }
}