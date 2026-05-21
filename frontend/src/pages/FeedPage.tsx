import { useEffect, useState } from "react";
import type { PaginationMeta, Post } from "../types";
import { postsApi } from "../api/posts";
import { Link } from "react-router";
import PostCard from "../components/postCard";
import SkeletonCard from "../components/SkeletonCard";
import { RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import PullQuote from "../components/PullQuote";


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
    const fetchPosts = async (page: number) => {
            setIsLoading(true)
            setError(null)

            try{
                const data = await postsApi.getAll(page, 10)
                setPosts(data.posts)
                setPagination(data.pagination)
            }catch(err){
                setError(err instanceof Error ? err.message : "Failed to load posts")
            }finally{
                setIsLoading(false)
            }
        }

    useEffect(()=>{
        fetchPosts(currentPage)
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
            <div className="page-wrapper state-container">
                <p className="font-serif text-xl text-primary mb-2">Something went wrong</p>
                <p className="meta-text mb-6">{error}</p>
                <button onClick={()=> fetchPosts(currentPage)} className="btn-ghost gap-2">
                    <RefreshCcw size={14}/> Try again
                </button>
            </div>
        )
    }

    if(posts.length ===0 ){
        return (
            <div className="page-wrapper state-container">
                <p className="font-serif text-2xl text-primary mb-2">Not tales yet</p>
                <p className="font-sans text-sm text-muted mb-6">
                    be the first to write something worth reading.
                </p>
                <Link to="/posts/new" className="btn-primary">Write a post</Link>
            </div>
        )
    }

    const [hero, ...rest] = posts

    return (
        <motion.div variants={pageVariants} initial="hidden" animate='visible'>
            <div className="page-wrapper py-10">

                <Link to={`/posts/${hero.id}`} className="card block mb-12 group">
                    {hero.banner_image ? (
                        <img
                            src={hero.banner_image}
                            alt={hero.title}
                            className="w-full h-72 object-cover"
                        />
                    ): (
                        <div className="w-full h-72 bg-surface flex items-center justify-center">
                            <span className="font-serif text-7xl font-bold text-border select-none">
                                {hero.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="p-6 sm:p-8">
                        <p className="meta-text uppercase tracking-widest mb-3">
                            Featured <span className="mx-2">.</span>
                            {formatDate(hero.created_at)}
                        </p>
                        <h1 className="heading-hero mb-3 group-hover:text-accent transition-colors duration-200">{hero.title}</h1>
                        <p className="font-sans text-sm text-muted leading-relaxed line-clamp-2 mb-5">
                            {hero.content.slice(0,200)}{hero.content.length > 200 ? "...": ""}
                        </p>
                        <div className="flex items-center gap-2">
                            <div className={`avatar ${getAvatarColor(hero.author_username)}`}>
                                <span className="avatar-initial">
                                    {hero.author_username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="font-sans text-xs font-medium text-primary">{hero.author_username}</span>
                        </div>
                    </div>
                </Link>

                <PullQuote/>

                {rest.length > 0 && (
                    <>
                        <p className="meta-text uppercase tracking-widest mb-6">Curate feed</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rest.map((post)=> <PostCard key={post.id} post={post}/>)}
                        </div>
                    </>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                        <button 
                            className="btn-ghost px-4 py-1.5 text-xs"
                            onClick={()=> handlePageChange(currentPage -1)}
                            disabled={!pagination.hasPrevPage}
                        >
                            Previous
                        </button>

                        {Array.from({length: pagination.totalPages}, (_, i)=> i + 1).map(page=> (
                            <button 
                                className={`w-8 h-8 font-sans text-xs border transition-colors duration-200 ${page === currentPage? "bg-accent text-white border-accent": "border-border text-primary hover:bg-surface"}`}
                                key={page}
                                onClick={()=> handlePageChange(page)}
                                
                            >
                                {page}
                            </button>
                        ))}

                        <button 
                            className="btn-ghost px-4 py-1.5 text-xs"
                            onClick={()=> handlePageChange(currentPage +1)}
                            disabled={!pagination.hasNextPage}
                        >
                            View More Essays
                        </button>
                    </div>
                )}


                {pagination && (
                    <p className="text-center meta-text mt-4">
                        Showing {" "} {(currentPage-1) * pagination.limit + 1}-{Math.min(currentPage * pagination.limit, pagination.totalPosts)}{" "} or {pagination.totalPosts}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
 
export default FeedPage;