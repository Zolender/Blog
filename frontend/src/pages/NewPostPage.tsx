import { useState } from "react";
import { useNavigate } from "react-router";
import { postsApi } from "../api/posts";
import PostForm from "../components/PostForm";


const NewPostPage = () => {
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
            <PostForm
                onSubmit={handleSubmit}
                submitLabel="Publish"
                isLoading={isLoading}
                error={error}
            />
    );
}
 
export default NewPostPage;