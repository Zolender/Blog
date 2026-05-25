import { AnimatePresence, motion } from "framer-motion"

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    onConfirm: ()=> void
    onCancel: ()=> void
}

const ConfirmModal = ({isOpen, title, message, confirmLabel="Confirm", onConfirm, onCancel} : ConfirmModalProps)=>{
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        key="overlay"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.2}}
                        className="fixed inset-0 z-40 bg-black/40"
                        onClick={onCancel}
                        aria-hidden='true'
                    />

                    <motion.div
                            key="modal"
                            role="dialog"
                            aria-modal='true'
                            aria-labelledby="modal-title"
                            initial={{opacity: 0, scale: 0.95, y: 8}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.95, y: 8}}
                            transition={{duration: 0.2}}
                            className="fixed inset-0 z-50 flex items-center justify-center px-4"
                            onClick={e=> e.stopPropagation()}
                        >
                            <div className="bg-white border border-border w-full max-w-sm flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <h2 id="modal-title" className="heading-section text-base!">{title}</h2>
                                    <p className="meta-text text-sm!">{message}</p>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="btn-ghost w-full sm:w-auto"
                                    >   
        
                                    </button>
                                </div>
                            </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}