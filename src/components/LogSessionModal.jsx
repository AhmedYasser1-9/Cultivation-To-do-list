import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Zap } from 'lucide-react'

export default function LogSessionModal({ isOpen, onClose, onConfirm, taskTitle }) {
  const [minutes, setMinutes] = useState(30) // الافتراضي 30 دقيقة

  useEffect(() => {
    if (isOpen) setMinutes(30)
  }, [isOpen])

  const handleConfirm = (e) => {
    e.preventDefault()
    onConfirm(minutes)
  }

  // أزرار سريعة للوقت
  const PRESETS = [15, 30, 45, 60, 90, 120]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900 shadow-2xl shadow-emerald-900/30"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="border-b border-white/5 bg-slate-800/50 px-6 py-4">
              <h2 className="text-lg font-bold uppercase tracking-widest text-emerald-100 flex items-center gap-2">
                <Clock size={18} className="text-emerald-400" />
                Log Cultivation
              </h2>
              <p className="text-xs text-slate-400 truncate mt-1">
                Task: <span className="text-emerald-300">{taskTitle}</span>
              </p>
            </div>

            {/* Content */}
            <form onSubmit={handleConfirm} className="p-6 space-y-6">
              
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Duration (Minutes)
                </label>
                
                {/* Input Display */}
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="1440"
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="w-full text-center text-4xl font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl py-4 text-white focus:border-emerald-500 outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 uppercase">
                    Mins
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinutes(m)}
                      className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all ${
                        minutes === m 
                        ? 'bg-emerald-500 text-slate-900 border-emerald-500' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-emerald-500/50'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-700 py-3 text-xs font-bold uppercase text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-xs font-bold uppercase text-slate-900 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all active:scale-95"
                >
                  <Zap size={16} fill="currentColor" />
                  Absorb Qi
                </button>
              </div>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}