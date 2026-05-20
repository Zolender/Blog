import { Link, useNavigate } from "react-router";
import { useAppDispatch } from "../app/hooks";
import { useState } from "react";
import { authApi } from "../api/auth";
import { setCredentials } from "../features/auth/authSlice";
import {motion} from 'framer-motion'

const pageVariants = {
    hidden: {
        opacity: 0,
        y: 10
    },
    visible: {
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.3
        }
    }
}

const RegisterPage = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent)=>{
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try{
            const {user, token } = await authApi.register({username, email, password})
            dispatch(setCredentials({user, token}))
            navigate("/")
        }catch(err){
            setError(err instanceof Error ? err.message : "Something we wrong")
        }finally{
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4">

            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md bg-white border border-border px-10 py-12"
            >
                <div className="text-center mb-8">
                    <h1 className="brand-name mb-1">Z-tales</h1>
                    <p className="meta-text uppercase tracking-widest">A sanctuary for the literate mind</p>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-primary mb-6">Create and account</h2>

                {error && (
                    <div className="mb-5 pz-4 py-3 bg-red-50 border border-red-200 text-red-700 font-sans text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label htmlFor="username" className="input-label">Username</label>
                        <input type="email" id="username" required placeholder="zedicus" value={username} onChange={(e)=> setEmail(e.target.value)} className="input-field" />
                    </div>

                    <div>
                        <label htmlFor="email" className="input-label">Email address</label>
                        <input type="email" id="email" required placeholder="sth@example.com" value={email} onChange={(e)=> setEmail(e.target.value)} className="input-field" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="password" className="input-label mb-0!">Password</label>
                        </div>
                        <input type="password" id="password" required value={password} onChange={(e)=> setPassword(e.target.value)} placeholder="*********" className="input-field" />
                    </div>

                    <button className="btn-primary w-full mt-1" disabled={isLoading} type="submit">{isLoading ? "Siging in" : "Login"}</button>
                </form>


                <p className="mt-6 text-center font-sans text-sm text-muted">Already have an account? {" "} <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link></p>
            </motion.div>
        </div>
    );
}
 
export default RegisterPage;