import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react'

export default function Toast({ isOpen, onClose, message, type = 'success', duration = 3000 }) {
  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-blue-400" />,
  }

  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  }

  if (duration > 0) {
    setTimeout(() => {
      if (isOpen) onClose()
    }, duration)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-4 right-4 z-[200]"
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md ${colors[type]}`}>
            {icons[type]}
            <p className="text-sm font-semibold text-slate-100">{message}</p>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

