import { Link, useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";



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

    const isActive = (path: string) => location.pathname === path ? "border-b-2 border-accent text-accent" : "text-[#111111] hover: text-accent transition-colors duration-200"

    return (
        <>
            <nav className="bg-white border-b border-[#e5e5e5] h-16 sticky top-0 z-40">
                <div className="flex items-center justify-between mx-auto h-full px-6 max-w-6xl">
                    <Link to="/" className="font-serif text-2xl font-bold text-[#111111] trancking-tight">Z-Tales</Link>
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
        </>
    );
}
 
export default Navbar;