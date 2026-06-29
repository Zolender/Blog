import pool from '../config/db.js'
import { afterAll, afterEach } from 'vitest'

afterEach(async () => {
    await pool.query(
        'TRUNCATE TABLE likes, password_reset_tokens, comments, posts, users RESTART IDENTITY CASCADE'
    )
})

afterAll(async () => {
    await pool.end()
})
