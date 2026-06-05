import { Router } from "express"
import { restrictTo } from "../middleware/roleMiddleware.js"
import { protect } from "../middleware/authMiddleware.js"
import { deleteUser, getAllUsers, updateUserRole, getAllAdminPosts, deleteAnyPost } from "../controllers/adminController.js"

const router = Router()

//all admin routes would require a valid token and admin role
router.use(protect, restrictTo("admin"))

router.get("/users", getAllUsers)
router.delete("/users/:id", deleteUser)
router.put("/users/:id/role", updateUserRole)

router.get("/posts", getAllAdminPosts)
router.delete("/posts/:id", deleteAnyPost)

export default router