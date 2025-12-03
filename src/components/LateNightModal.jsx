import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Moon, X, Minus, Plus } from 'lucide-react'

export default function LateNightModal({ isOpen, onClose, onActivate, onDisable, currentExpiry }) {
  const [days, setDays] = useState(1)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="relative w-full max-w-sm bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
          
          <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-indigo-200 flex items-center gap-2"><Moon size={20}/> Late Night Protocol</h2>
            <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-white"/></button>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm text-slate-400">Disable daily resets for a custom duration.</p>
            
            {currentExpiry && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-lg text-xs text-indigo-300 text-center">
                Active Until: <span className="font-bold text-white">{currentExpiry}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Duration (Days)</label>
              {/* ✅ Custom Input Control */}
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setDays(Math.max(1, days - 1))}
                  className="p-3 text-slate-400 hover:bg-slate-800 hover:text-white border-r border-slate-800 transition-colors"
                >
                  <Minus size={18}/>
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max="30" 
                  value={days} 
                  onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-transparent text-center text-xl font-bold text-indigo-400 outline-none"
                />
                <button 
                  onClick={() => setDays(days + 1)}
                  className="p-3 text-slate-400 hover:bg-slate-800 hover:text-white border-l border-slate-800 transition-colors"
                >
                  <Plus size={18}/>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              {currentExpiry && (
                <button onClick={() => { onDisable(); onClose(); }} className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-xs uppercase">Disable</button>
              )}
              <button onClick={() => { onActivate(days); onClose(); }} className="flex-[2] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase shadow-lg shadow-indigo-900/20">
                Activate for {days} Days
              </button>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}