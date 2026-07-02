import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Search as SearchIcon, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PaginationMeta, Post } from '../types'
import { postsApi } from '../api/posts'
import APostCard from '../components/APostCard'
import SkeletonCard from '../components/SkeletonCard'
import { getPageNumbers } from '../utils/formatting'

const pageVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const SearchPage = () => {
  // the URL is the single source of truth — q and page both live in the query string,
  // so a search is shareable, bookmarkable, and works with the browser back button.
  const [searchParams, setSearchParams] = useSearchParams()
  const query       = searchParams.get('q')?.trim() ?? ''
  const currentPage = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)

  const [input, setInput]           = useState(query)
  const [posts, setPosts]           = useState<Post[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [retryTick, setRetryTick]   = useState(0)

  // keep the input box in sync when the URL changes (e.g. back button)
  useEffect(() => { setInput(query) }, [query])

  useEffect(() => {
    document.title = query ? `Search: ${query} — Z-Tales` : 'Search — Z-Tales'
    return () => { document.title = 'Z-Tales' }
  }, [query])

  useEffect(() => {
    if (!query) { setPosts([]); setPagination(null); return }

    // guard against a slow earlier request resolving after a newer one
    let cancelled = false
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await postsApi.search(query, currentPage, 12)
        if (cancelled) return
        setPosts(data.posts)
        setPagination(data.pagination)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [query, currentPage, retryTick])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setSearchParams({ q: trimmed })   // omitting page resets to page 1
  }

  const handlePageChange = (page: number) => {
    setSearchParams({ q: query, page: String(page) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <div className="page-wrapper py-10">

        <form onSubmit={handleSubmit} className="relative mb-8 max-w-xl">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Search tales by title or content..."
            autoFocus
            aria-label="Search tales"
            className="input-field pl-9"
          />
        </form>

        {!query ? (
          <div className="state-container">
            <p className="font-serif text-2xl text-primary mb-2">Search Z-Tales</p>
            <p className="font-sans text-sm text-muted">
              Find tales by title or content. Start typing above.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="state-container">
            <p className="font-serif text-xl text-primary mb-2">Something went wrong</p>
            <p className="meta-text mb-6">{error}</p>
            <button onClick={() => setRetryTick(t => t + 1)} className="btn-ghost gap-2">
              <RefreshCcw size={14} /> Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="state-container">
            <p className="font-serif text-2xl text-primary mb-2">No tales found</p>
            <p className="font-sans text-sm text-muted">
              Nothing matches “{query}”. Try a different word.
            </p>
          </div>
        ) : (
          <>
            <p className="meta-text uppercase tracking-widest mb-6">
              {pagination?.totalPosts ?? posts.length}{' '}
              {(pagination?.totalPosts ?? posts.length) === 1 ? 'result' : 'results'} for “{query}”
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => <APostCard key={post.id} post={post} />)}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  aria-disabled={!pagination.hasPrevPage}
                  tabIndex={!pagination.hasPrevPage ? -1 : undefined}
                  className="btn-ghost px-4 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getPageNumbers(currentPage, pagination.totalPages).map((page, i) =>
                  page === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 meta-text select-none">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      aria-current={page === currentPage ? 'page' : undefined}
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
                  aria-disabled={!pagination.hasNextPage}
                  tabIndex={!pagination.hasNextPage ? -1 : undefined}
                  className="btn-ghost px-4 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </motion.div>
  )
}

export default SearchPage
