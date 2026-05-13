import { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import type { User } from "../types";
import { adminApi } from "../api/admin";


const AdminPage = () => {
    const {user: currentUser} = useAppSelector((state)=> state.auth)

    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)


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
            fetchUsers()
        }
    }, [])


    const handleDelete = async (targetUser: User)=>{
        if(!confirm(`Are you sure you want to delete ${targetUser.username}? This operation isn't reversible`))return
        
        setDeletingId(targetUser.id)
        
        try{
            await adminApi.deleteUser(targetUser.id)
            //without refreshing set the userlist to... u know what i mean
            setUsers((prev)=> prev.filter(user=> user.id!==targetUser.id))
        }catch(err){
            alert(err instanceof Error? err.message : "Failed to delete user")
        }finally{
            setDeletingId(null)
        }
    
    }
    





    return (
        <>/</>
    );
}
 
export default AdminPage;