import z from "zod";
import { authRequest } from "../types/index.js";
import { NextFunction, Response } from "express";
import pool from "../config/db.js";


const commentSchema = z.object({
    content : z.string().min(1).max(1000),
    parent_id : z.number().int().positive().optional()
})

export const addComment = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        const parsed = commentSchema.safeParse(req.body)
        if (!parsed.success) {
            const errors = parsed.error.issues.map(({ path, message }) => ({ path, message }))
            res.status(400).json({ message: "Invalid input", errors })
            return
        }

        const post_id = Number(req.params.id)
        const author_id = req.user!.id
        const { content, parent_id } = parsed.data

        const postExists = await pool.query("SELECT id FROM posts WHERE id=$1", [post_id])
        if (postExists.rows.length === 0) {
            res.status(404).json({ message: "Post not found" })
            return
        }

        if (parent_id) {
            const parentExists = await pool.query(
                "SELECT id FROM comments WHERE id=$1 AND post_id = $2",
                [parent_id, post_id]
            )
            if (parentExists.rows.length === 0) {
                res.status(404).json({ message: "Parent comment not found on this post" })
                return
            }
        }

        const inserted = await pool.query(
            `INSERT INTO comments(post_id, author_id, content, parent_id)
             VALUES($1, $2, $3, $4)
             RETURNING id`,
            [post_id, author_id, content, parent_id ?? null]
        )

        // now we fetch the full comment with author data 
        const fullComment = await pool.query(`
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
            WHERE comments.id = $1
        `, [inserted.rows[0].id])

        res.status(201).json({
            message: parent_id ? "Reply added" : "Comment added",
            comment: fullComment.rows[0]
        })
    } catch (err) {
        next(err)
    }
}

export const editComment = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        const { commentId } = req.params

        const parsed = z.object({ content: z.string().min(1).max(1000) }).safeParse(req.body)
        if (!parsed.success) {
            const errors = parsed.error.issues.map(({ path, message }) => ({ path, message }))
            res.status(400).json({ message: "Invalid input", errors })
            return
        }

        const commentResult = await pool.query("SELECT * FROM comments WHERE id = $1", [commentId])
        if (commentResult.rows.length === 0) {
            return res.status(404).json({ message: "Comment not found" })
        }

        // edit is author-only — admins can delete but should not alter someone else's words
        if (commentResult.rows[0].author_id !== req.user!.id) {
            return res.status(403).json({ message: "Not allowed to edit this comment" })
        }

        const updated = await pool.query(
            "UPDATE comments SET content = $1 WHERE id = $2 RETURNING id, content, parent_id, created_at",
            [parsed.data.content, commentId]
        )

        res.status(200).json({ message: "Comment updated", comment: updated.rows[0] })
    } catch (err) {
        next(err)
    }
}

export const deleteComment = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        const { commentId } = req.params
        const commentResult = await pool.query("SELECT * FROM comments WHERE id = $1", [commentId])

        if (commentResult.rows.length === 0) {
            return res.status(404).json({ message: "Comment not found" })
        }

        const comment = commentResult.rows[0]
        const isAuthor = comment.author_id === req.user!.id
        const isAdmin = req.user!.role === "admin"

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: "Not allowed to delete this comment" })
        }

        await pool.query("DELETE FROM comments WHERE id=$1", [commentId])
        res.status(200).json({ message: "Comment deleted successfully" })
    } catch (err) {
        next(err)
    }
}