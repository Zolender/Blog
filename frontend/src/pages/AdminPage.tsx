import { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import type { User } from "../types";
import { adminApi } from "../api/admin";
import { useToast } from "../components/Toast";


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

    const handleDelete = async (targetUser: User)=>{
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
            <div className="flex flex-col gap-6 ">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <span className="text-sm text-gray-500">{users.length} users total</span>
                </div>

                {users.length === 0? (
                    <p className="text-gray-400 text-sm py-10 text-center">No user found.</p>
                ): (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className=" bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user=>{
                                    const isSelf = user.id === currentUser?.id

                                    return(
                                        <tr  key={user.id} className={isSelf? "bg-blue-50" : "bg-white"}>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {user.username}
                                                {isSelf && (
                                                    <span className="ml-2 text-xs text-blue-500 font-normal">(you)</span>
                                                )}
                                            </td>
                                            
                                            <td className="px-4 py-3 text-gray-500">{user.email}</td>
                                                
                                            <td className="px-4 py-3">
                                                {isSelf ? (
                                                    <span className="text-gray-700">{user.role}</span>
                                                ):(
                                                    <select
                                                        value= {user.role}
                                                        disabled = {updatingRoleId== user.id}
                                                        onChange={(e)=> handleRoleChange(user, e.target.value as "user" | "admin")}
                                                        className="border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:right-2 focus:ring-blue-500 disabled:opacity-50"
                                                    >
                                                        <option value="user">user</option>
                                                        <option value="admin">admin</option>
                                                    </select>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 py-3">
                                                {isSelf?(
                                                    <span className="text-xs text-gray-300">-</span>
                                                ): (
                                                    <button 
                                                        onClick={()=> handleDelete(user)}
                                                        disabled={deletingId === user.id}
                                                        className="text-red-500 hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {deletingId === user.id? "Deleting...": "Delete"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )
    }
    

 
export default AdminPage;