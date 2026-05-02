import { NextFunction, Response } from "express"
import { authRequest } from "../types/index.js"


export const restrictTo = (...roles: Array<"user"|"admin">)=>{
    return (req: authRequest, res: Response, next: NextFunction): void =>{
        if(!req.user || !roles.includes(req.user.role)){
            res.status(403).json({message: "Access denied, insufficient permissions"});
            return
        }
        next()
    }
}