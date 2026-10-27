import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm font-medium ${
                isSuccess
                  ? 'bg-white border-green-200 text-gray-900 ring-1 ring-green-500/20'
                  : isError
                  ? 'bg-white border-red-200 text-gray-900 ring-1 ring-red-500/20'
                  : 'bg-white border-indigo-200 text-gray-900 ring-1 ring-indigo-500/20'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-600" />}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded-lg transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
