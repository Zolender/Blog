export interface User {
    id: number
    username: string
    email : string
    role: "user" | "admin"
    bio: string | null
    profile_pic : string | null
    created_at: string
}

export interface Post{
    id: number
    title: string
    content: string
    banner_image: string | null
    created_at : string
    author_id: number
    author_username: string
    author_profile_pic: string | null
    like_count: string
    comment_count: string
}

export interface Comment {
    id: number
    content: string
    parent_id: number | null
    created_at: string
    author_id: number
    author_username: string
    author_profile_pic: string | null
}

export interface PaginationMeta {
    currentPage: number
    totalPages: number
    totalPosts: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export interface AuthState {
    user: User | null
    token: string | null
    isLoading: boolean
}