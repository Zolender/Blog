import { Router } from "express"
import { getPublicProfile } from "../controllers/userController.js"

const router = Router()

router.get("/:username", getPublicProfile)

export default router
