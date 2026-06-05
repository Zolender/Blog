import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAppSelector } from "../app/hooks";
import type { User } from "../types";
import type { AdminPost } from "../api/admin";
import { adminApi } from "../api/admin";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { formatDate, getAvatarColor } from "../utils/formatting";
import SkeletonAdminCard from "../components/SkeletonAdminCard"
import SkeletonAdminTableRow from "../components/SkeletonAdminTableRow"

type Tab = "users" | "posts"

// ── Role toggle pill ──────────────────────────────────────────────────────────
const RoleToggle = ({
    user,
    updatingRoleId,
    onRoleChange,
}: {
    user: User
    updatingRoleId: number | null
    onRoleChange: (user: User, role: "user" | "admin") => void
}) => {
    const isUpdating = updatingRoleId === user.id
    return (
        <div className={`flex items-center rounded-sm border border-border overflow-hidden transition-opacity ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}>
            {(["user", "admin"] as const).map((role) => (
                <button
                    key={role}
                    type="button"
                    onClick={() => onRoleChange(user, role)}
                    className={`px-3 py-1 rounded-none font-sans text-xs font-medium transition-colors capitalize
                        ${user.role === role
                            ? role === "admin" ? "bg-accent text-white" : "bg-primary text-white"
                            : "bg-white text-muted hover:bg-surface"
                        }`}
                >
                    {role}
                </button>
            ))}
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────
const AdminPage = () => {
    const { user: currentUser } = useAppSelector((state) => state.auth)
    const { showToast } = useToast()

    const [activeTab, setActiveTab] = useState<Tab>("users")

    // Users state
    const [users, setUsers]               = useState<User[]>([])
    const [usersLoading, setUsersLoading] = useState(true)
    const [usersError, setUsersError]     = useState<string | null>(null)
    const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null)
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
    const [targetUser, setTargetUser]     = useState<User | null>(null)
    const [deleteUserOpen, setDeleteUserOpen] = useState(false)

    // Posts state
    const [posts, setPosts]               = useState<AdminPost[]>([])
    const [postsLoading, setPostsLoading] = useState(false)
    const [postsLoaded, setPostsLoaded]   = useState(false)
    const [postsError, setPostsError]     = useState<string | null>(null)
    const [deletingPostId, setDeletingPostId] = useState<number | null>(null)
    const [targetPost, setTargetPost]     = useState<AdminPost | null>(null)
    const [deletePostOpen, setDeletePostOpen] = useState(false)

    useEffect(() => {
        document.title = "Admin — Z-Tales"
        return () => { document.title = "Z-Tales" }
    }, [])

    // Load users on mount
    useEffect(() => {
        const fetch = async () => {
            setUsersLoading(true)
            setUsersError(null)
            try {
                const data = await adminApi.getUsers()
                setUsers(data.users)
            } catch (err) {
                setUsersError(err instanceof Error ? err.message : "Failed to load users")
            } finally {
                setUsersLoading(false)
            }
        }
        fetch()
    }, [])

    // Load posts lazily when the posts tab is first opened
    useEffect(() => {
        if (activeTab !== "posts" || postsLoaded) return
        const fetch = async () => {
            setPostsLoading(true)
            setPostsError(null)
            try {
                const data = await adminApi.getPosts()
                setPosts(data.posts)
                setPostsLoaded(true)
            } catch (err) {
                setPostsError(err instanceof Error ? err.message : "Failed to load posts")
            } finally {
                setPostsLoading(false)
            }
        }
        fetch()
    }, [activeTab, postsLoaded])

    // ── User handlers ─────────────────────────────────────────────────────────
    const handleDeleteUser = async () => {
        if (!targetUser) return
        setDeleteUserOpen(false)
        setDeletingUserId(targetUser.id)
        try {
            await adminApi.deleteUser(targetUser.id)
            setUsers(prev => prev.filter(u => u.id !== targetUser.id))
            showToast(`${targetUser.username} has been removed`)
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to delete user", "error")
        } finally {
            setDeletingUserId(null)
            setTargetUser(null)
        }
    }

    const handleRoleChange = async (user: User, newRole: "user" | "admin") => {
        if (newRole === user.role) return
        setUpdatingRoleId(user.id)
        try {
            const data = await adminApi.updataRole(user.id, newRole)
            setUsers(prev => prev.map(u => u.id === user.id ? data.user : u))
            showToast(`${user.username} is now ${newRole === "admin" ? "an admin" : "a user"}`)
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to update role", "error")
        } finally {
            setUpdatingRoleId(null)
        }
    }

    // ── Post handlers ─────────────────────────────────────────────────────────
    const handleDeletePost = async () => {
        if (!targetPost) return
        setDeletePostOpen(false)
        setDeletingPostId(targetPost.id)
        try {
            await adminApi.deletePost(targetPost.id)
            setPosts(prev => prev.filter(p => p.id !== targetPost.id))
            showToast(`"${targetPost.title}" has been removed`)
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to delete post", "error")
        } finally {
            setDeletingPostId(null)
            setTargetPost(null)
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    const tabCount = activeTab === "users" ? `${users.length} users` : `${posts.length} posts`

    return (
        <>
            <ConfirmModal
                isOpen={deleteUserOpen}
                title={`Delete ${targetUser?.username ?? "user"}`}
                message="Their account and all associated data will be permanently removed."
                confirmLabel="Delete"
                onConfirm={handleDeleteUser}
                onCancel={() => { setDeleteUserOpen(false); setTargetUser(null) }}
            />
            <ConfirmModal
                isOpen={deletePostOpen}
                title="Delete post"
                message="This post and all its comments will be permanently removed."
                confirmLabel="Delete"
                onConfirm={handleDeletePost}
                onCancel={() => { setDeletePostOpen(false); setTargetPost(null) }}
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="page-wrapper py-10 flex flex-col gap-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="heading-section">Admin Dashboard</h1>
                    {!usersLoading && !postsLoading && (
                        <span className="meta-text">{tabCount}</span>
                    )}
                </div>

                {/* Tab bar */}
                <div className="flex border-b border-border gap-0 -mb-2">
                    {(["users", "posts"] as const).map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 pb-3 font-sans text-sm font-medium capitalize transition-colors duration-200 cursor-pointer
                                ${activeTab === tab
                                    ? "text-primary border-b-2 border-primary -mb-px"
                                    : "text-muted hover:text-primary"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <hr className="divider" />

                {/* ── Users tab ─────────────────────────────────────────────── */}
                {activeTab === "users" && (
                    usersLoading ? (
                        <>
                            <div className="flex flex-col gap-3 sm:hidden">
                                {Array.from({ length: 5 }).map((_, i) => <SkeletonAdminCard key={i} />)}
                            </div>
                            <div className="hidden sm:block border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-surface border-b border-border">
                                        <tr>
                                            {["User", "Email", "Role", "Joined", "Actions"].map(h => (
                                                <th key={h} className="text-left px-4 py-3 meta-text font-medium uppercase tracking-wide text-xs!">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {Array.from({ length: 5 }).map((_, i) => <SkeletonAdminTableRow key={i} />)}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : usersError ? (
                        <div className="state-container">
                            <p className="font-serif text-xl text-primary mb-2">Failed to load users</p>
                            <p className="meta-text">{usersError}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="state-container">
                            <p className="meta-text italic">No users found.</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="flex flex-col gap-3 sm:hidden">
                                {users.map(user => {
                                    const isSelf = user.id === currentUser?.id
                                    return (
                                        <div key={user.id} className={`border border-border p-4 flex flex-col gap-4 ${isSelf ? "bg-surface" : "bg-white"}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`avatar ${getAvatarColor(user.username)}`}>
                                                    <span className="avatar-initial">{user.username.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-medium font-sans text-primary truncate">{user.username}</span>
                                                        {isSelf && <span className="badge text-xs!">you</span>}
                                                        {user.role === "admin" && <span className="badge-admin text-xs!">admin</span>}
                                                    </div>
                                                    <span className="meta-text truncate">{user.email}</span>
                                                    <span className="meta-text">Joined {formatDate(user.created_at)}</span>
                                                </div>
                                            </div>
                                            {!isSelf && (
                                                <div className="flex items-center justify-between gap-3 pt-1 border-t border-border">
                                                    <RoleToggle user={user} updatingRoleId={updatingRoleId} onRoleChange={handleRoleChange} />
                                                    <button
                                                        type="button"
                                                        onClick={() => { setTargetUser(user); setDeleteUserOpen(true) }}
                                                        disabled={deletingUserId === user.id}
                                                        className="btn-danger-solid rounded-sm px-3! py-1! text-xs! disabled:opacity-50"
                                                    >
                                                        {deletingUserId === user.id ? "Deleting..." : "Delete"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Desktop table */}
                            <div className="hidden sm:block border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-surface border-b border-border">
                                        <tr>
                                            {["User", "Email", "Role", "Joined", "Actions"].map(h => (
                                                <th key={h} className="text-left px-4 py-3 meta-text font-medium uppercase tracking-wide text-xs!">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {users.map(user => {
                                            const isSelf = user.id === currentUser?.id
                                            return (
                                                <tr key={user.id} className={`transition-colors ${isSelf ? "bg-surface" : "bg-white hover:bg-base"}`}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`avatar ${getAvatarColor(user.username)}`}>
                                                                <span className="avatar-initial">{user.username.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                            <span className="font-medium font-sans text-primary">{user.username}</span>
                                                            {isSelf && <span className="badge">you</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 meta-text">{user.email}</td>
                                                    <td className="px-4 py-3">
                                                        {isSelf ? <span className="badge-admin">{user.role}</span> : (
                                                            <RoleToggle user={user} updatingRoleId={updatingRoleId} onRoleChange={handleRoleChange} />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 meta-text">{formatDate(user.created_at)}</td>
                                                    <td className="px-4 py-3">
                                                        {isSelf ? <span className="meta-text">—</span> : (
                                                            <button
                                                                type="button"
                                                                onClick={() => { setTargetUser(user); setDeleteUserOpen(true) }}
                                                                disabled={deletingUserId === user.id}
                                                                className="btn-danger-solid rounded-sm px-3! py-1! text-xs! disabled:opacity-50"
                                                            >
                                                                {deletingUserId === user.id ? "Deleting..." : "Delete"}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )
                )}

                {/* ── Posts tab ─────────────────────────────────────────────── */}
                {activeTab === "posts" && (
                    postsLoading ? (
                        <>
                            <div className="flex flex-col gap-3 sm:hidden">
                                {Array.from({ length: 5 }).map((_, i) => <SkeletonAdminCard key={i} />)}
                            </div>
                            <div className="hidden sm:block border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-surface border-b border-border">
                                        <tr>
                                            {["Title", "Author", "Date", "Likes", "Comments", "Actions"].map(h => (
                                                <th key={h} className="text-left px-4 py-3 meta-text font-medium uppercase tracking-wide text-xs!">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {Array.from({ length: 5 }).map((_, i) => <SkeletonAdminTableRow key={i} />)}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : postsError ? (
                        <div className="state-container">
                            <p className="font-serif text-xl text-primary mb-2">Failed to load posts</p>
                            <p className="meta-text">{postsError}</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="state-container">
                            <p className="meta-text italic">No posts yet.</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="flex flex-col gap-3 sm:hidden">
                                {posts.map(post => (
                                    <div key={post.id} className="border border-border p-4 flex flex-col gap-3 bg-white">
                                        <div className="flex flex-col gap-0.5">
                                            <Link
                                                to={`/posts/${post.id}`}
                                                className="font-sans text-sm font-medium text-primary hover:text-accent transition-colors line-clamp-2"
                                            >
                                                {post.title}
                                            </Link>
                                            <p className="meta-text">
                                                by {post.author_username}
                                                <span className="mx-1.5 opacity-40">·</span>
                                                {formatDate(post.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between pt-1 border-t border-border">
                                            <div className="flex items-center gap-3 meta-text">
                                                <span className="flex items-center gap-1"><Heart size={12} /> {post.like_count}</span>
                                                <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comment_count}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setTargetPost(post); setDeletePostOpen(true) }}
                                                disabled={deletingPostId === post.id}
                                                className="btn-danger-solid rounded-sm px-3! py-1! text-xs! disabled:opacity-50"
                                            >
                                                {deletingPostId === post.id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop table */}
                            <div className="hidden sm:block border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-surface border-b border-border">
                                        <tr>
                                            {["Title", "Author", "Date", "Likes", "Comments", "Actions"].map(h => (
                                                <th key={h} className="text-left px-4 py-3 meta-text font-medium uppercase tracking-wide text-xs!">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {posts.map(post => (
                                            <tr key={post.id} className="bg-white hover:bg-base transition-colors">
                                                <td className="px-4 py-3 max-w-xs">
                                                    <Link
                                                        to={`/posts/${post.id}`}
                                                        className="font-medium font-sans text-primary hover:text-accent transition-colors line-clamp-1"
                                                    >
                                                        {post.title}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 meta-text">{post.author_username}</td>
                                                <td className="px-4 py-3 meta-text">{formatDate(post.created_at)}</td>
                                                <td className="px-4 py-3 meta-text">{post.like_count}</td>
                                                <td className="px-4 py-3 meta-text">{post.comment_count}</td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setTargetPost(post); setDeletePostOpen(true) }}
                                                        disabled={deletingPostId === post.id}
                                                        className="btn-danger-solid rounded-sm px-3! py-1! text-xs! disabled:opacity-50"
                                                    >
                                                        {deletingPostId === post.id ? "Deleting..." : "Delete"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )
                )}
            </motion.div>
        </>
    )
}

export default AdminPage
