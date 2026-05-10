import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";

const Navbar = () => {
    const {user } = useAppSelector((state)=> state.auth)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const handleLogout = ()=>{
        dispatch(logout())
        navigate("/login")
    }

    return (
        <nav className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between mx-auto">
                <Link to="/">Z-Tales</Link>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="">
                                {user.username}
                            </span>
                            <Link to="/posts/new">Write</Link>
                            {user.role === "admin" && (
                                <Link to="/admin">Admin</Link>
                            )}
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ): (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
 
export default Navbar;