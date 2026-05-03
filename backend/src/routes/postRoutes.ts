import {Router} from "express"
import { protect } from "../middleware/authMiddleware.js"
import { createPost, deletePost, getAllPosts, getPostById, updatePost } from "../controllers/postController.js"
import { addComment, deleteComment } from "../controllers/commentController.js"
import { toggleLike } from "../controllers/likeController.js"


const router = Router()

//normal post routes
router.get("/", getAllPosts)
router.get("/:id", getPostById)
router.post("/", protect, createPost)
router.put("/:id", protect, updatePost)
router.delete("/:id", protect, deletePost)

//comment and likes
router.post("/:id/comments", protect, addComment)
router.delete("/:id/comments/:commentId", protect, deleteComment)
router.post("/:id/like", protect, toggleLike)

export default router