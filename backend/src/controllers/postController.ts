import { z } from "zod"
import pool from "../config/db.js"
import { authRequest } from "../types/index.js"
import { Request, Response, NextFunction } from "express"


const postSchema = z.object({
    title : z.string().min(3).max(255),
    content : z.string().min(10),
    banner_image : z.url().optional()
})


//getting post with pagination (/posts?page=1&limit=20 for instance)
export const getAllPosts = async (req: Request, res: Response, next: NextFunction)=>{
    try{
        const page = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string)|| 20))
        const offset = (page - 1) * limit
        const [postsResult, countResult]= await Promise.all([
            pool.query(`
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
                LIMIT $1 OFFSET $2        
                `, [limit, offset]),
                pool.query("SELECT COUNT(*) FROM posts")
        ])

        const totalPosts = parseInt(countResult.rows[0].count)
        const totalPages = Math.ceil(totalPosts/limit)
        
            

        res.status(200).json({
            posts : postsResult.rows,
            pagination : {
                currentPage: page,
                totalPages,
                totalPosts,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })
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
                        comments.parent_id,
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