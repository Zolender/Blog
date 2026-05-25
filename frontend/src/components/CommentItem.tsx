import { useState } from "react";
import type { Comment } from "../types";
import ConfirmModal from "./ConfirmModal";
import { formatDate, getAvatarColor } from "../utils/formatting";
import {motion} from 'framer-motion'

interface CommentItemProps {
    comment: Comment
    canModify: boolean
    onDelete: ()=> void
    onReply?: ()=> void
    showReplyButton: boolean
}

const CommentItem = ({comment, canModify, onDelete, onReply, showReplyButton}: CommentItemProps) => {

    const [confirmOpen, setConfirmOpen] = useState(false)

    return (
        <>
            <ConfirmModal
                isOpen={confirmOpen}
                title="Delete comment"
                message="This comment will be permanently removed."
                confirmLabel="Delete"
                onConfirm={()=> {
                    setConfirmOpen(false)
                    onDelete()
                }}
                onCancel={()=> setConfirmOpen(false)}
            />

            <div className="flex gap-3">
                <div className={`avatar shrink-0 ${getAvatarColor(comment.author_username)}`}>
                    <span className="avatar-initial">{comment.author_username.charAt(0).toUpperCase()}</span>
                </div>

                <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium font-sans text-primary">
                            {comment.author_username}
                        </span>
                        <span className="meta-text">{formatDate(comment.created_at)}</span>
                    </div>

                    <p className="text-sm font-sans leading-relaxed text-primary wrap-break-word">{comment.content}</p>

                    {(showReplyButton || canModify)&& (
                        <div className="flex items-center gap-3 mt-0.5">
                            {showReplyButton && (
                                <motion.button
                                    whileTap={{scale: 0.95}}
                                    type="button"
                                    onClick={onReply}
                                    className="meta-text hover:text-accent transition-colors text-xs!"
                                >
                                    Reply
                                </motion.button>
                            )}

                            {canModify && (
                                <motion.button
                                    whileTap={{scale: 0.95}}
                                    type="button"
                                    onClick={()=> setConfirmOpen(true)}
                                    className="btn-danger text-xs!"
                                >
                                    Delete
                                </motion.button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
 
export default CommentItem;