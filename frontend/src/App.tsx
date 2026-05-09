import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { rehydrateAuth } from "./features/auth/authSlice";


const App = () => {
    const dispacth = useAppDispatch()
    const { user, isLoading} = useAppSelector((state)=> state.auth)
    useEffect(()=> {
        dispacth(rehydrateAuth())
    }, [dispacth])

    if(isLoading){
        return (
            <div className="text-gray-500">Loading...</div>
        )
    }
    return (
        <div className="">
            {user? (
                <p className="">Logged in as {user.username}</p>
            ) : (
                <p className="">Not logged in</p>
            )}
        </div>
    );
}
 
export default App;