import { Request } from "express"

export type jwtPayload = {
    id : number
    username : string
    role: "user" | "admin"
}

export interface authRequest extends Request {
    user?: jwtPayload
}