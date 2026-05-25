import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { createContext, useCallback, useContext, useRef, useState } from "react"

type ToastVariant = "success" | "error"

interface ToastItem {
    id: number
    message: string
    variant: ToastVariant
}

interface ToastContextValue {
    showToast: (message:string, variant?: ToastVariant)=> void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({children}: {children: React.ReactNode}) => {
    
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const counter = useRef(0)
    const dismiss = useCallback((id: number)=> {
        setToasts(prev => prev.filter(t => t.id !== id))
    },[])
    const showToast = useCallback((message:string, variant: ToastVariant = "success")=>{
        const id = ++counter.current
        setToasts(prev => [...prev, {id, message, variant}])
        setTimeout(()=> dismiss(id), 3000)
    }, [dismiss])
    
    
    return (
      <ToastContext.Provider value={{ showToast }}>
        {children}

        <div aria-live="polite" className="fixed z-50 flex flex-col gap-2 bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-80">
            <AnimatePresence>
                {toasts.map(toast=>(
                    <motion.div 
                        key={toast.id}
                        layout
                        initial={{opacity: 0, y:16}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 8}}
                        transition={{duration: 0.22}}
                        className={`flex items-start justify-between gap-3 bg-white border border-border px-4 py-3 shadow-md border-l-4 ${toast.variant === 'success' ? "border-l-accent": "border-l-danger"}`}
                    >
                        <p className={`text-sm font-sans leading-snug ${toast.variant === 'success'? "text-primary": "text-danger"}`}>
                            {toast.message}
                        </p>
                        <button
                            type="button"
                            aria-label="Dismiss notification"
                            onClick={()=> dismiss(toast.id)}
                            className="text-muted hover:text-primary transition-colors shrink-0 mt-0.5"
                        >
                            <X size={14}/>
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </ToastContext.Provider>
    );
}

export const useToast = () : ToastContextValue=>{
    const context= useContext(ToastContext)
    if(!context) throw new Error("useToast must be used inside the Toast Provider")
    return context
}


 
