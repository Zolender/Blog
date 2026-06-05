import { Navigate } from "react-router";
import { useAppSelector } from "../app/hooks";
import { ROUTES } from "../utils/routes";


interface Props {
    children : React.ReactNode
    adminOnly? : boolean
}

const ProtectedRoute = ({children, adminOnly = false} : Props) => {
    const {user, isLoading} = useAppSelector((state)=> state.auth)

    //while rehydratation is happening we don't know yet if the user is logged in or not, no need to start rendering the login page in that case yet
    if(isLoading)return null
    //in case the user isn't logged in then, redirection to the login page
    if(!user) return <Navigate to={ROUTES.login} replace/>
    //if the route is only for admins and the user isn't then, redirection to home
    if(adminOnly && user.role !== "admin")return <Navigate to="/" replace/>
    

    return <>{children}</>;
}
 
export default ProtectedRoute;