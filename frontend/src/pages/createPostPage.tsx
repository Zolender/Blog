import { useState } from "react";
import { useNavigate } from "react-router";
import { postsApi } from "../api/posts";
import PostForm from "../components/PostForm";


const CreatePostPage = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (values: {
        title: string 
        content: string 
        banner_image: string
    })=> {
        setIsLoading(true)
        setError(null)

        try{
            const data = await postsApi.create({
                title: values.title,
                content: values.content,
                ...(values.banner_image && {banner_image: values.banner_image})
            })
            navigate(`/posts/${data.post.id}`)
        }catch(err){
            setError(err instanceof Error? err.message : "Failed to create post")
            setIsLoading(false)
        }
    }


    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-gray-900">Write a post</h1>
            <PostForm
                onSubmit={handleSubmit}
                submitLabel="Publish"
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
}
 
export default CreatePostPage;