import { Request, Response, NextFunction } from "express"
import pool from "../config/db.js"

export const getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params

        const userResult = await pool.query(
            "SELECT id, username, bio, profile_pic, created_at FROM users WHERE username = $1",
            [username]
        )

        if (userResult.rows.length === 0) {
            res.status(404).json({ message: "User not found" })
            return
        }

        const user = userResult.rows[0]
        const page  = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = 10
        const offset = (page - 1) * limit

        const [postsResult, countResult] = await Promise.all([
            pool.query(`
                SELECT
                    posts.id,
                    posts.title,
                    posts.content,
                    posts.banner_image,
                    posts.created_at,
                    users.id   AS author_id,
                    users.username AS author_username,
                    users.profile_pic  AS author_profile_pic,
                    COUNT(DISTINCT likes.user_id) AS like_count,
                    COUNT(DISTINCT CASE WHEN comments.parent_id IS NULL THEN comments.id END) AS comment_count
                FROM posts
                JOIN users ON posts.author_id = users.id
                LEFT JOIN likes ON posts.id = likes.post_id
                LEFT JOIN comments ON posts.id = comments.post_id
                WHERE posts.author_id = $1
                GROUP BY posts.id, users.id
                ORDER BY posts.created_at DESC
                LIMIT $2 OFFSET $3
            `, [user.id, limit, offset]),
            pool.query("SELECT COUNT(*) FROM posts WHERE author_id = $1", [user.id])
        ])

        const totalPosts = parseInt(countResult.rows[0].count)
        const totalPages = Math.ceil(totalPosts / limit)

        res.status(200).json({
            user,
            posts: postsResult.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })
    } catch (err) {
        next(err)
    }
}
