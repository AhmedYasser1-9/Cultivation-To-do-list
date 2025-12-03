import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Target, X, Zap, Filter } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'

export default function ContributionModal({ isOpen, onClose, taskTitle, taskTags = [] }) {
  const { weeklyTargets, contributeToWeeklyTarget } = useCultivation()
  const [selectedTargetId, setSelectedTargetId] = useState(null)
  const [contributionAmount, setContributionAmount] = useState('')

  // ✅ Smart Filtering Logic
  // Show targets that are NOT complete AND (have matching tags OR source has no tags)
  const activeTargets = weeklyTargets.filter(t => {
    // 1. Hide 100% completed targets to keep list clean
    if (t.progress >= 100) return false

    // 2. Tag Intersection Logic
    if (taskTags.length > 0) {
      // If the source task has tags, only show weekly targets that share AT LEAST ONE tag
      // If the weekly target has no tags, it won't show (unless you want it to, but usually strict is better)
      const hasMatchingTag = t.tags && t.tags.some(tag => taskTags.includes(tag))
      return hasMatchingTag
    }
    
    // 3. If source task has NO tags, show ALL active targets (Fallback)
    return true
  })

  const handleConfirm = (e) => {
    e.preventDefault()
    const amount = parseInt(contributionAmount)
    if (selectedTargetId && !isNaN(amount) && amount > 0) {
      contributeToWeeklyTarget(selectedTargetId, amount)
      setContributionAmount('')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        >
          <motion.div 
            className="w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                  <Target size={16}/> Contribute to Destiny
                </h3>
                <p className="text-xs text-slate-500 mt-1 truncate max-w-[250px]">Source: {taskTitle}</p>
              </div>
              <button onClick={onClose}><X size={18} className="text-slate-500 hover:text-white"/></button>
            </div>

            <form onSubmit={handleConfirm} className="p-6 space-y-6">
              
              {/* Select Target */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-slate-500 uppercase">Select Weekly Target</label>
                   {taskTags.length > 0 && (
                     <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                       <Filter size={10} /> Filtered by Tags
                     </span>
                   )}
                </div>

                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {activeTargets.length > 0 ? (
                    activeTargets.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTargetId(t.id)}
                        className={`text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                          selectedTargetId === t.id 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate pr-2">{t.title}</span>
                          <span className="opacity-50 font-mono whitespace-nowrap">({t.progress}%)</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center p-4 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                      {taskTags.length > 0 
                        ? "No weekly targets match this task's tags." 
                        : "No active weekly targets found."}
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Input Area */}
              {selectedTargetId && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">Contribution (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      autoFocus
                      placeholder="e.g. 15"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg font-bold text-emerald-400 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">%</span>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={!selectedTargetId || !contributionAmount}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold uppercase tracking-widest hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Zap size={16} fill="currentColor" /> Channel Qi
              </button>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}