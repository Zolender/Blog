import { useNavigate, useParams } from "react-router"
import { useAppSelector } from "../app/hooks"
import { useEffect, useState } from "react"
import type { Post } from "../types"
import { postsApi } from "../api/posts"
import PostForm from "../components/PostForm"

const EditPostPage = () => {
    const navigate    = useNavigate()
    const { id }      = useParams()
    const { user }    = useAppSelector((state) => state.auth)

    const [post, setPost]           = useState<Post | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [error, setError]         = useState<string | null>(null)

    useEffect(() => {
        document.title = 'Editing — Z-Tales'
        return () => { document.title = 'Z-Tales' }
    }, [])

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await postsApi.getById(Number(id))
                const fetchedPost = data.post
                if (user && user.id !== fetchedPost.author_id && user.role !== 'admin') {
                    return navigate("/")
                }
                setPost(fetchedPost)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load post")
            } finally {
                setIsFetching(false)
            }
        }
        fetchPost()
    }, [id, user, navigate])

    const handleSubmit = async (values: {
        title: string
        content: string
        banner_image: string
    }) => {
        setIsLoading(true)
        setError(null)
        try {
            await postsApi.update(Number(id), {
                title: values.title,
                content: values.content,
                ...(values.banner_image && { banner_image: values.banner_image })
            })
            navigate(`/posts/${id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update post")
            setIsLoading(false)
        }
    }

    if (isFetching) return (
        <div className="state-container">
            <p className="meta-text">Loading post...</p>
        </div>
    )

    if (error || !post) return (
        <div className="state-container">
            <p className="error-banner">{error ?? "Post not found"}</p>
        </div>
    )

    return (
        <PostForm
            initialValues={{
                title: post.title,
                content: post.content,
                banner_image: post.banner_image ?? '',
            }}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            isLoading={isLoading}
            error={error}
        />
    )
}

export default EditPostPage