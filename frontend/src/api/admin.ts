import type { User } from "../types";
import { apiClient } from "./client";

export interface AdminPost {
    id: number
    title: string
    created_at: string
    author_username: string
    like_count: number
    comment_count: number
}

export const adminApi = {
    getUsers: () => apiClient.get<{ users: User[] }>(`/admin/users`),
    deleteUser: (id: number) => apiClient.delete<{ message: string }>(`/admin/users/${id}`),
    updataRole: (id: number, role: "user" | "admin") => apiClient.put<{ user: User }>(`/admin/users/${id}/role`, { role }),

    getPosts: async () => {
        const data = await apiClient.get<{ posts: AdminPost[] }>(`/admin/posts`)
        return {
            posts: data.posts.map(p => ({
                ...p,
                like_count:    Number(p.like_count),
                comment_count: Number(p.comment_count),
            }))
        }
    },
    deletePost: (id: number) => apiClient.delete<{ message: string }>(`/admin/posts/${id}`),
}
