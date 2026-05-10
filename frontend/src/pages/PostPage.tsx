import { useNavigate, useParams } from "react-router";
import { useAppSelector } from "../app/hooks";
import { useEffect, useState } from "react";
import type { Post, Comment } from "../types";
import { postsApi } from "../api/posts";


const PostPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const {user} = useAppSelector((state)=> state.auth)

    const [post, setPost] = useState<Post | null >(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null >(null)
    
    const [liked, setLiked] = useState(false)//we get to track this one for immediate ui feedback purposes, a part of a technique called optimistic programming or sth like that
    const [likeCount, setLikeCount] = useState(0)

    const [commentContent, setCommentContent] = useState("")
    const [commentLoading, setCommentLoading] = useState(false)
    const [commentError, setCommentError] = useState<string | null>(null)

    //this following exist so that we track which comment the user is currently replying to
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [replyContent, setReplyContent] = useState("")
    const [replyLoading, setReplyLoading] = useState(false)

    useEffect(()=>{
        const fetchPost = async () => {
            setIsLoading(true)
            setError(null)

            try{
                const data = await postsApi.getById(Number(id))
                setPost(data.post)
                setComments(data.comments)
                setLikeCount(Number(data.post.like_count))
            }catch(err){
                setError(err instanceof Error ? err.message : "Failed to load post")
            }finally{
                setIsLoading(false)
            }
        }
        fetchPost()
    },[id])


    //whenever a post is liked,...
    const handleLike = async ()=>{
        if(!user){
            return navigate("/login")
        }
        //we would change the ui immediately before the server responses so that
        //the user doesn't get to wait to see the feedback, like it makes the app less laggy, and when the server operation fails we would just silently roll back to the previous state
        const wasLiked = liked
        const prevCount = likeCount

        setLiked(!wasLiked)
        setLikeCount(wasLiked ? likeCount -1: likeCount + 1)

        try{
            await postsApi.toggleLike(Number(id))
        }catch(err){
            setLiked(wasLiked)
            setLikeCount(prevCount)
        }
    }


    return (
        <>PostPage</>
    );
}
 
export default PostPage;