import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import ErrorBoundary from "../components/ErrorBoundary";


const RootLayout = () => {
    return (
        <div>
            <Navbar />
            <main>
                <ErrorBoundary>
                    <Outlet/>
                </ErrorBoundary>
            </main>
        </div>
    );
}
 
export default RootLayout;