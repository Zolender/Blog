import type { PaginationMeta, Comment, Post } from "../types";
import { apiClient } from "./client";


export const postsApi = {
    getAll: (page= 1, limit = 20) => apiClient.get<{posts: Post[]; pagination : PaginationMeta}>(`/posts?page=${page}&limit=${limit}`),
    getById: (id: number)=> apiClient.get<{post: Post; comments: Comment[]}>(`/posts/${id}`),
    create: (data: {title: string; content: string; banner_image?: string})=> apiClient.post<{post: Post}>("/posts", data),
    update: (id: number, data: Partial<{title: string; content: string; banner_image: string}>)=>{
        return apiClient.put<{post: Post}>(`/posts/${id}`, data)
    },
    delete: (id: number)=> apiClient.delete<{message: string}>(`/posts/${id}`),
    addComment: (postId: number, data: {content: string; parent_id?: number})=>{
        return apiClient.post<{comment: Comment}>(`/posts/${postId}/comments`, data)
    },
    deleteComment : (postId: number, commentId: number)=>{
        return apiClient.delete<{message: string}>(`/posts/${postId}/comments/${commentId}`)
    },
    toggleLike: (postId: number)=> apiClient.post<{liked: boolean; message: string}>(`/posts/${postId}/like`, {})
}