import type { PaginationMeta, Comment, Post } from "../types";
import { apiClient } from "./client";


export const postsApi = {
    getAll: async (page= 1, limit = 20) => {
        const data = await apiClient.get<{posts: Post[]; pagination : PaginationMeta}>(`/posts?page=${page}&limit=${limit}`)
        return {
            ...data,
            posts: data.posts.map(p=>({...p, like_count: Number(p.like_count), comment_count : Number(p.comment_count)}))
        }
    },
    getById: async (id: number)=> {
        const data = await apiClient.get<{post: Post; comments: Comment[]}>(`/posts/${id}`)
        return {
            ...data, post: {
                ...data.post,
                like_count: Number(data.post.like_count),
                comment_count: Number(data.post.comment_count)
            }
        }
    },
    create: (data: {title: string; content: string; banner_image?: string})=> apiClient.post<{post: Post}>("/posts", data),
    update: (id: number, data: Partial<{title: string; content: string; banner_image: string}>)=>{
        return apiClient.put<{post: Post}>(`/posts/${id}`, data)
    },
    delete: (id: number)=> apiClient.delete<{message: string}>(`/posts/${id}`),
    addComment: (postId: number, data: {content: string; parent_id?: number})=>{
        return apiClient.post<{comment: Comment}>(`/posts/${postId}/comments`, data)
    },
    editComment: (postId: number, commentId: number, content: string) =>
        apiClient.put<{ comment: Pick<Comment, "id" | "content"> }>(`/posts/${postId}/comments/${commentId}`, { content }),
    deleteComment : (postId: number, commentId: number)=>{
        return apiClient.delete<{message: string}>(`/posts/${postId}/comments/${commentId}`)
    },
    toggleLike: (postId: number)=> apiClient.post<{liked: boolean; message: string}>(`/posts/${postId}/like`, {})
}