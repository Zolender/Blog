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

const App = () => {
    const dispatch    = useAppDispatch()
    const { isLoading } = useAppSelector((state) => state.auth)

    useEffect(() => { dispatch(rehydrateAuth()) }, [dispatch])

    if (isLoading) return (
        <div className="state-container">
            <p className="meta-text">Loading...</p>
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