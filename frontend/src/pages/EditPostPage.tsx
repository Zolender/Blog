import { useNavigate, useParams } from "react-router";
import { useAppSelector } from "../app/hooks";
import { useEffect, useState } from "react";
import type { Post } from "../types";
import { postsApi } from "../api/posts";
import PostForm from "../components/PostForm";


const EditPostPage = () => {
    const navigate = useNavigate()
    const {id}= useParams()
    const {user} = useAppSelector((state)=> state.auth)

    const [post, setPost] = useState<Post | null>(null)
    const [isLoading, setIsLoading]= useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [error, setError] = useState<string | null>(null)

    //getting the existing post first so that we may pre-fill the form
    useEffect(()=> {
        const fetchPost = async ()=>{
            try{
                const data = await postsApi.getById(Number(id))
                const fetchedPost = data.post 
                //we need to check the ownership of the post, even tho mofication 
                //would be rejected in the backend if the user isn't an admin or the post owner, 
                //it would be a good thing to prevent the user from filling the form when we know it would be useless
                if(user && user.id !== fetchedPost.author_id && user.role !== 'admin'){
                    return navigate("/")
                }
                setPost(fetchedPost)
            }catch(err){
                setError(err instanceof Error ? err.message : "Failed to load post")
            }finally{
                setIsFetching(false)
            }
        }

        fetchPost()
    }, [id, user, navigate])


    const handleSubmit = async (values: {
        title: string
        content: string
        banner_image: string
    })=>{
        setIsLoading(true)
        setError(null)

        try{
            await postsApi.update(Number(id), {
                title: values.title,
                content: values.content,
                ...(values.banner_image && {banner_image: values.banner_image})
            })
            navigate(`/posts/${id}`)
        }catch(err){
            setError(err instanceof Error? err.message : "Failed to update post")
            setIsLoading(false)
        }
    }

    if(isFetching){
        return (
            <div className="flex justify-center py-20">
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        )
    }

    if(error || !post){
        return (
            <div className="flex justify-center py-20">
                <p className="text-red-500 text-sm">{error??"Post not found"}</p>
            </div>
        )
    }


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
    );
}
 
export default EditPostPage;