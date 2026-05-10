import { Link } from "react-router";
import type { Post } from "../types";

interface Props{
    post: Post
}
const PostCard = ({post}: Props) => {
    return (
        <Link to={`/posts/${post.id}`} className="block border border-gray-200 rounded-lg p-5 hover:border-gray-400 transition-colors bg-white">
            {/* in case the post has a banner image then we render it first */}
            {post.banner_image && (
                <img src={post.banner_image} alt={post.title} className="w-full h-48 object-cover rounded-sm mb-4" />
            )}
            {/* now the normal content of the post but to keep things uniform, we would slice the string for the content so that some don't take much more space than others */}
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {post.content.slice(0,150)}{post.content.length>150 ? "..." : ""}
            </p>
            {/* a bit more information about the posts  */}
            <div className="flex items-center justify-between text-xs text-gray-400">
                <span>by {post.author_username}</span>
                <div className="flex items-center gap-3">
                    <span>{Number(post.like_count)} likes</span>
                    <span>{Number(post.comment_count)} comments</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </Link>
    );
}
 
export default PostCard;