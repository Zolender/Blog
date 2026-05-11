import { Link, useNavigate, useParams } from "react-router";
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

    //whenever an admin or the author deletes a posts
    const handleDeletePost = async() =>{
        if(!confirm("Are you sure you want to delete this post?"))return
        try{
            await postsApi.delete(Number(id))
            navigate("/")
        }catch(err){
            alert(err instanceof Error ? err.message: "Failed to delete post")
        }
    }

    //top level comments handler
    const handleAddComment = async(e: React.SubmitEvent)=> {
        e.preventDefault()
        if(!commentContent.trim())return

        setCommentLoading(true)
        setCommentError(null)

        try{
            const data = await postsApi.addComment(Number(id), {content: commentContent})
            //isntead of refetching everything again so that the comment get displayed, we just append it to the local list
            setComments((prev)=> [...prev, data.comment])
            setCommentContent("")
        }catch(err){
            setCommentError(err instanceof Error? err.message: "Failed to add comment")
        }finally{
            setCommentLoading(false)
        }
    }


    //and for the case one is to reply to a comment, here is an handler
    const handleAddReply = async (e: React.SubmitEvent, parentId: number)=>{
        e.preventDefault()
        if(!replyContent.trim())return
        setReplyLoading(true)

        try{
            const data = await postsApi.addComment(Number(id), {content: replyContent, parent_id: parentId})
            setComments((prev)=> [...prev, data.comment])
            setReplyContent("")
            setReplyingTo(null)
        }catch(err){
            alert(err instanceof Error? err.message: "Failed to add reply")
        }finally{
            setReplyLoading(false)
        }
    }


    //deleting a comment, would need an handler as well
    const handleDeleteComment = async (commentId: number)=>{
        if(!confirm("Delet this comment?"))return
        try{
            await postsApi.deleteComment(Number(id), commentId)
            //we would remove it from the local state without refetching again
            setComments((prev)=> prev.filter((c)=> c.id!==commentId))
        }catch(err){
            alert(err instanceof Error? err.message: "Failed to delete comment")
        }
    }

    //managing ownership cases(comments and post)

    const canModifyPost = user && post && (user.id===post.author_id || user.role === "admin")
    const canModifyComment = (comment: Comment)=>{
        return user && (user.id === comment.author_id || user.role==="admin")
    }

    //way tp get to separate top-level comments from reply ones, threading in a sort
    const topLevelComments = comments.filter((c)=> c.parent_id === null)
    const getReplies = (commentId: number)=> comments.filter((c)=> c.parent_id === commentId)

    if(isLoading){
        return (
            <div className="flex justify-center py-20">
                <p className="text-gray-400 text-sm">Loading Post...</p>
            </div>
        )
    }

    if(error || !post){
        return (
            <div className="flex justify-center py-20">
                <p className="text-red-500 text-sm">{error?? "Post not found"}</p>
            </div>
        )
    }
    
    return (
        <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col gap3">
                {post.banner_image && (
                    <img src={post.banner_image} alt={post.title} className=" w-full h-64 object-cover rounded-lg" />
                )}
                <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                        by <span className="font-medium text-gray-700">{post.author_username}</span>
                        {" . "}
                        {new Date(post.created_at).toLocaleDateString()}
                    </span>

                    {/* may edit if author or admin */}
                    {canModifyPost && (
                        <div className="flex items-center gap-3">
                            <Link to={`/posts/${post.id}/edit`} className="text-sm text-blue-600 hover:underline">Edit</Link>
                            <button onClick={handleDeletePost} className="text-red-500 hover:underline text-sm">Delete</button> 
                        </div>
                    )}
                </div>
            </div>
        
        {/* the body */}
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleLike}
                    className={`px-4 py1.5 rounded-sm text-sm font-medium transition-colors ${liked ? "bg-blue-600 text-white border-blue-600": "border-gray-300 text-gray-600 hover:border-blue-400"}`}    
                >
                    {liked? "liked" : "like"}
                </button>
                <span className="text-sm text-gray-500">{likeCount} likes</span>
            </div>
            <hr className="border-gray-200"/>
            {/* Comments section */}

            <div className="flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-gray-900">Comments ({topLevelComments.length})</h2>
            </div>

            {/* a comment form for logged in users */}
            {user && (
                
            )}
        </div>
    );
}
 
export default PostPage;