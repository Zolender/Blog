import {z} from "zod"
import { NextFunction, Request, Response } from "express";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt.js";


const registerSchema = z.object({
    username : z.string().min(3).max(50),
    email: z.email(),
    password : z.string().min(6),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1)
})

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void>=>{
    try{
        const parsed = registerSchema.safeParse(req.body)
        if(!parsed.success){
            const errors = parsed.error.issues.map(({path, message})=> ({path, message}))
            res.status(400).json({ message : "Invalid input", errors})
            return
        }
        const { username, email, password} = parsed.data
        //it happens so we need to check if the user isn't already registered
        const existing = await pool.query("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username])

        if(existing.rows.length > 0){
            res.status(409).json({message: "Email or username already taken"});
            return
        }
        //hashing the pswd before inserting the user's details in our db
        const salt = await bcrypt.genSalt(12)
        const password_hashed = await bcrypt.hash(password, salt)

        const insertResult = await pool.query("INSERT INTO users(username, email, password_hashed) VALUES($1, $2, $3) RETURNING *", [username, email, password_hashed])

        const newUser = insertResult.rows[0]
        //creating a token for the user
        const token = signToken({ id: newUser.id, username: newUser.username, role: newUser.role})
        res.status(201).json({message: "Account created successfully", token, user:{ id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role}})
    }catch(err){
        next(err)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction)=>{
    try{
        
    }catch(err){
        next(err)
    }
}