import { Component, type ReactNode } from "react"
import { Link } from "react-router"

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    message: string | null
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, message: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message ?? null }
    }

    componentDidCatch(error: Error) {
        console.error('[ErrorBoundary caught]', error)
    }

    handleReset = () => {
        this.setState({ hasError: false, message: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="state-container">
                    <p className="font-serif text-2xl text-primary mb-2">
                        Something went wrong
                    </p>
                    <p className="meta-text mb-1">
                        An unexpected error occurred on this page.
                    </p>
                    {this.state.message && (
                        <p className="font-mono text-xs text-muted mb-6 max-w-sm text-center">
                            {this.state.message}
                        </p>
                    )}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={this.handleReset}
                            className="btn-ghost px-4! py-1.5! text-xs!"
                        >
                            Try again
                        </button>
                        <Link to="/" className="btn-primary px-4! py-1.5! text-xs!">
                            Back to feed
                        </Link>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary