import type { User } from "../types";
import { apiClient } from "./client";


export const adminApi = {
    getUsers : ()=> apiClient.get<{users: User[]}>(`/admin/users`),
    deleteUser : (id: number)=> apiClient.delete<{message: string}>(`/admin/users/${id}`),
    updataRole: (id: number, role: "users" | "admin")=> apiClient.put<{user: User}>(`/admin/users/${id}/role`, {role})
}