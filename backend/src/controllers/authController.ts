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
        const parsed = loginSchema.safeParse(req.body)
        if(!parsed.success){
            const errors = parsed.error.issues.map(({path, message})=> ({path, message}))
            res.status(400).json({ message : "Invalid input", errors})
            return
        }

        const {email, password} = parsed.data
        //check in db for the user
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
        const user = result.rows[0]
        if(!user){
            res.status(401).json({message : "Invalid email or password"})
            return
        }
        //check the password now 
        const isMatch = await bcrypt.compare(password, user.password_hashed)
        if(!isMatch){
            res.status(401).json({message : "Invalid email or password"})
            return
        }

        //sign the token
        const token = signToken({ id: user.id, username: user.username, role: user.role})

        res.status(200).json({ 
            message : "Login successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    }catch(err){
        next(err)
    }
}