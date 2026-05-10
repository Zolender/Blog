import { Outlet } from "react-router";
import Navbar from "../components/Navbar";


const RootLayout = () => {
    return (
        <div className="">
            <Navbar />
            <main className="">
                <Outlet/>
            </main>
        </div>
    );
}
 
export default RootLayout;