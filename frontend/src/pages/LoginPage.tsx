import { Link, useNavigate } from "react-router";
import { useAppDispatch } from "../app/hooks";
import React, { useState } from "react";
import { authApi } from "../api/auth";
import { setCredentials } from "../features/auth/authSlice";


const LoginPage = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent)=>{
        e.preventDefault()
        setError(null)
        setIsLoading(true)
        try{
            const {user, token} = await authApi.login({email, password})
            dispatch(setCredentials({user, token}))
            navigate("/")
        }catch(err){
            setError(err instanceof Error? err.message : "Something went wrong")
        }finally{
            setIsLoading(false)
        }
    }



    return (
        <div className="max-w-md mx-auto mt-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input type="email" id="email" required value={email} onChange={(e)=> setEmail(e.target.value)} className="border border-gray-300 rounded-sm placeholder-zinc-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input type="password" id="password" required value={password} onChange={(e)=> setPassword(e.target.value)} className="border border-gray-300 rounded-sm placeholder-zinc-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <button type="submit" disabled={isLoading} className="bg-blue-600 text-white py-2 rounded-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="mt-4 text-sm text-gray-500">
                No account yet? {" "} <Link to="/register" className="text-blue-600 hover:underline">Login</Link>
            </p>
        </div>
    );
}
 
export default LoginPage;