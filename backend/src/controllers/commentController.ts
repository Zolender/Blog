import z from "zod";
import { authRequest } from "../types/index.js";
import { NextFunction, Response } from "express";
import pool from "../config/db.js";


const commentSchema = z.object({
    content : z.string().min(1).max(1000)
})

//posting a comment to a post(with id)

export const addComment = async (req: authRequest, res: Response, next: NextFunction)=>{
    const parsed = commentSchema.safeParse(req.body)
    if(!parsed.success){
        const errors = parsed.error.issues.map(({path, message})=>({path, message}))
        res.status(400).json({ message: "Invalid input", errors})
        return
    }

    const post_id = Number(req.params.id)
    const author_id = req.user!.id

    const postExists = await pool.query("SELECT id FROM posts WHERE id=$1", [post_id])
    if(postExists.rows.length===0){
        res.status(404).json({message: "Post not found"})
        return
    }
    
    const result = await pool.query(`INSERT INTO comments(post_id, author_id, content) VALUES($1,$2,$3) RETURNING *`, [post_id, author_id, parsed.data.content])
    res.status(201).json({message: "Comment added", comment : result.rows[0]})

}