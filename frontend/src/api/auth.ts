import type { User } from "../types";
import { apiClient } from "./client";


export const authApi = {
    //options and operations done through the authApi will need to be defined here
    register: (data : { username: string; email: string; password: string})=>{
        return apiClient.post<{token: string; user: User}>("/auth/register", data)
    },
    login: (data: {email: string; password: string})=>{
        return apiClient.post<{token: string; user: User}>("/auth/login", data)
    },
    getMe: ()=> apiClient.get<{user: User}>("/auth/me")
    
}