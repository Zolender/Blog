import { Link, useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";
import { useState } from "react";



const panelVariants = {
    hidden: { x: '-100%'},
    visible: {x: 0, transition:{
        type: "tween" as const,
        duration: 0.25,
    }},
    exit: {
        x: '-100%',
        transition: {
            type: 'tween' as const,
            duration: 0.2
        }
    }
}

const overlayVariants = {
    hidden: {opacity: 0},
    visible: {
        opacity: 1,
        transition: {
            duration: 0.2
        }
    },
    exit: {
        opacity: 0, transition: {duration: 0.2}
    }
}

const Navbar = () => {
    const {user } = useAppSelector((state)=> state.auth)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = ()=>{
        dispatch(logout())
        setMobileOpen(false)
        navigate("/login")
    }

    const linkClass = (path: string) => location.pathname === path ? "nav-link-active" : "nav-link"

    return (
        <>
            <nav className="bg-white brorder-b border-border h-16 sticky top-0 z-40">
                <div className="page-wrapper h-full flex items-center justify-between">
                    <Link to="/" className="branc-name">Z-tales</Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={linkClass("/")}>Feed</Link>
                        {user && (
                            <Link to="/posts/new" className={linkClass("/posts/new")}>Write</Link>
                        )}

                        {user?.role === 'admin' && (
                            <Link to="/admin">Admin</Link>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-5">
                        {user ? (
                            <>
                                <span className="meta-text">{user.username}</span>
                                <button onClick={handleLogout} className="nav-link">Logout</button>
                            </>
                        ): (
                            <>
                                <Link to="/login" className="nav-link">Sign in</Link>
                                <Link to="/register" className="btn-primary">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}
 
export default Navbar;