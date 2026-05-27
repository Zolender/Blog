import { useEffect } from "react"
import { Link } from "react-router"
import { motion } from "framer-motion"

const NotFoundPage = () => {
    useEffect(() => {
        document.title = 'Page not found — Z-Tales'
        return () => { document.title = 'Z-Tales' }
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="state-container"
        >
            <p className="font-serif text-6xl font-bold text-border select-none mb-6">
                404
            </p>
            <p className="font-serif text-xl text-primary mb-2">
                This page doesn't exist
            </p>
            <p className="meta-text mb-8">
                The tale you're looking for may have been moved or deleted.
            </p>
            <Link to="/" replace className="btn-primary">
                Back to the feed
            </Link>
        </motion.div>
    )
}

export default NotFoundPage