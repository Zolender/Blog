import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { rehydrateAuth } from "./features/auth/authSlice";
import { BrowserRouter, Route, Routes } from "react-router";
import RootLayout from "./layouts/RootLayout";
import FeedPage from "./pages/FeedPage";
import PostPage from "./pages/PostPage";
import GuestRoute from "./components/guestRout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NewPostPage from "./pages/NewPostPage";
import EditPostPage from "./pages/EditPostPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";


const App = () => {
    const dispacth = useAppDispatch()
    const { isLoading} = useAppSelector((state)=> state.auth)
    useEffect(()=> {
        dispacth(rehydrateAuth())
    }, [dispacth])

    if(isLoading){
        return (
            <div className="text-gray-500">Loading...</div>
        )
    }
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<RootLayout/>}>
                    {/* public routes */}
                    <Route index element={<FeedPage/>}/>
                    <Route path="posts/:id" element={<PostPage/>} />
                    {/* guest only pages, login and register */}
                    <Route path="login" element={<GuestRoute><LoginPage/></GuestRoute>} />
                    <Route path="register" element={<GuestRoute><RegisterPage/></GuestRoute>} />
                
                    {/* protected routes */}
                    <Route path="posts/new" element={<ProtectedRoute><NewPostPage/></ProtectedRoute>}/>
                    <Route path="posts/:id/edit" element={<ProtectedRoute><EditPostPage/></ProtectedRoute>}/>

                    {/* admin only */}
                    <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />


                    <Route path="*" element={<NotFoundPage/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
 
export default App;