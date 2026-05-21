import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { rehydrateAuth } from "./features/auth/authSlice";
import { BrowserRouter, Route, Routes } from "react-router";
import RootLayout from "./layouts/RootLayout";
import FeedPage from "./pages/FeedPage";
import PostPage from "./pages/PostPage";
import GuestRoute from "./components/guestRout";
import ProtectedRoute from "./components/ProtectedRoute";
import NewPostPage from "./pages/NewPostPage";
import EditPostPage from "./pages/EditPostPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthPage from "./pages/AuthPage";


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
            
                <Route path="login" element={<GuestRoute><AuthPage/></GuestRoute>} />
                <Route path="register" element={<GuestRoute><AuthPage/></GuestRoute>} />
                
                <Route element={<RootLayout/>}>
                    <Route index element={<FeedPage/>}/>
                    <Route path="posts/:id" element={<PostPage/>} />

                    
                    <Route path="posts/new" element={<ProtectedRoute><NewPostPage/></ProtectedRoute>}/>
                    <Route path="posts/:id/edit" element={<ProtectedRoute><EditPostPage/></ProtectedRoute>}/>

                    <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />


                    <Route path="*" element={<NotFoundPage/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
 
export default App;