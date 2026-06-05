import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AuthState, User } from "../../types";
import { authApi } from "../../api/auth";
import { ApiError } from "../../api/client";
import type { PayloadAction } from "@reduxjs/toolkit";


const initialState: AuthState = {
    user: null,
    token: localStorage.getItem("token"),
    isLoading: true,
    networkError: false,
}

type RejectReason = "no_token" | "auth_error" | "network_error"

// Distinguish between three outcomes:
//   no_token     — nothing in localStorage, not logged in
//   auth_error   — server responded 401, token is invalid/expired → clear auth
//   network_error — server unreachable (cold start, offline) → keep token, don't log out
export const rehydrateAuth = createAsyncThunk<User, void, { rejectValue: RejectReason }>(
    "auth/rehydrate",
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem("token")
        if (!token) return rejectWithValue("no_token")
        try {
            const { user } = await authApi.getMe()
            return user
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                return rejectWithValue("auth_error")
            }
            return rejectWithValue("network_error")
        }
    }
)

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user         = action.payload.user
            state.token        = action.payload.token
            state.networkError = false
            localStorage.setItem("token", action.payload.token)
        },
        logout: (state) => {
            state.user         = null
            state.token        = null
            state.networkError = false
            localStorage.removeItem("token")
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(rehydrateAuth.pending, (state) => {
                state.isLoading    = true
                state.networkError = false
            })
            .addCase(rehydrateAuth.fulfilled, (state, action) => {
                state.user         = action.payload
                state.isLoading    = false
                state.networkError = false
            })
            .addCase(rehydrateAuth.rejected, (state, action) => {
                const reason = action.payload
                if (reason === "auth_error" || reason === "no_token") {
                    // Confirmed invalid or absent — clear everything
                    state.user  = null
                    state.token = null
                    localStorage.removeItem("token")
                }
                // network_error: keep token so we don't log the user out on a cold start
                state.networkError = reason === "network_error"
                state.isLoading    = false
            })
    },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
