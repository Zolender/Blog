import { authRequest } from "../types/index.js";
import { NextFunction, Response } from "express";
import { verifyToken } from "../utils/jwt.js";



export const protect = (req: authRequest, res: Response, next: NextFunction): void =>{
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401).json({message: "Not authorized, no token provided"});
        return
    }
    const token = authHeader.split(" ")[1]

    try{
        const decoded = verifyToken(token as string);
        req.user = decoded
        next()
    }catch(err){
        res.status(401).json({ message : "Not authorized, token is invalid or expired"})
    }
}