import { Outlet } from "react-router";
import {motion} from 'framer-motion'

const pageVariants = {
    hidden: {opacity: 0, y: 10},
    visible: {opacity: 1, y: 0, transition: {duration: 0.3}}
}

const WriterLayout = () => {
    return (
        <motion.div initial="hidden" animate="visible" variants={pageVariants} className="min-h-dvh bg-base">
            <Outlet/>
        </motion.div>
    );
}
 
export default WriterLayout;