import { jwtPayload } from "../types/index.js"
import jwt from "jsonwebtoken"


const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_EXPIRES_IN = '10m'

export const signToken = (payload: jwtPayload) : string =>{
    return jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN})
}   

export const verifyToken = ( token:string) : jwtPayload=>{
    return jwt.verify(token, JWT_SECRET) as jwtPayload
}