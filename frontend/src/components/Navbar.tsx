import { Link, useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";



const panelVariants = {
    hidden: { x: '100%'},
    visible: {x: 0, transition:{
        type: "tween" as const,
        duration: 0.25,
    }},
    exit: {
        x: '100%',
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
                        {user && (
                            <>
                                <Link to="/" className={linkClass("/")}>Feed</Link>
                                <Link to="/posts/new" className={linkClass("/posts/new")}>Write</Link>
                            </>
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

                    <button className="md:hidden nav-link" onClick={()=> setMobileOpen(true) } aria-label="Open menu">
                        <Menu size={22}/>
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div key="overlay" 
                            variants={overlayVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="fixed inset-0 z-50 bg-black/10"
                            onClick={()=> setMobileOpen(false)}    
                        />

                        <motion.div
                            key="panel"
                            variants={panelVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="fixed top-20 right-10 z-50 h-fit w-4/6 maz-w-xs bg-white flex flex-col shadow-xl"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                                <div className="flex flex-col px-6 py-4 flex-1">
                                    <Link to="/" onClick={()=> setMobileOpen(false)} className="nav-link py-3.5 border-b border-border">Feed</Link>
                                    
                                </div>
                            </div>


                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
 
export default Navbar;