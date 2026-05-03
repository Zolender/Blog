import z from "zod";
import { authRequest } from "../types/index.js";
import { NextFunction, Response } from "express";
import pool from "../config/db.js";


const commentSchema = z.object({
    content : z.string().min(1).max(1000),
    parent_id : z.number().int().positive().optional()
})

//posting a comment to a post(with id)

export const addComment = async (req: authRequest, res: Response, next: NextFunction)=>{
    try{
        const parsed = commentSchema.safeParse(req.body)
        if(!parsed.success){
            const errors = parsed.error.issues.map(({path, message})=>({path, message}))
            res.status(400).json({ message: "Invalid input", errors})
            return
        }

        const post_id = Number(req.params.id)
        const author_id = req.user!.id
        const {content, parent_id} = parsed.data

        const postExists = await pool.query("SELECT id FROM posts WHERE id=$1", [post_id])
        if(postExists.rows.length===0){
            res.status(404).json({message: "Post not found"})
            return
        }


        //in case it is a reply, we must verify parent comment existence and if they belong to the same post
        if(parent_id){
            const parentExists = await pool.query("SELECT id FROM comments WHERE id=$1 AND post_id = $2", [parent_id, post_id])
            if(parentExists.rows.length===0){
                return res.status(404).json({message: "Parent comment not found on this post"})
            }
        }
        
        const result = await pool.query(`INSERT INTO comments(post_id, author_id, content, parent_id) VALUES($1,$2,$3, $4) RETURNING *`, [post_id, author_id, parsed.data.content, parent_id ?? null])
        res.status(201).json({message: parent_id ? "Reply added" : "Comment added", comment : result.rows[0]})
    }catch(err){
        next(err)
    }
}