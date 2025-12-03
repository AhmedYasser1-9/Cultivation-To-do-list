import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDanger = false }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // ✅ رفعنا الطبقة إلى 100 لتظهر فوق الإعدادات (80)
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`relative w-full max-w-sm overflow-hidden rounded-2xl border bg-slate-900 shadow-2xl ${
              isDanger ? 'border-red-500/30 shadow-red-900/20' : 'border-amber-500/30 shadow-amber-900/20'
            }`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDanger ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'} flex items-center justify-between`}>
              <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${isDanger ? 'text-red-200' : 'text-amber-200'}`}>
                <AlertTriangle size={16} />
                {title}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-300 leading-relaxed">
                {message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold uppercase text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase text-slate-900 shadow-lg transition-all active:scale-95 ${
                    isDanger 
                      ? 'bg-red-500 hover:bg-red-400 text-white' 
                      : 'bg-amber-500 hover:bg-amber-400'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}