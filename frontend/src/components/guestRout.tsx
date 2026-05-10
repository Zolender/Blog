import type React from "react";
import { useAppSelector } from "../app/hooks";
import { Navigate } from "react-router";


interface Props {
    children: React.ReactNode
}

function GuestRoute({children}: Props){
    const {user, isLoading} = useAppSelector((state)=> state.auth)

    if(isLoading) return null

    if(user)return <Navigate to="/" replace/>

    return <>{children}</>
}

export default GuestRoute