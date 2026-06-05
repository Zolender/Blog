import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Comment } from "../types";
import ConfirmModal from "./ConfirmModal";
import { formatDate, getAvatarColor } from "../utils/formatting";
import { motion } from 'framer-motion'

interface CommentItemProps {
    comment: Comment
    canModify: boolean  // author or admin — can delete
    canEdit: boolean    // author only — can edit
    onDelete: () => void
    onEdit: (commentId: number, newContent: string) => Promise<void>
    onReply?: () => void
    showReplyButton: boolean
}

const CommentItem = ({ comment, canModify, canEdit, onDelete, onEdit, onReply, showReplyButton }: CommentItemProps) => {
    const [confirmOpen, setConfirmOpen]   = useState(false)
    const [isEditing, setIsEditing]       = useState(false)
    const [editContent, setEditContent]   = useState(comment.content)
    const [editLoading, setEditLoading]   = useState(false)
    const textareaRef                     = useRef<HTMLTextAreaElement>(null)

    // Auto-grow textarea as content changes
    useEffect(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = `${el.scrollHeight}px`
    }, [editContent])

    const startEdit = () => {
        setEditContent(comment.content)
        setIsEditing(true)
    }

    const cancelEdit = () => {
        setIsEditing(false)
        setEditContent(comment.content)
    }

    const handleSave = async () => {
        const trimmed = editContent.trim()
        if (!trimmed || trimmed === comment.content) { cancelEdit(); return }
        setEditLoading(true)
        try {
            await onEdit(comment.id, trimmed)
            setIsEditing(false)
        } finally {
            setEditLoading(false)
        }
    }

    return (
        <>
            <ConfirmModal
                isOpen={confirmOpen}
                title="Delete comment"
                message="This comment will be permanently removed."
                confirmLabel="Delete"
                onConfirm={() => { setConfirmOpen(false); onDelete() }}
                onCancel={() => setConfirmOpen(false)}
            />

            <div className="flex gap-3">
                <div className={`avatar shrink-0 ${getAvatarColor(comment.author_username)}`}>
                    <span className="avatar-initial">{comment.author_username.charAt(0).toUpperCase()}</span>
                </div>

                <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            to={`/users/${comment.author_username}`}
                            className="text-sm font-medium font-sans text-primary hover:text-accent transition-colors"
                        >
                            {comment.author_username}
                        </Link>
                        <span className="meta-text">{formatDate(comment.created_at)}</span>
                    </div>

                    {isEditing ? (
                        <div className="flex flex-col gap-2 mt-1">
                            <textarea
                                ref={textareaRef}
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                rows={2}
                                maxLength={1000}
                                autoFocus
                                className="input-field resize-none text-sm overflow-hidden"
                            />
                            <div className="flex items-center gap-2 self-end">
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="btn-ghost px-3! py-1! text-xs!"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={editLoading || !editContent.trim()}
                                    className="btn-primary px-3! py-1! text-xs!"
                                >
                                    {editLoading ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm font-sans leading-relaxed text-primary wrap-break-word">{comment.content}</p>
                    )}

                    {!isEditing && (showReplyButton || canEdit || canModify) && (
                        <div className="flex items-center gap-3 mt-0.5">
                            {showReplyButton && (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={onReply}
                                    className="meta-text hover:text-accent transition-colors text-xs!"
                                >
                                    Reply
                                </motion.button>
                            )}
                            {canEdit && (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={startEdit}
                                    className="meta-text hover:text-accent transition-colors text-xs!"
                                >
                                    Edit
                                </motion.button>
                            )}
                            {canModify && (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => setConfirmOpen(true)}
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
    )
}

export default CommentItem;
