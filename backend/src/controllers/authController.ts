import { z } from "zod"
import { NextFunction, Request, Response } from "express"
import pool from "../config/db.js"
import bcrypt from "bcryptjs"
import { signToken } from "../utils/jwt.js"
import { authRequest } from "../types/index.js"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

const registerSchema = z.object({
    username: z.string().min(3).max(50),
    email:    z.email(),
    password: z.string().min(6),
})

const loginSchema = z.object({
    email:    z.email(),
    password: z.string().min(1),
})

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const parsed = registerSchema.safeParse(req.body)
        if (!parsed.success) {
            const errors = parsed.error.issues.map(({ path, message }) => ({ path, message }))
            res.status(400).json({ message: "Invalid input", errors })
            return
        }

        const { username, email, password } = parsed.data
        const existing = await pool.query(
            "SELECT id FROM users WHERE email = $1 OR username = $2",
            [email, username]
        )
        if (existing.rows.length > 0) {
            res.status(409).json({ message: "Email or username already taken" })
            return
        }

        const salt            = await bcrypt.genSalt(12)
        const password_hashed = await bcrypt.hash(password, salt)
        const insertResult    = await pool.query(
            "INSERT INTO users(username, email, password_hashed) VALUES($1, $2, $3) RETURNING *",
            [username, email, password_hashed]
        )

        const newUser = insertResult.rows[0]
        const token   = signToken({ id: newUser.id, username: newUser.username, role: newUser.role })

        res.status(201).json({
            message: "Account created successfully",
            token,
            user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
        })
    } catch (err) {
        next(err)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = loginSchema.safeParse(req.body)
        if (!parsed.success) {
            const errors = parsed.error.issues.map(({ path, message }) => ({ path, message }))
            res.status(400).json({ message: "Invalid input", errors })
            return
        }

        const { email, password } = parsed.data
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
        const user   = result.rows[0]

        if (!user) {
            res.status(401).json({ message: "Invalid email or password" })
            return
        }

        const isMatch = await bcrypt.compare(password, user.password_hashed)
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" })
            return
        }

        const token = signToken({ id: user.id, username: user.username, role: user.role })
        res.status(200).json({
            message: "Login successfully",
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        })
    } catch (err) {
        next(err)
    }
}

export const getMe = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        const result = await pool.query(
            "SELECT id, username, email, role, bio, profile_pic, created_at FROM users WHERE id = $1",
            [req.user!.id]
        )
        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" })
            return
        }
        res.status(200).json({ user: result.rows[0] })
    } catch (err) {
        next(err)
    }
}

export const updateMe = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            bio:         z.string().max(300).optional(),
            profile_pic: z.url().nullable().optional(),
        })

        const parsed = schema.safeParse(req.body)
        if (!parsed.success) {
            const errors = parsed.error.issues.map(({ path, message }) => ({ path, message }))
            res.status(400).json({ message: "Invalid input", errors })
            return
        }

        const fields: string[] = []
        const values: unknown[] = []

        if ("bio" in parsed.data) {
            fields.push(`bio = $${values.length + 1}`)
            values.push(parsed.data.bio ?? null)
        }
        if ("profile_pic" in parsed.data) {
            fields.push(`profile_pic = $${values.length + 1}`)
            values.push(parsed.data.profile_pic ?? null)
        }

        if (fields.length === 0) {
            res.status(400).json({ message: "No fields to update" })
            return
        }

        values.push(req.user!.id)
        const result = await pool.query(
            `UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, username, email, role, bio, profile_pic, created_at`,
            values
        )

        res.status(200).json({ user: result.rows[0] })
    } catch (err) {
        next(err)
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        if (!email || typeof email !== "string") {
            res.status(400).json({ message: "Email is required" })
            return
        }

        const result = await pool.query("SELECT id, username FROM users WHERE email = $1", [email])

        if (result.rows.length === 0) {
            res.status(200).json({ message: "If that email is registered, a reset link has been sent." })
            return
        }

        const user = result.rows[0]

        await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [user.id])

        // generate a secure random token, expires in 1 hour
        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

        await pool.query(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [user.id, token, expiresAt]
        )

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

        await resend.emails.send({
            from: process.env.FROM_EMAIL!,
            to: email,
            subject: "Reset your Z-Tales password",
            html: `
                <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #111;">
                    <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">Z-Tales</h1>
                    <p style="color: #888; font-family: system-ui, sans-serif; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 32px;">
                        Password Reset
                    </p>
                    <p style="font-size: 1rem; line-height: 1.7; margin-bottom: 8px;">
                        Hi ${user.username},
                    </p>
                    <p style="font-size: 1rem; line-height: 1.7; margin-bottom: 32px;">
                        We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.
                    </p>
                    <a href="${resetUrl}"
                       style="display: inline-block; background: #1A4D3E; color: white; padding: 12px 28px;
                              font-family: system-ui, sans-serif; font-size: 0.875rem; font-weight: 500;
                              text-decoration: none; letter-spacing: 0.05em; text-transform: uppercase;">
                        Reset Password
                    </a>
                    <p style="margin-top: 32px; font-size: 0.8rem; color: #888; font-family: system-ui, sans-serif; line-height: 1.6;">
                        If you didn't request this, you can safely ignore this email. Your password won't change.
                    </p>
                    <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 32px 0;" />
                    <p style="font-size: 0.7rem; color: #aaa; font-family: system-ui, sans-serif;">
                        &copy; ${new Date().getFullYear()} Z-Tales
                    </p>
                </div>
            `
        })

        res.status(200).json({ message: "If that email is registered, a reset link has been sent." })
    } catch (err) {
        next(err)
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, password } = req.body

        if (!token || !password || password.length < 6) {
            res.status(400).json({ message: "Token and a password of at least 6 characters are required" })
            return
        }

        // find the token and check it hasn't expired
        const result = await pool.query(
            "SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
            [token]
        )

        if (result.rows.length === 0) {
            res.status(400).json({ message: "This reset link is invalid or has expired" })
            return
        }

        const resetRecord = result.rows[0]

        const salt= await bcrypt.genSalt(12)
        const password_hashed = await bcrypt.hash(password, salt)

        await pool.query(
            "UPDATE users SET password_hashed = $1 WHERE id = $2",
            [password_hashed, resetRecord.user_id]
        )

        // delete the token so it can't be reused
        await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [token])

        res.status(200).json({ message: "Password updated successfully" })
    } catch (err) {
        next(err)
    }
}