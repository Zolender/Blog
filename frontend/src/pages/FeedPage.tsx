import { useEffect, useState } from "react";
import type { PaginationMeta, Post } from "../types";
import { postsApi } from "../api/posts";
import { Link } from "react-router";
import PostCard from "../components/postCard";
import SkeletonCard from "../components/SkeletonCard";


const pageVariants = {
    hidden: {opacity: 0, y: 10},
    visible: {opacity: 1, y: 0, transtion: {duration: 0.3}}
}

const avatarColors = [
    'bg-teal-700', 'bg-violet-600', 'bg-amber-600',
    'bg-rose-600', 'bg-sky-600', 'bg-emerald-700'
]

const getAvatarColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return avatarColors[hash % avatarColors.length]
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })


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
            <div className="page-wrapper py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({length: 6}).map((_,i)=> <SkeletonCard key={i}/>)}
                </div>
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
                <>
                    <div className="flex flex-col gap-4">
                        {posts.map(post=> <PostCard key={post.id} post={post}/>)}
                    </div>

                     {/* a way of dealing wit the pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex imtes-center justify-center gap-2 pt-4">
                            <button onClick={()=> handlePageChange(currentPage - 1)} disabled={!pagination.hasPrevPage} className="pz-3 py1 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                Previous
                            </button>
                            {/* creating the numbered buttons to go from a page to another */}
                            
                            {Array.from({length: pagination.totalPages}, (_, i)=> i+1).map(page=>(
                                <button key={page} onClick={()=> handlePageChange(page)} className={`px-3 py-1 text-sm border rounded-sm ${page===currentPage ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"}`}>{page}</button>
                            ))}

                            <button onClick={()=> handlePageChange(currentPage + 1)} disabled={!pagination.hasNextPage} className="px-3 py-1 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
                        </div>
                    )}
                    {/* a small summary section  */}
                    {pagination && (
                        <p className="text-center text-xs text-gray-400">
                            Showing {(currentPage - 1) * pagination.limit + 1}-{Math.min(currentPage * pagination.limit, pagination.totalPosts)} of {" "} {pagination.totalPosts} posts
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
 
export default FeedPage;