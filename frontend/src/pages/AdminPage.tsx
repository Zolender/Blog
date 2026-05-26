import { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import type { User } from "../types";
import { adminApi } from "../api/admin";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { motion } from "framer-motion";
import { formatDate, getAvatarColor } from "../utils/formatting";


const AdminPage = () => {
    const {user: currentUser} = useAppSelector((state)=> state.auth)
    const {showToast} = useToast()

    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [targetUser, setTargetUser] = useState<User | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)


    useEffect(()=> {
        document.title = "Admin - Z-Tales"
        return()=> {document.title = "Z-Tales"}
    }, [])

    useEffect(()=>{
        const fetchUsers = async()=>{
            setIsLoading(true)
            setError(null)

            try{
                const data = await adminApi.getUsers()
                setUsers(data.users)
            }catch(err){
                setError(err instanceof Error ? err.message : "Failed to load users")
            }finally{
                setIsLoading(false)
            }
        }
            fetchUsers()

    }, [])


    const openDeleteConfirm = (user: User)=> {
        setTargetUser(user)
        setDeleteOpen(true)
    }

    const handleDelete = async ()=>{
        if(!targetUser) return        
        setDeleteOpen(false)
        setDeletingId(targetUser.id)
        
        try{
            await adminApi.deleteUser(targetUser.id)
            //without refreshing set the userlist to... u know what i mean
            setUsers((prev)=> prev.filter(user=> user.id!==targetUser.id))
            showToast(`${targetUser.username} has been removed`)
        }catch(err){
            showToast(err instanceof Error? err.message : "Failed to delete user", "error")
        }finally{
            setDeletingId(null)
            setTargetUser(null)
        }
    }


    const handleRoleChange =  async (user: User, newRole: "user" | "admin")=>{
        if(newRole === user.role)return
        setUpdatingRoleId(user.id)

        try{
            const data = await adminApi.updataRole(user.id, newRole)
            setUsers(prev=> prev.map(u=> u.id === user.id? data.user: u))
            showToast(`${user.username} is now ${newRole === 'admin' ? "an admin" : "a user"}`)
        }catch(err){
            showToast(err instanceof Error? err.message : "Failed to update role", "error")
        }finally{
            setUpdatingRoleId(null)
        }
    }


    if(isLoading){
        return (
            <div className="state-container">
                <p className="meta-text">Loading users...</p>
            </div>
        )
    }

    if(error){
        return (
            <div className="state-container">
                <p className="error-banner">{error}</p>
            </div>
            )
        }



        return (
            <>
                <ConfirmModal 
                    isOpen={deleteOpen}
                    title={`Delete ${targetUser?.username ?? "user"}`}
                    message="Their account and all associated data will be permanently removed."
                    confirmLabel="Delete"
                    onConfirm={handleDelete}
                    onCancel={()=> {
                        setDeleteOpen(false)
                        setTargetUser(null)
                    }}
                />
                <motion.div
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{ duration: 0.3}}
                    className="page-wrapper py-10 flex flex-col gap-6"
                >

                    <div className="flex items-center justify-between">
                        <h1 className="heading-section">Admin Dashboard</h1>
                        <span className="meta-text">{users.length}</span>
                    </div>
                    <hr className="divider" />

                    {users.length === 0 ? (
                        <div className="state-container">
                            <p className="meta-text italic">No users found.</p>
                        </div>
                    ): (
                        <>
                             {/* on mobile we shall have them listed in a card layout */}

                            <div className="flex flex-col gap-3 sm:hidden">
                                {users.map(user => {
                                    const isSelf = user.id === currentUser?.id
                                    return (
                                        <div
                                            key={user.id} 
                                            className={`border border-border p-4 flex flex-col gap-3 ${isSelf ? "bg-surface": "bg-white"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`avatar ${getAvatarColor(user.username)}`}>
                                                    <span className="avatar-initial">{user.username.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-medium font-sans text-primary truncate">{user.username}</span>
                                                        {isSelf && <span className="badge text-xs!">you</span>}
                                                        {user.role === "admin" && (
                                                            <span className="badge-admin text-xs!">admin</span>
                                                        )}
                                                    </div>
                                                    <span className="meta-text truncate">{user.email}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <span className="meta-text">Joined {formatDate(user.created_at)}</span>
                                            {/* role selecting */}
                                            {isSelf && (
                                                <select 
                                                    value={user.role}
                                                    disabled= {updatingRoleId === user.id}
                                                    onChange={e=> handleRoleChange(user, e.target.value as "user" | "admin")}
                                                    className="input-field w-auto! py-1! px-2! text-xs! disabled:opacity-50"
                                                >
                                                    <option value="user">user</option>
                                                    <option value="admin">admin</option>
                                                </select>
                                            )}
                                            </div>
                                            {/* deleting a user */}
                                            {!isSelf && (
                                                <button
                                                    type="button"
                                                    onClick={()=> openDeleteConfirm(user)}
                                                    disabled={deletingId === user.id}
                                                    className="btn-danger self-start text-xs! disabled:opacity-50"
                                                >
                                                    {deletingId == user.id ? "Deleting": "Delete user"}
                                                </button>
                                            )}
                                        </div>
                                    ) 
                                })}
                            </div>

                            {/* on non mobile view we switch a table instead */}
                            <div className="hidden: sm:block border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-surface border-b border-border">
                                        <tr>
                                            <th className="text-left px-4 py-3 meta-text font-medium uppercase tracking-wide text-xs!">User</th>
                                            <th className="text-left px-4 py-3 meta-text font-medium uppercase tracking-wide text-xs!">Email</th>
                                            <th className="text-left px-4 py-3 meta-text font-medium uppercase tracking-wide text-xs!">Role</th>
                                            <th className="text-left px-4 py-3 meta-text font-medium uppercase tracking-wide text-xs!">Joined</th>
                                            <th className="text-left px-4 py-3 meta-text font-medium uppercase tracking-wide text-xs!">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {users.map(user=>{
                                            const isSelf = user.id === currentUser?.id
                                            return (
                                                <tr 
                                                    key={user.id}
                                                    className={`transition-colors ${isSelf? "bg-surface": "bg-white hover:bg-base"}`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`avatar ${getAvatarColor(user.username)}`}>
                                                                <span className="avatar-initial">
                                                                    {user.username.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="font-medium font-sans text-primary">{user.username}</span>
                                                            {isSelf && <span className="badge">you</span>}
                                                        </div>
                                                        <td className="px-4 py-3 meta-text">{user.email}</td>
                                                        <td className="px-4 py-3">
                                                            {isSelf ? (
                                                                <span className="badge-admin">{user.role}</span>
                                                            ): (
                                                                <select 
                                                                    value={user.role}
                                                                    disabled={updatingRoleId===user.id}
                                                                    onChange={(e)=> handleRoleChange(user, e.target.value as "user" | "admin")}
                                                                    className="input-field w-auto! py-1! px-2! text-xs! disabled:opacity-50"
                                                                >
                                                                    <option value="user">user</option>
                                                                    <option value="admin">admin</option>
                                                                </select>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 meta-text">{formatDate(user.created_at)}</td>

                                                        <td className="px-4 py-3">
                                                            {isSelf?(
                                                                <span className="meta-text">-</span>
                                                            ):(
                                                                <button type="button" onClick={()=> openDeleteConfirm(user)} disabled={deletingId === user.id} className="btn-danger disabled:opacity-50">
                                                                    {deletingId === user.id ? "Deleting...": "Delete"}
                                                                </button>
                                                            )}
                                                        </td>
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
    

 
export default AdminPage;