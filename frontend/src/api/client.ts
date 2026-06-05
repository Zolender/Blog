const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}` : '/api'

const getToken = ()=> localStorage.getItem("token")

// Carries the HTTP status so callers can distinguish 401 from network failures
export class ApiError extends Error {
    readonly status: number
    constructor(message: string, status: number) {
        super(message)
        this.status = status
        this.name = "ApiError"
    }
}

const request = async<T>(endpoint: string, options: RequestInit = {}): Promise<T> =>{
    const token = getToken()
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token && {Authorization: `Bearer ${token}`}),
        ...options.headers,
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {...options, headers})
    if(!response.ok){
        const error = await response.json().catch(()=>({message: "An error occurred"}))
        throw new ApiError(error.message || "An error occurred", response.status)
    }
    return response.json() as Promise<T>
}

//we then define the enpoint for the entire app, globall crud operations
export const apiClient = {
    get: <T>(endpoint: string)=> request<T>(endpoint),
    post: <T>(endpoint: string, body: unknown)=> request<T>(endpoint, {method: "POST", body: JSON.stringify(body)}),
    put: <T>(endpoint: string, body: unknown)=> request<T>(endpoint, {method: "PUT", body: JSON.stringify(body)}),
    delete: <T>(endpoint: string) => request<T>(endpoint, {method: "DELETE"})
}