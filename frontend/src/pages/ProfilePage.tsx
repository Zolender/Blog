import { useEffect, useRef, useState } from "react"
import { useParams, Link } from "react-router"
import { motion } from "framer-motion"
import { Settings2, PenLine } from "lucide-react"
import type { PublicUser, Post, PaginationMeta } from "../types"
import { usersApi } from "../api/users"
import { useAppSelector } from "../app/hooks"
import APostCard from "../components/APostCard"
import SkeletonCard from "../components/SkeletonCard"
import { formatDate, getAvatarColor, getPageNumbers } from "../utils/formatting"

const pageVariants = {
    hidden:  { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const ProfilePage = () => {
    const { username }  = useParams()
    const currentUser   = useAppSelector(state => state.auth.user)
    const isOwnProfile  = currentUser?.username === username

    const [profile, setProfile]         = useState<PublicUser | null>(null)
    const [posts, setPosts]             = useState<Post[]>([])
    const [pagination, setPagination]   = useState<PaginationMeta | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading]     = useState(true)
    const [error, setError]             = useState<string | null>(null)
    // Flaw 3: track broken avatar URL so we can fall back to the initial letter
    const [avatarError, setAvatarError] = useState(false)

    // Flaw 4: reset page and clear profile when navigating to a different user
    const prevUsernameRef = useRef(username)
    useEffect(() => {
        if (prevUsernameRef.current !== username) {
            prevUsernameRef.current = username
            setCurrentPage(1)
            setProfile(null)
            setPosts([])
            setPagination(null)
            setAvatarError(false)
        }
    }, [username])

    useEffect(() => {
        const load = async () => {
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
        load()
    }, [username, currentPage])

    useEffect(() => {
        if (profile) document.title = `${profile.username} — Z-Tales`
        return () => { document.title = "Z-Tales" }
    }, [profile])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Full-page skeleton: only on first load or when switching to a new profile
    if (isLoading && !profile) return (
        <div>
            <div className="bg-surface border-b border-border">
                <div className="page-wrapper py-10">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                        <div className="skeleton w-20 h-20 rounded-full shrink-0" />
                        <div className="flex flex-col gap-2.5 mt-1 flex-1">
                            <div className="skeleton h-6 w-44" />
                            <div className="skeleton h-3.5 w-80" />
                            <div className="skeleton h-3.5 w-56" />
                            <div className="skeleton h-3 w-40 mt-1" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="page-wrapper py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
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

    const postCount = pagination?.totalPosts ?? 0

    return (
        <motion.div variants={pageVariants} initial="hidden" animate="visible">

            {/* ── Profile header ─────────────────────────────────── */}
            <div className="bg-surface border-b border-border">
                <div className="page-wrapper py-10">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-5">

                        {/* Avatar */}
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(profile.username)}`}>
                            {profile.profile_pic && !avatarError ? (
                                <img
                                    src={profile.profile_pic}
                                    alt={profile.username}
                                    className="w-full h-full rounded-full object-cover"
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <span className="text-white font-sans text-3xl font-semibold select-none">
                                    {profile.username.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Identity */}
                        <div className="flex-1 min-w-0">

                            {/* Name row + edit action */}
                            <div className="flex items-start justify-between gap-4">
                                <h1 className="heading-section">{profile.username}</h1>
                                {isOwnProfile && (
                                    <Link
                                        to="/settings"
                                        className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs shrink-0"
                                    >
                                        <Settings2 size={12} />
                                        Edit profile
                                    </Link>
                                )}
                            </div>

                            {/* Bio */}
                            {profile.bio ? (
                                <p className="font-sans text-sm text-primary leading-relaxed max-w-xl mt-2">
                                    {profile.bio}
                                </p>
                            ) : isOwnProfile ? (
                                <p className="font-sans text-sm text-muted leading-relaxed mt-2 italic">
                                    No bio yet.{" "}
                                    <Link
                                        to="/settings"
                                        className="underline underline-offset-2 hover:text-primary transition-colors duration-150 cursor-pointer"
                                    >
                                        Add one in settings
                                    </Link>
                                </p>
                            ) : null}

                            {/* Stats */}
                            <p className="meta-text mt-3">
                                {postCount} {postCount === 1 ? "post" : "posts"}
                                <span className="mx-2 opacity-40">·</span>
                                Member since {formatDate(profile.created_at, { month: "long", year: "numeric" })}
                            </p>

                        </div>
                    </div>
                </div>
            </div>

            {/* ── Posts section ──────────────────────────────────── */}
            {/* Flaw 5: only skeleton the grid when paginating — header stays visible */}
            <div className="page-wrapper py-12">

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="state-container">
                        {isOwnProfile ? (
                            <>
                                <p className="font-serif text-xl text-primary mb-2">
                                    Your page is ready.
                                </p>
                                <p className="meta-text mb-6 max-w-xs text-center">
                                    You haven't published anything yet. Write your first post and let people find you here.
                                </p>
                                <Link
                                    to="/posts/new"
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    <PenLine size={13} />
                                    Write your first post
                                </Link>
                            </>
                        ) : (
                            <>
                                <p className="font-serif text-xl text-primary mb-2">Nothing here yet</p>
                                <p className="meta-text">
                                    {profile.username} hasn't written anything here.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map(post => <APostCard key={post.id} post={post} />)}
                    </div>
                )}

                {/* Flaw 5 (aria): disabled buttons get aria-disabled + tabIndex so keyboard users can't activate them */}
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
                            page === "..." ? (
                                <span key={`e-${i}`} className="px-2 meta-text select-none">…</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page as number)}
                                    aria-current={page === currentPage ? "page" : undefined}
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
                            aria-disabled={!pagination.hasNextPage}
                            tabIndex={!pagination.hasNextPage ? -1 : undefined}
                            className="btn-ghost px-4 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
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
