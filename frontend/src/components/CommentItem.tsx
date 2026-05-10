import type { Comment } from "../types";


interface CommentItemProps {
    comment: Comment
    canModify: boolean
    onDelete: ()=> void
    onReply?: ()=> void
    showReplyButton: boolean
}

const CommentItem = ({comment, canModify, onDelete, onReply, showReplyButton}: CommentItemProps) => {
    return (
        <div className="border border-gray-100 rounded-lg p-4 bg-white flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{comment.author_username}</span>
                <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            
            <p className="text-sm text-gray-700">{comment.content}</p>
            <div className="flex items-center gap-3 mt-1">
                {showReplyButton && (
                    <button onClick={onReply} className="text-xs text-blue-500 hover:underline">Reply</button>
                )}
                {canModify && (
                    <button onClick={onDelete} className="text-xs text-red-400 hover:underline">Delete</button>
                )}
            </div>
        </div>
    );
}
 
export default CommentItem;