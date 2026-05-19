import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = "Confirmar acción",
  message = "¿Está seguro?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white w-full max-w-sm rounded-xl shadow-xl p-6 space-y-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <p className="text-gray-600">{message}</p>

            <div className="flex justify-end gap-3 pt-4">
              <button
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-gray-300 transition"
                onClick={onCancel}
              >
                {cancelText}
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-red-700 transition"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
