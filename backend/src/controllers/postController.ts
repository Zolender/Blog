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

//getting a single post with user/author and comments of that posts(/posts/:id)
export const getPostById = async (req: Request, res: Response, next: NextFunction)=>{
    try{
        const {id} = req.params

        const postResult = await pool.query(`
                SELECT 
                    posts.id,
                    posts.title,
                    posts.content,
                    posts.banner_image,
                    posts.created_at,
                    users.id AS author_id,
                    users.username AS author_username,
                    users.profile_pic AS author_profile_pic,
                    COUNT(DISTINCT likes.user_id) AS like_count
                FROM posts
                JOIN users ON posts.author_id = users.id
                LEFT JOIN likes ON posts.id = likes.post_id
                WHERE posts.id = $1
                GROUP BY posts.id, users.id 
            `, [id])
            if(postResult.rows.length === 0){
                res.status(404).json({message: "Post not found"})
                return
            }

            const commentsResult = await pool.query(`
                    SELECT
                        comments.id,
                        comments.content,
                        comments.created_at,
                        users.id AS author_id,
                        users.username AS author_username,
                        users.profile_pic AS author_profile_pic
                    FROM comments
                    JOIN users ON comments.author_id = users.id
                    WHERE comments.post_id = $1
                    ORDER BY comments.created_at ASC
                `, [id])

                res.status(200).json({post: postResult.rows[0], comments: commentsResult.rows})

    }catch(err){
        next(err)
    }
}

//creating a post
export const createPost = async (req: authRequest, res: Response, next: NextFunction)=>{
    try{
        const parsed = postSchema.safeParse(req.body)
        if(!parsed.success){
            const errors = parsed.error.issues.map(({path, message})=> ({path,message}))
            res.json(400).json({message : "Invalid Input", errors})
            return
        }

        const {title, content, banner_image} = parsed.data
        const author_id = req.user!.id

        const result = await pool.query(`
                INSERT INTO posts (author_id, title, content, banner_image) VALUES ($1,$2,$3,$4) RETURNING *
            `, [author_id, title, content, banner_image ?? null])

            res.status(201).json({message : "Post created", post: result.rows[0]})
    }catch(err){
        next(err)
    }
}


//editing a post (put op with posts/:id)

export const updatePost = async (req: authRequest, res: Response, next : NextFunction)=>{
    try{
        const {id} = req.params

        const postResult = await pool.query("SELECT * FROM posts WHERE id=$1", [id])
        if(postResult.rows.length===0){
            res.status(404).json({message: "Post not found"})
            return
        }

        const post = postResult.rows[0]
        const isAuthor = post.author_id === req.user!.id
        const isAdmin = req.user!.role === "admin"

        if(!isAuthor && !isAdmin){
            res.status(403).json({method : "Not allowed to edit this post"})
            return
        }

        const parsed = postSchema.partial().safeParse(req.body)
        if(!parsed.success){
            const errors = parsed.error.issues.map(({path, message})=> ({path, message}))
            res.status(400).json({message: "Invalid Input", errors})
            return
        }

        const {title, content, banner_image} = parsed.data

        const updated = await pool.query(`
                UPDATE posts 
                SET
                    title = COALESCE($1, title),
                    content = COALESCE($2, content),
                    banner_image = COALESCE($3, banner_image)
                WHERE id = $4
                RETURNING *
            `, [title ?? null, content ?? null, banner_image ?? null, id])
            res.status(200).json({message: "Post updated", post: updated.rows[0]})
    }catch(err){
        next(err)
    }
}


//deleting a post with index
export const deletePost = async (req: authRequest, res: Response, next: NextFunction)=>{
    try{
        const {id} = req.params

        const postResult = await pool.query("SELECT * FROM posts WHERE id=$1", [id])
        if(postResult.rows.length===0){
            res.status(404).json({message: "Post not found"})
            return
        }

        const post = postResult.rows[0]
        const isAuthor = post.author_id === req.user!.id
        const isAdmin = req.user!.role === "admin"

        if(!isAuthor && !isAdmin){
            res.status(403).json({message: "Not allowed to delete this post"})
            return
        }

        await pool.query("DELETE FROM posts WHERE id = $1", [id])

        res.status(200).json({message: "Post deleted successfully"})
    }catch(err){
        next(err)
    }
}