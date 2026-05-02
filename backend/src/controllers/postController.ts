import { z } from "zod"
import pool from "../config/db.js"
import { authRequest } from "../types/index.js"
import { Request, Response, NextFunction } from "express"


const postSchema = z.object({
    title : z.string().min(3).max(255),
    content : z.string().min(10),
    banner_image : z.url().optional()
})


//getting all post with author infos
export const getAllPosts = async (req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await pool.query(`
            SELECT
                posts.id,
                posts.title,
                posts.content,
                posts.banner_image,
                posts.created_at,
                users.id AS author_id,
                users.username AS author_username,
                users.profile_pic AS author_profile_pic,
                COUNT(DISTINCT likes.user_id) AS like_count,
                COUNT(DISTINCT comments.id) AS comment_count
            FROM posts
            JOIN users ON posts.author_id = users.id
            LEFT JOIN likes ON posts.id = likes.post_id
            LEFT JOIN comments ON posts.id = comments.post_id
            GROUP BY posts.id, users.id
            ORDER BY posts.created_at DESC
        `)

        res.status(200).json({posts : result.rows })
    }catch(err){
        next(err)
    }
}