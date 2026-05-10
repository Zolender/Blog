import { useEffect, useState } from "react";
import type { PaginationMeta, Post } from "../types";
import { postsApi } from "../api/posts";
import { Link } from "react-router";
import PostCard from "../components/postCard";


const FeedPage = () => {

    const [posts, setPosts] = useState<Post[]>([])
    const [pagination, setPagination] = useState<PaginationMeta | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    //every time the current page changes we fetch new data from the backend, new posts i mean
    useEffect(()=>{
        const fetchPosts = async () => {
            setIsLoading(true)
            setError(null)

            try{
                const data = await postsApi.getAll(currentPage, 10)
                setPosts(data.posts)
                setPagination(data.pagination)
            }catch(err){
                setError(err instanceof Error ? err.message : "Failed to load posts")
            }finally{
                setIsLoading(false)
            }
        }

        fetchPosts()
    }, [currentPage])

    //a way to scroll back to the top whenever the page changes
    const handlePageChange = (page: number)=>{
        setCurrentPage(page)
        window.scrollTo({top: 0, behavior: "smooth"})
    }

    if(isLoading){
        return (
            <div className="flex justify-center py-20">
                <p className="text-gray-400 text-sm">Loading posts...</p>
            </div>
        )
    }

    if(error){
        return (
            <div className="flex justify-center py-20">
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-gray-900">Latest Posts</h1>
            {/* in case we got no posts yet then */}
            {posts.length === 0? (
                <div className="py-20 text-center">
                    <p className="text-gray-400 text-sm">No posts yet. Be the first to write one.</p>
                    <Link to="/posts/new" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Write a post</Link>
                </div>
            ):(
                <div className="flex flex-col gap-4">
                    {posts.map(post=> <PostCard key={post.id} post={post}/>)}
                </div>
            )}
        </div>
    );
}
 
export default FeedPage;