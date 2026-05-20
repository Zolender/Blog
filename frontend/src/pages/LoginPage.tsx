import { Link, useNavigate } from 'react-router'
import { useAppDispatch } from '../app/hooks'
import React, { useState } from 'react'
import { authApi } from '../api/auth'
import { setCredentials } from '../features/auth/authSlice'
import { motion } from 'framer-motion'
import FloatingInput from '../components/FloatingInput'

const pageVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const { user, token } = await authApi.login({ email, password })
      dispatch(setCredentials({ user, token }))
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white border border-border px-6 sm:px-10 py-10 sm:py-12"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="brand-name inline-block mb-1">Z-Tales</Link>
          <p className="meta-text uppercase tracking-widest">
            A sanctuary for the literate mind
          </p>
        </div>

        <h2 className="font-serif text-2xl font-semibold text-primary mb-6 text-center">
          Welcome back
        </h2>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 font-sans text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FloatingInput
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <FloatingInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-2"
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center font-sans text-sm text-muted">
          New to the archive?{' '}
          <Link to="/register" className="text-accent hover:underline font-medium">
            Register an account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage