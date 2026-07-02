import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app.js'

// Register a user and return their auth token
const getToken = async (): Promise<string> => {
    const res = await request(app).post('/auth/register').send({
        username: 'writer',
        email: 'writer@example.com',
        password: 'password123',
    })
    return res.body.token
}

const createPost = (token: string, title: string, content: string) =>
    request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title, content })

describe('GET /posts?q= — search', () => {
    beforeEach(async () => {
        const token = await getToken()
        await createPost(token, 'Learning React Hooks', 'A deep dive into useEffect and useState.')
        await createPost(token, 'PostgreSQL Indexes', 'How GIN indexes speed up full-text search queries.')
        await createPost(token, 'Cooking Pasta', 'The secret is salting the water generously.')
    })

    it('returns only posts matching the title', async () => {
        const res = await request(app).get('/posts?q=react')
        expect(res.status).toBe(200)
        expect(res.body.posts).toHaveLength(1)
        expect(res.body.posts[0].title).toBe('Learning React Hooks')
    })

    it('matches against the content, not just the title', async () => {
        const res = await request(app).get('/posts?q=salting')
        expect(res.status).toBe(200)
        expect(res.body.posts).toHaveLength(1)
        expect(res.body.posts[0].title).toBe('Cooking Pasta')
    })

    it('is case-insensitive', async () => {
        const res = await request(app).get('/posts?q=POSTGRESQL')
        expect(res.status).toBe(200)
        expect(res.body.posts).toHaveLength(1)
        expect(res.body.posts[0].title).toBe('PostgreSQL Indexes')
    })

    it('returns an empty list with correct pagination when nothing matches', async () => {
        const res = await request(app).get('/posts?q=zzznomatch')
        expect(res.status).toBe(200)
        expect(res.body.posts).toHaveLength(0)
        expect(res.body.pagination.totalPosts).toBe(0)
        expect(res.body.pagination.totalPages).toBe(0)
    })

    it('returns all posts when q is empty', async () => {
        const res = await request(app).get('/posts')
        expect(res.status).toBe(200)
        expect(res.body.posts).toHaveLength(3)
        expect(res.body.pagination.totalPosts).toBe(3)
    })

    it('keeps pagination accurate for a filtered result set', async () => {
        // both these posts mention "search"/"indexes" domain terms; only one matches "indexes"
        const res = await request(app).get('/posts?q=indexes&limit=1&page=1')
        expect(res.status).toBe(200)
        expect(res.body.posts).toHaveLength(1)
        expect(res.body.pagination.totalPosts).toBe(1)
        expect(res.body.pagination.hasNextPage).toBe(false)
    })
})
