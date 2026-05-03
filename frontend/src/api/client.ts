const BASE_URL = '/api'

const getToken = ()=> localStorage.getItem("token")

const request = async<T>(endpoint: string, options: RequestInit = {}): Promise<T> =>{
    const token = getToken()
    //mutate the req header
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token && {Authorization: `Bearer ${token}`}),
        ...options.headers,
    }
    //making the call/request
    const response = await fetch(`${BASE_URL}${endpoint}`, {...options, headers})
    if(!response.ok){
        const error = await response.json().catch(()=>({message: "An error occurred"}))
        throw new Error(error.message || "An error occurred")
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