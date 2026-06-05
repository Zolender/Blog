import z from "zod";
import { authRequest } from "../types/index.js";
import { NextFunction, Response } from "express";
import pool from "../config/db.js";


export const getAllAdminPosts = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        const result = await pool.query(`
            SELECT
                posts.id,
                posts.title,
                posts.created_at,
                users.username AS author_username,
                COUNT(DISTINCT likes.user_id)  AS like_count,
                COUNT(DISTINCT comments.id)    AS comment_count
            FROM posts
            JOIN users         ON posts.author_id = users.id
            LEFT JOIN likes    ON posts.id = likes.post_id
            LEFT JOIN comments ON posts.id = comments.post_id
            GROUP BY posts.id, users.id
            ORDER BY posts.created_at DESC
        `)
        res.status(200).json({ posts: result.rows })
    } catch (err) {
        next(err)
    }
}

export const deleteAnyPost = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const result = await pool.query("DELETE FROM posts WHERE id=$1 RETURNING title", [id])
        if (result.rows.length === 0) {
            res.status(404).json({ message: "Post not found" })
            return
        }
        res.status(200).json({ message: `Post deleted` })
    } catch (err) {
        next(err)
    }
}


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

//changing the role of a User(/:id/role)
export const updateUserRole = async (req: authRequest, res: Response, next: NextFunction)=>{
    try{
        const {id} = req.params
        if(Number(id)===req.user!.id){
            res.status(400).json({message: "You cannot change your own role"})
            return
        }
        const parsed = roleSchema.safeParse(req.body)
        if(!parsed.success){
            const errors = parsed.error.issues.map(({path, message})=> ({path, message}))
            return res.status(400).json({message: "Invalid role", errors})
        }

        const result = await pool.query(`UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role`, [parsed.data.role, id])
        if(result.rows.length === 0){
            return res.status(404).json({message: "User not found"})
        }

        res.status(200).json({message: "Role updated successfully", user: result.rows[0]})
    }catch(err){
        next(err)
    }
}