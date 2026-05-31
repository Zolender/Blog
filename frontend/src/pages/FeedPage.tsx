import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Heart, MessageCircle, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PaginationMeta, Post } from '../types'
import { postsApi } from '../api/posts'
import APostCard from '../components/APostCard'
import SkeletonCard from '../components/SkeletonCard'
import PullQuote from '../components/PullQuote'
import { getAvatarColor, formatDate, stripMarkdown, getPageNumbers } from '../utils/formatting'

const pageVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const FeedPage = () => {
  const [posts, setPosts]           = useState<Post[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [showSlowMessage, setShowSlowMessage] = useState(false)
  const fetchPosts = async (page: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await postsApi.getAll(page, 10)
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(()=>{
    if(!isLoading){setShowSlowMessage(false); return}
    const timer = setTimeout(()=> setShowSlowMessage(true), 3000)
    return ()=> clearTimeout(timer)
  }, [isLoading])

  useEffect(() => { fetchPosts(currentPage) }, [currentPage])

  useEffect(() => {
    document.title = 'Z-Tales — A sanctuary for the literate mind'
    return () => { document.title = 'Z-Tales' }
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading && posts.length === 0) {
    return (
      <div className="page-wrapper py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        {showSlowMessage && (
          <p className="text-center meta-text mt-8">
            Waking up the server, this may take a moment...
          </p>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-wrapper state-container">
        <p className="font-serif text-xl text-primary mb-2">Something went wrong</p>
        <p className="meta-text mb-6">{error}</p>
        <button onClick={() => fetchPosts(currentPage)} className="btn-ghost gap-2">
          <RefreshCcw size={14} /> Try again
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="page-wrapper state-container">
        <p className="font-serif text-2xl text-primary mb-2">No tales yet</p>
        <p className="font-sans text-sm text-muted mb-6">
          Be the first to write something worth reading.
        </p>
        <Link to="/posts/new" className="btn-primary">Write a post</Link>
      </div>
    )
  }

  const [hero, ...rest] = posts
  const heroStripped = stripMarkdown(hero.content)
  const heroExcerpt = heroStripped.slice(0, 200)
  const heroQuote = heroStripped.slice(0, 120).trim()

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <div className="page-wrapper py-10">

        <Link to={`/posts/${hero.id}`} className="card block mb-12 group">
          {hero.banner_image ? (
            <img
              src={hero.banner_image}
              alt={hero.title}
              className="w-full h-72 object-cover"
            />
          ) : (
            <div className="w-full h-72 bg-surface flex items-center justify-center">
              <span className="font-serif text-7xl font-bold text-border select-none">
                {hero.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="p-6 sm:p-8">
            <p className="meta-text uppercase tracking-widest mb-3">
              Featured <span className="mx-2">·</span> {formatDate(hero.created_at)}
            </p>
            <h1 className="heading-hero mb-3 group-hover:text-accent transition-colors duration-200">
              {hero.title}
            </h1>
            <p className="font-sans text-sm text-muted leading-relaxed line-clamp-2 mb-5">
              {heroExcerpt}{heroStripped.length > 200 ? '...' : ''}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`avatar ${getAvatarColor(hero.author_username)}`}>
                  <span className="avatar-initial">
                    {hero.author_username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-sans text-xs font-medium text-primary">
                  {hero.author_username}
                </span>
              </div>
              <div className="flex items-center gap-3 meta-text">
                <span className="flex items-center gap-1">
                  <Heart size={12} /> {hero.like_count}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={12} /> {hero.comment_count}
                </span>
              </div>
            </div>
          </div>
        </Link>

        <PullQuote quote={heroQuote} />

        {(rest.length > 0 || isLoading) && (
          <>
            <p className="meta-text uppercase tracking-widest mb-6">Curated Feed</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : rest.map(post => <APostCard key={post.id} post={post} />)
              }
            </div>
          </>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn-ghost px-4 py-1.5 text-xs"
            >
              Previous
            </button>

            {getPageNumbers(currentPage, pagination.totalPages).map((page, i) =>
              page === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 meta-text select-none">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 font-sans text-xs border transition-colors duration-200 cursor-pointer
                    ${page === currentPage
                      ? 'bg-accent text-white border-accent'
                      : 'border-border text-primary hover:bg-surface'
                    }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="btn-ghost px-4 py-1.5 text-xs"
            >
              View More Essays
            </button>
          </div>
        )}

        {pagination && (
          <p className="text-center meta-text mt-4">
            Showing{' '}
            {(currentPage - 1) * pagination.limit + 1}–
            {Math.min(currentPage * pagination.limit, pagination.totalPosts)}{' '}
            of {pagination.totalPosts} posts
          </p>
        )}

      </div>
    </motion.div>
  )
}

export default FeedPage