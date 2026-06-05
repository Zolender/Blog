import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { motion } from "framer-motion"
import { authApi } from "../api/auth"
import FloatingInput from "../components/FloatingInput"
import { ROUTES } from "../utils/routes"

const ResetPasswordPage = () => {
    const [searchParams]  = useSearchParams()
    const navigate        = useNavigate()
    const token           = searchParams.get("token")

    const [password, setPassword]       = useState("")
    const [confirm, setConfirm]         = useState("")
    const [isLoading, setIsLoading]     = useState(false)
    const [error, setError]             = useState<string | null>(null)
    const [success, setSuccess]         = useState(false)

    useEffect(() => {
        document.title = "Reset password — Z-Tales"
        return () => { document.title = "Z-Tales" }
    }, [])

    // no token in URL meaning someone landed here directly
    if (!token) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-md bg-white border border-border px-6 py-10 text-center flex flex-col gap-4">
                    <p className="font-serif text-xl text-primary">Invalid reset link</p>
                    <p className="font-sans text-sm text-muted">
                        This link is missing a reset token. Please request a new one.
                    </p>
                    <Link to="/forgot-password" className="btn-primary w-full">Request new link</Link>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirm) {
            setError("Passwords don't match")
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)
        try {
            await authApi.resetPassword(token, password)
            setSuccess(true)
            setTimeout(() => navigate(ROUTES.login), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-8"
            >
                <Link to="/" className="brand-name inline-block mb-1">Z-Tales</Link>
                <p className="meta-text uppercase tracking-widest">New Password</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md bg-white border border-border px-6 sm:px-10 py-10 sm:py-12"
            >
                {success ? (
                    <div className="flex flex-col gap-4 text-center">
                        <p className="font-serif text-xl text-primary">Password updated</p>
                        <p className="font-sans text-sm text-muted leading-relaxed">
                            Your password has been changed. Redirecting you to sign in...
                        </p>
                        <Link to={ROUTES.login} className="btn-primary w-full">Sign in now</Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div role="alert" className="error-banner mb-5">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <FloatingInput
                                id="password" label="New Password" type="password"
                                value={password} onChange={e => setPassword(e.target.value)}
                                required autoComplete="new-password"
                            />
                            <FloatingInput
                                id="confirm" label="Confirm Password" type="password"
                                value={confirm} onChange={e => setConfirm(e.target.value)}
                                required autoComplete="new-password"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full mt-2"
                            >
                                {isLoading ? "Updating..." : "Update password"}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>

            <p className="meta-text fine-text mt-6">&copy; {new Date().getFullYear()} Z-Tales</p>
        </div>
    )
}

export default ResetPasswordPage