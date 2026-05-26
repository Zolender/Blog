import { Link, useNavigate, useParams } from "react-router";
import { useAppSelector } from "../app/hooks";
import { useEffect, useState } from "react";
import type { Post, Comment } from "../types";
import { postsApi } from "../api/posts";
import CommentItem from "../components/CommentItem";
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { motion } from "framer-motion";
import { formatDate, getAvatarColor, getReadTime } from "../utils/formatting";
import { Edit2, Heart, MessageCircle, Trash2 } from "lucide-react";


const PostPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const {user} = useAppSelector((state)=> state.auth)
    const {showToast} = useToast()

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

    const [deletePostOpen, setDeletePostOpen] = useState(false)


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

    //the docs title
    useEffect(()=>{
        if(post)document.title = `${post.title}- Z-Tales`
        return ()=> {
            document.title = "Z-Tales"
        }
    }, [post])


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
        try{
            await postsApi.delete(Number(id))
            showToast("Post deleted successfully")
            navigate("/")
        }catch(err){
            showToast(err instanceof Error ? err.message: "Failed to delete post", "error")
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
            showToast(err instanceof Error? err.message: "Failed to add reply", "error")
        }finally{
            setReplyLoading(false)
        }
    }


    //deleting a comment, would need an handler as well
    const handleDeleteComment = async (commentId: number)=>{
        try{
            await postsApi.deleteComment(Number(id), commentId)
            //we would remove it from the local state without refetching again
            setComments((prev)=> prev.filter((c)=> c.id!==commentId))
        }catch(err){
            showToast(err instanceof Error? err.message: "Failed to delete comment", "error")
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
            <div className="state-container">
                <p className="meta-text">Loading Post...</p>
            </div>
        )
    }

    if(error || !post){
        return (
            <div className="state-container">
                <p className="error-banner">{error?? "Post not found"}</p>
            </div>
        )
    }
    
    return (
        <>
            <ConfirmModal
                isOpen = {deletePostOpen}
                title="Delete post"
                message="This post and all its comments will be permanently removed."
                confirmLabel="Delete"
                onConfirm={handleDeletePost}
                onCancel={()=> setDeletePostOpen(false)}
            />

            <motion.article
                initial={{ opacity: 0, y: 10}}
                animate={{ opacity: 1, y: 0}}
                transition={{ duration: 0.3}}
                className="reading-column py-10 flex flex-col gap-8"
            >
                {post.banner_image && (
                    <img 
                        src={post.banner_image}
                        alt={post.title}
                        className="w-full h-64 sm:h-80 object-cover"
                    />
                )}

                <div className="flex flex-col gap-4">
                    <h1 className="heading-hero">{post.title}</h1>
                
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`avatar-md ${getAvatarColor(post.author_username)}`}>
                                <span className="avatar-initial text-sm!">
                                    {post.author_username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        

                            <div className="flex flex-col">
                                <span className="text-sm font-medium font-sans text-primary">{post.author_username}</span>
                                <span className="meta-text">{formatDate(post.created_at)} · {getReadTime(post.content)}</span>
                            </div>
                        </div>

                        {canModifyPost && (
                            <div className="flex items-center gap-3">
                                <Link to={`/posts/${post.id}/edit`} className="flex items-center gap-1.5 meta-text hover:text-accent transition-colors">
                                    <Edit2 size={14}/> <span className="text-xs">Edit</span>
                                </Link>
                                <button type="button" onClick={()=> setDeletePostOpen(true)} className="flex items-center gap-1.5 btn-danger text-xs!">
                                    <Trash2 size={14}/> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="divider" />

                {/* body of the post now */}
                <div className="prose">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </div>

                <hr className="divider" />
                
                <div className="flex items-center gap-4">
                    <motion.button
                        type="button"
                        onClick={handleLike}
                        whileTap={{scale: 0.85}}
                        transition={{ type: 'spring', stiffness: 400, damping: 17}}
                        aria-label={liked? "Unlike post": "Like post"}
                        className={`flex items-center gap-2 transition-colors ${liked? "text-danger": "text-muted hover:text-danger"}`}
                    >
                        <Heart size={18}
                            className="transition-all"
                            fill={liked? "currentColor": "none"}
                            strokeWidth={liked? 0 : 1.5}
                        />
                        <span className="text-sm font-sans">{likeCount}</span>
                    </motion.button>

                    <div className="flex items-center gap-2 text-muted">
                        <MessageCircle size={18} strokeWidth={1.5}/>
                        <span className="text-sm font-sans">{topLevelComments.length}</span>
                    </div>
                </div>

                <hr className="divider" />

                    {/* comments */}
                <div className="flex flex-col gap-6">
                        <h2 className="heading-section text-lg">
                            Comments ({topLevelComments.length})
                        </h2>
                        {user? (
                            <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                                <textarea
                                    value={commentContent}
                                    onChange={(e)=> setCommentContent(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={3}
                                    className="input-field resize-none"
                                />

                                {commentError && (
                                    <p role="alert" className="text-danger">{commentError}</p>
                                )}
                                <button type="submit" disabled={commentLoading || !commentContent.trim()} className="btn-primary self-end py-1.5! px-4! text-xs!">
                                    {commentLoading? "Posting": "Post comment"}
                                </button>
                            </form>
                        ): (
                            <p className="meta-text">
                                <Link to="/login" className="text-accent hover:underline underline-offset-2">Sign in</Link> {" "}to leave a comment
                            </p>
                        )}

                        {topLevelComments.length===0 ? (
                            <p className="meta-text italic">No comments yet. You may be the first to write one.</p>
                        ): (
                            <div className="flex flex-col gap-6">
                                {topLevelComments.map(comment => (
                                    <div key={comment.id} className="flex flex-col gap-4">
                                        <CommentItem
                                            comment={comment}
                                            canModify={!!canModifyComment(comment)}
                                            onDelete={()=> handleDeleteComment(comment.id)}
                                            onReply={()=> {
                                                setReplyingTo(replyingTo === comment.id? null : comment.id)
                                                setReplyContent("")
                                            }}
                                            showReplyButton={!!user}
                                        />

                                        {replyingTo === comment.id && (
                                            <form onSubmit={e=> handleAddReply(e, comment.id)} className="ml-10 border-l-2 border-border pl-4 flex flex-col gap-2">
                                                <textarea
                                                    value={replyContent}
                                                    onChange={e=> setReplyContent(e.target.value)}
                                                    placeholder={`Replying to ${comment.author_username}...`}
                                                    rows={2}
                                                    className="input-field resize-none text-sm"
                                                />

                                                <div className="flex gap-2 self-end">
                                                    <button
                                                        type="button"
                                                        onClick={()=> setReplyingTo(null)}
                                                        className="btn-ghost px-3! py-1! text-xs!"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={replyLoading || !replyContent.trim()}
                                                        className="btn-primary px-3! py-1! text-xs!"
                                                    >
                                                        {replyLoading? "Posting...": "Reply"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {getReplies(comment.id).map(reply=>(
                                            <div key={reply.id} className="ml-10 border-l-2 border-border pl-4">
                                                <CommentItem
                                                    comment={reply}
                                                    canModify={!!canModifyComment(reply)}
                                                    onDelete={()=> handleDeleteComment(reply.id)}
                                                    showReplyButton={false}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
            </motion.article>
            
        </>
    );
}
 
export default PostPage;