import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AuthState, User } from "../../types";
import { authApi } from "../../api/auth";
import type { PayloadAction } from "@reduxjs/toolkit";


const initialState: AuthState = {
    user: null,
    token: localStorage.getItem("token"),
    isLoading: true
}


//for rehydratation of session, this would be called once the app loads
export const rehydrateAuth = createAsyncThunk("auth/rehydrate", async ()=> {
    const {user} = await authApi.getMe();
    return user;
})

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{user: User; token: string}>)=>{
            state.user = action.payload.user;
            state.token = action.payload.token
            localStorage.setItem("token", action.payload.token);
        },
        logout: (state)=>{
            state.user = null
            state.token = null
            localStorage.removeItem("token")
        }
    },
    extraReducers: (builder)=>{
        builder.addCase(rehydrateAuth.pending, (state)=> {
            state.isLoading = true;
        })
        .addCase(rehydrateAuth.fulfilled, (state, action)=> {
            state.user = action.payload
            state.isLoading = false
        })
        .addCase(rehydrateAuth.rejected, (state)=> {
            //the case where the token is maybe invalid or expired, we just clear everything
            state.user = null
            state.token = null
            state.isLoading = false
            localStorage.removeItem("token")
        })
    }
})

export const { setCredentials, logout} = authSlice.actions
export default authSlice.reducer