import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { rehydrateAuth } from "./features/auth/authSlice"
import { BrowserRouter, Route, Routes } from "react-router"
import RootLayout from "./layouts/RootLayout"
import FeedPage from "./pages/FeedPage"
import PostPage from "./pages/PostPage"
import GuestRoute from "./components/guestRoute"
import ProtectedRoute from "./components/ProtectedRoute"
import NewPostPage from "./pages/NewPostPage"
import EditPostPage from "./pages/EditPostPage"
import AdminPage from "./pages/AdminPage"
import NotFoundPage from "./pages/NotFoundPage"
import AuthPage from "./pages/AuthPage"
import WriterLayout from "./layouts/WriterLayout"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import { MotionConfig } from "framer-motion"
import SkeletonCard from "./components/SkeletonCard"

const App = () => {
    const dispatch    = useAppDispatch()
    const { isLoading } = useAppSelector((state) => state.auth)

    useEffect(() => { dispatch(rehydrateAuth()) }, [dispatch])

    if (isLoading) return (
        <div className="min-h-screen bg-base">
            <div className="h-16 bg-white border-b border-border" />
            <div className="page-wrapper py-12">
                <div className="skeleton w-full h-72 mb-10" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        </div>
    )

    return (
        <MotionConfig>
            <BrowserRouter>
                <Routes>
                    <Route path="login" element={<GuestRoute><AuthPage /></GuestRoute>} />
                    <Route path="register" element={<GuestRoute><AuthPage /></GuestRoute>} />
                    <Route path="forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
                    <Route path="reset-password"  element={<ResetPasswordPage />} />

                    <Route element={<WriterLayout />}>
                        <Route path="posts/new" element={<ProtectedRoute><NewPostPage /></ProtectedRoute>} />
                        <Route path="posts/:id/edit" element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
                    </Route>

                    <Route element={<RootLayout />}>
                        <Route index element={<FeedPage />} />
                        <Route path="posts/:id" element={<PostPage />} />
                        <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </MotionConfig>
    )
}

export default App