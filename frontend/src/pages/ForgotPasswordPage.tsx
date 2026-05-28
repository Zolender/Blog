import { useEffect, useState } from "react"
import { Link } from "react-router"
import { motion } from "framer-motion"
import { authApi } from "../api/auth"
import FloatingInput from "../components/FloatingInput"

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sent, setSent] = useState(false)

    useEffect(() => {
        document.title = "Forgot password — Z-Tales"
        return () => { document.title = "Z-Tales" }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)
        try {
            await authApi.forgotPassword(email)
            setSent(true)
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
                <p className="meta-text uppercase tracking-widest">Password Reset</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md bg-white border border-border px-6 sm:px-10 py-10 sm:py-12"
            >
                {sent ? (
                    <div className="flex flex-col gap-4 text-center">
                        <p className="font-serif text-xl text-primary">Check your inbox</p>
                        <p className="font-sans text-sm text-muted leading-relaxed">
                            If <span className="text-primary font-medium">{email}</span> is registered,
                            you'll receive a reset link shortly. It expires in 1 hour.
                        </p>
                        <Link to="/login" className="btn-primary w-full mt-2">
                            Back to sign in
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="font-sans text-sm text-muted leading-relaxed mb-6">
                            Enter the email address associated with your account and we'll send you a reset link.
                        </p>

                        {error && (
                            <div role="alert" className="error-banner mb-5">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <FloatingInput
                                id="email" label="Email Address" type="email"
                                value={email} onChange={e => setEmail(e.target.value)}
                                required autoComplete="email"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full mt-2"
                            >
                                {isLoading ? "Sending..." : "Send reset link"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="font-sans text-xs text-muted hover:text-accent transition-colors">
                                Back to sign in
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>

            <p className="meta-text fine-text mt-6">&copy; {new Date().getFullYear()} Z-Tales</p>
        </div>
    )
}

export default ForgotPasswordPage