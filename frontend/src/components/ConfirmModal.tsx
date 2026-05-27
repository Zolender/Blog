import { AnimatePresence, motion } from "framer-motion"

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay div to cancel the modal action  */}
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/30"
                        onClick={onCancel}
                        aria-hidden="true"
                    />

                    {/* Modal itself */}
                    <motion.div
                        key="modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-5"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-white border border-border w-full max-w-xs p-6 flex flex-col gap-5">

                            <div className="flex flex-col gap-1.5">
                                <p
                                    id="modal-title"
                                    className="font-sans text-sm font-semibold text-primary"
                                >
                                    {title}
                                </p>
                                <p className="font-sans text-xs text-muted leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            <hr className="divider" />

                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="btn-ghost px-4! py-1.5! text-xs!"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    className="btn-danger-solid px-4! py-1.5! text-xs!"
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ConfirmModal