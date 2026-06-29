import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import pool from '../config/db.js'
import bcrypt from 'bcryptjs'

// Register a user via the API and return the raw response
const registerUser = (overrides: Record<string, string> = {}) =>
    request(app).post('/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        ...overrides,
    })

// Login and return the JWT token
const loginAs = async (email: string, password: string): Promise<string> => {
    const res = await request(app).post('/auth/login').send({ email, password })
    return res.body.token
}

// Insert an admin directly in the DB (bypasses register which always sets role='user')
const createAdmin = async (): Promise<string> => {
    const hash = await bcrypt.hash('admin123', 10)
    await pool.query(
        `INSERT INTO users (username, email, password_hashed, role) VALUES ($1, $2, $3, $4)`,
        ['admin', 'admin@example.com', hash, 'admin']
    )
    return loginAs('admin@example.com', 'admin123')
}


describe('POST /auth/register', () => {
    it('creates a user and returns a token', async () => {
        const res = await registerUser()
        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('token')
        expect(res.body.user.username).toBe('testuser')
        expect(res.body.user.role).toBe('user')
        expect(res.body.user).not.toHaveProperty('password_hashed')
    })

    it('rejects a request with missing fields', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', password: 'password123' }) // no email
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('errors')
    })

    it('rejects a password shorter than 6 characters', async () => {
        const res = await registerUser({ password: '123' })
        expect(res.status).toBe(400)
    })

    it('rejects a duplicate email or username with 409', async () => {
        await registerUser()
        const res = await registerUser({ username: 'differentuser' }) // same email
        expect(res.status).toBe(409)
        expect(res.body.message).toMatch(/already taken/i)
    })
})


describe('POST /auth/login', () => {
    it('returns a token with valid credentials', async () => {
        await registerUser()
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'password123' })
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('token')
    })

    it('rejects a wrong password with 401', async () => {
        await registerUser()
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' })
        expect(res.status).toBe(401)
    })

    it('rejects an unknown email with 401', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'ghost@example.com', password: 'password123' })
        expect(res.status).toBe(401)
    })
})


describe('GET /auth/me', () => {
    it('returns the current user with a valid token', async () => {
        await registerUser()
        const token = await loginAs('test@example.com', 'password123')
        const res = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body.user.username).toBe('testuser')
        expect(res.body.user).not.toHaveProperty('password_hashed')
    })

    it('returns 401 with no token', async () => {
        const res = await request(app).get('/auth/me')
        expect(res.status).toBe(401)
    })

    it('returns 401 with a malformed token', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Authorization', 'Bearer not.a.real.token')
        expect(res.status).toBe(401)
    })
})


describe('GET /admin/users — RBAC', () => {
    it('allows access for admin users', async () => {
        const token = await createAdmin()
        const res = await request(app)
            .get('/admin/users')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
    })

    it('blocks regular users with 403', async () => {
        await registerUser()
        const token = await loginAs('test@example.com', 'password123')
        const res = await request(app)
            .get('/admin/users')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(403)
    })

    it('blocks unauthenticated requests with 401', async () => {
        const res = await request(app).get('/admin/users')
        expect(res.status).toBe(401)
    })
})
