import { Router } from "express";
import healthController from "../controllers/healthController.js";

const router = Router()

router.post("/health", healthController)

export default router