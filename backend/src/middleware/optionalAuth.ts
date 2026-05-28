import { authRequest } from "../types/index.js"
import { NextFunction, Response } from "express"
import { verifyToken } from "../utils/jwt.js"

export const optionalProtect = (req: authRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1]
        try {
            req.user = verifyToken(token as string) 
        } catch {
            // invalid/expired token, we treat as guest, we won't block
        }
    }

    next()
}