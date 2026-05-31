import { useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { motion } from "framer-motion"
import type { PublicUser, Post, PaginationMeta } from "../types"
import { usersApi } from "../api/users"
import APostCard from "../components/APostCard"
import SkeletonCard from "../components/SkeletonCard"
import { formatDate, getAvatarColor, getPageNumbers } from "../utils/formatting"

const pageVariants = {
    hidden:  { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const ProfilePage = () => {
    const { username } = useParams()
    const [profile, setProfile]       = useState<PublicUser | null>(null)
    const [posts, setPosts]           = useState<Post[]>([])
    const [pagination, setPagination] = useState<PaginationMeta | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading]   = useState(true)
    const [error, setError]           = useState<string | null>(null)

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const data = await usersApi.getProfile(username!, currentPage)
                setProfile(data.user)
                setPosts(data.posts)
                setPagination(data.pagination)
            } catch (err) {
                setError(err instanceof Error ? err.message : "User not found")
            } finally {
                setIsLoading(false)
            }
        }
        fetch()
    }, [username, currentPage])

    useEffect(() => {
        if (profile) document.title = `${profile.username} — Z-Tales`
        return () => { document.title = "Z-Tales" }
    }, [profile])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    if (isLoading) return (
        <div className="page-wrapper py-12">
            <div className="flex items-center gap-5 mb-10">
                <div className="skeleton w-16 h-16 rounded-full" />
                <div className="flex flex-col gap-2">
                    <div className="skeleton h-5 w-32" />
                    <div className="skeleton h-3 w-48" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
        </div>
    )

    if (error || !profile) return (
        <div className="page-wrapper state-container">
            <p className="font-serif text-xl text-primary mb-2">
                {error ?? "User not found"}
            </p>
            <Link to="/" className="btn-ghost mt-4">Back to feed</Link>
        </div>
    )

    return (
        <motion.div variants={pageVariants} initial="hidden" animate="visible">
            <div className="page-wrapper py-12">

                <div className="flex items-start gap-5 mb-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(profile.username)}`}>
                        {profile.profile_pic ? (
                            <img
                                src={profile.profile_pic}
                                alt={profile.username}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-white font-sans text-2xl font-semibold">
                                {profile.username.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <h1 className="heading-section">{profile.username}</h1>
                        {profile.bio && (
                            <p className="font-sans text-sm text-primary leading-relaxed max-w-lg">
                                {profile.bio}
                            </p>
                        )}
                        <p className="meta-text mt-1">
                            {pagination?.totalPosts ?? 0} {pagination?.totalPosts === 1 ? "post" : "posts"}
                            <span className="mx-2">·</span>
                            Member since {formatDate(profile.created_at, { month: "long", year: "numeric" })}
                        </p>
                    </div>
                </div>

                <hr className="divider mb-10" />

                {posts.length === 0 ? (
                    <div className="state-container">
                        <p className="font-serif text-xl text-primary mb-2">No posts yet</p>
                        <p className="meta-text">
                            {profile.username} hasn't written anything here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map(post => <APostCard key={post.id} post={post} />)}
                    </div>
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
                            page === "..." ? (
                                <span key={`e-${i}`} className="px-2 meta-text select-none">…</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-8 h-8 font-sans text-xs border transition-colors duration-200 cursor-pointer
                                        ${page === currentPage
                                            ? "bg-accent text-white border-accent"
                                            : "border-border text-primary hover:bg-surface"
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
                            Next
                        </button>
                    </div>
                )}

            </div>
        </motion.div>
    )
}

export default ProfilePage
