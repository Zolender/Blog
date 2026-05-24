import { Outlet } from "react-router";

const WriterLayout = () => {
    return (
        <div className="min-h-screen bg-base">
            <Outlet/>
        </div>
    );
}
 
export default WriterLayout;