import { Link } from "react-router"
import type { Post } from "../types"
import { motion } from "framer-motion"
import { Heart, MessageCircle } from "lucide-react"
import { formatDate, getReadTime, stripMarkdown } from "../utils/formatting"
import Avatar from "./Avatar"

interface Props {
    post: Post
}

const APostCard = ({ post }: Props) => {
    const strippedContent = stripMarkdown(post.content)
    const excerpt = strippedContent.slice(0, 140)

    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Link to={`/posts/${post.id}`} className="card block">
                {post.banner_image ? (
                    <img src={post.banner_image} alt={post.title} className="w-full h-48 object-cover" />
                ) : (
                    <div className="w-full h-48 bg-surface flex items-center justify-center">
                        <span className="font-serif text-5xl font-bold text-border select-none">
                            {post.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}

                <div className="p-5 flex flex-col gap-3">
                    <p className="meta-text uppercase tracking-wide">
                        {getReadTime(post.content)}
                        <span className="mx-2">·</span>
                        {formatDate(post.created_at)}
                    </p>

                    <h2 className="heading-card line-clamp-2">{post.title}</h2>

                    <p className="font-sans text-sm text-muted line-clamp-2 leading-relaxed">
                        {excerpt}{strippedContent.length > 140 ? '...' : ''}
                    </p>

                    <div className="flex items-center justify-between mt-1 pt-3 border-t border-border">
                        <Link
                            to={`/users/${post.author_username}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <Avatar username={post.author_username} profilePic={post.author_profile_pic} />
                            <p className="font-sans text-xs font-medium text-primary">{post.author_username}</p>
                        </Link>

                        <div className="flex items-center gap-3 meta-text">
                            <span className="flex items-center gap-1">
                                <Heart size={12} /> {post.like_count}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle size={12} /> {post.comment_count}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export default APostCard