import { Navigate } from "react-router";
import { useAppSelector } from "../app/hooks";
import { ROUTES } from "../utils/routes";

interface Props {
    children: React.ReactNode
    adminOnly?: boolean
}

const ProtectedRoute = ({ children, adminOnly = false }: Props) => {
    const { user, token, isLoading, networkError } = useAppSelector(state => state.auth)

    if (isLoading) return null

    // Server unreachable (cold start / offline) — we still have a token so don't
    // redirect to login. Show a retry prompt instead.
    if (networkError && token) {
        return (
            <div className="page-wrapper state-container">
                <p className="font-serif text-xl text-primary mb-2">Couldn't reach the server</p>
                <p className="meta-text mb-6">
                    The server may be waking up. Give it a moment and try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn-primary"
                >
                    Retry
                </button>
            </div>
        )
    }

    if (!user) return <Navigate to={ROUTES.login} replace />
    if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />

    return <>{children}</>
}

export default ProtectedRoute;
