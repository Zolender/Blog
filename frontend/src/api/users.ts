import type { PaginationMeta, Post, PublicUser, User } from "../types"
import { apiClient } from "./client"

export const usersApi = {
    getProfile: async (username: string, page = 1) => {
        const data = await apiClient.get<{ user: PublicUser; posts: Post[]; pagination: PaginationMeta }>(
            `/users/${username}?page=${page}`
        )
        return {
            ...data,
            posts: data.posts.map(p => ({
                ...p,
                like_count: Number(p.like_count),
                comment_count: Number(p.comment_count),
            }))
        }
    },
    updateMe: (data: { bio?: string; profile_pic?: string | null }) =>
        apiClient.put<{ user: User }>("/auth/me", data),
}
