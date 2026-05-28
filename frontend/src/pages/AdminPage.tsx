import { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import type { User } from "../types";
import { adminApi } from "../api/admin";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { motion } from "framer-motion";
import { formatDate, getAvatarColor } from "../utils/formatting";
import SkeletonAdminCard from "../components/SkeletonAdminCard"
import SkeletonAdminTableRow from "../components/SkeletonAdminTableRow"

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
                            ? role === "admin"
                                ? "bg-accent text-white"
                                : "bg-primary text-white"
                            : "bg-white text-muted hover:bg-surface"
                        }`}
                >
                    {role}
                </button>
            ))}
        </div>
    )
}


const AdminPage = () => {
    const { user: currentUser } = useAppSelector((state) => state.auth)
    const { showToast } = useToast()

    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading]= useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [targetUser, setTargetUser] = useState<User | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)

    useEffect(() => {
        document.title = "Admin — Z-Tales"
        return () => { document.title = "Z-Tales" }
    }, [])

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const data = await adminApi.getUsers()
                setUsers(data.users)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load users")
            } finally {
                setIsLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const openDeleteConfirm = (user: User) => {
        setTargetUser(user)
        setDeleteOpen(true)
    }

    const handleDelete = async () => {
        if (!targetUser) return
        setDeleteOpen(false)
        setDeletingId(targetUser.id)
        try {
            await adminApi.deleteUser(targetUser.id)
            setUsers((prev) => prev.filter(u => u.id !== targetUser.id))
            showToast(`${targetUser.username} has been removed`)
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to delete user", "error")
        } finally {
            setDeletingId(null)
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

    if (isLoading) return (
        <div className="page-wrapper py-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="h-7 skeleton w-48" />
                <div className="h-3 skeleton w-20" />
            </div>
            <div className="border-t border-border" />
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
        </div>
    )

    if (error) return (
        <div className="state-container">
            <p className="error-banner">{error}</p>
        </div>
    )

    return (
        <>
            <ConfirmModal
                isOpen={deleteOpen}
                title={`Delete ${targetUser?.username ?? "user"}`}
                message="Their account and all associated data will be permanently removed."
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => {
                    setDeleteOpen(false)
                    setTargetUser(null)
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="page-wrapper py-10 flex flex-col gap-6"
            >
                <div className="flex items-center justify-between">
                    <h1 className="heading-section">Admin Dashboard</h1>
                    <span className="meta-text">{users.length} users total</span>
                </div>
                <hr className="divider" />

                {users.length === 0 ? (
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
                                    <div
                                        key={user.id}
                                        className={`border border-border p-4 flex flex-col gap-4 ${isSelf ? "bg-surface" : "bg-white"}`}
                                    >
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
                                                <RoleToggle
                                                    user={user}
                                                    updatingRoleId={updatingRoleId}
                                                    onRoleChange={handleRoleChange}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => openDeleteConfirm(user)}
                                                    disabled={deletingId === user.id}
                                                    className="btn-danger-solid rounded-sm px-3! py-1! text-xs! disabled:opacity-50"
                                                >
                                                    {deletingId === user.id ? "Deleting..." : "Delete"}
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
                                            <tr
                                                key={user.id}
                                                className={`transition-colors ${isSelf ? "bg-surface" : "bg-white hover:bg-base"}`}
                                            >
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
                                                    {isSelf ? (
                                                        <span className="badge-admin">{user.role}</span>
                                                    ) : (
                                                        <RoleToggle
                                                            user={user}
                                                            updatingRoleId={updatingRoleId}
                                                            onRoleChange={handleRoleChange}
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 meta-text">{formatDate(user.created_at)}</td>
                                                <td className="px-4 py-3">
                                                    {isSelf ? (
                                                        <span className="meta-text">—</span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteConfirm(user)}
                                                            disabled={deletingId === user.id}
                                                            className="btn-danger-solid rounded-sm px-3! py-1! text-xs! disabled:opacity-50"
                                                        >
                                                            {deletingId === user.id ? "Deleting..." : "Delete"}
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
                )}
            </motion.div>
        </>
    )
}

export default AdminPage