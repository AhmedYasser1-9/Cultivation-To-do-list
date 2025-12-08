import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Zap, Minus, Plus, X, Trash2, Info, Timer, Flame, ChevronRight, Trophy } from 'lucide-react'
import { DIFFICULTY_TIERS, STREAK_VALUES } from '../context/CultivationContext.jsx'

// Settings
const INTENSITY_CONFIG = {
  'low': { multiplier: 1.0, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Relaxed' },
  'low-med': { multiplier: 1.2, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', label: 'Casual' },
  'med': { multiplier: 1.4, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', label: 'Focused' },
  'med-high': { multiplier: 1.6, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Intense' },
  'high': { multiplier: 1.8, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', label: 'Heavy' },
  'high-extreme': { multiplier: 2.2, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Severe' },
  'extreme': { multiplier: 3.0, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'Hell' },
}

const STREAK_LABELS = {
  15: 'Warmup', 30: 'Focus', 45: 'Flow',
  60: 'Deep', 90: 'Iron', 120: 'Zone',
  180: 'Marathon', 240: 'Beast', 300: 'Apex'
}

const ORDERED_KEYS = ['15', '30', '45', '60', '90', '120', '180', '240', '300']
const MAX_DAILY_MINUTES = 1440

export default function DailyHarvestModal({ isOpen, onClose, onConfirm }) {
  const [activeTab, setActiveTab] = useState('session') // 'session' | 'streaks'
  
  // Session State
  const [duration, setDuration] = useState(30) // Minutes
  const [intensity, setIntensity] = useState('low')
  const [sessions, setSessions] = useState([]) 
  
  // Streak State
  const [streakCounts, setStreakCounts] = useState(ORDERED_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))

  // Helpers
  const generateId = () => typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString()

  // --- CALCULATIONS ---
  const currentTotalMinutes = useMemo(() => sessions.reduce((acc, s) => acc + s.minutes, 0), [sessions])
  
  const currentStreakMinutes = useMemo(() => {
    return Object.entries(streakCounts).reduce((acc, [key, count]) => acc + (parseInt(key) * count), 0)
  }, [streakCounts])

  const projectedRewards = useMemo(() => {
    const timeXP = sessions.reduce((acc, s) => acc + s.xp, 0)
    const timeStones = sessions.reduce((acc, s) => acc + s.stones, 0)
    const streakBonusXP = Object.entries(streakCounts).reduce((acc, [key, count]) => acc + ((STREAK_VALUES[key] || 0) * count), 0)
    return { xp: timeXP + streakBonusXP, stones: timeStones }
  }, [sessions, streakCounts])

  // --- HANDLERS ---
  const addSession = () => {
    if (duration <= 0) return
    if (currentTotalMinutes + duration > MAX_DAILY_MINUTES) {
      alert("Day limit reached!")
      return
    }

    const config = INTENSITY_CONFIG[intensity]
    const baseXP = Math.round((50 * duration) / 60)
    const xp = Math.floor(baseXP * config.multiplier)
    const stones = Math.floor((duration / 6) * config.multiplier)

    setSessions([...sessions, { id: generateId(), minutes: duration, intensity, xp, stones }])
    setDuration(30) // Reset to default
  }

  const updateStreak = (key, delta) => {
    const dur = parseInt(key)
    if (delta > 0 && currentStreakMinutes + dur > MAX_DAILY_MINUTES) return
    setStreakCounts(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }))
  }

  const handleHarvest = () => {
    onConfirm(currentTotalMinutes, streakCounts, projectedRewards.xp, projectedRewards.stones)
    setSessions([])
    setStreakCounts(ORDERED_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Clock size={20}/></div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Daily Harvest</h2>
                  <p className="text-xs text-slate-400">Log your focus, reap the rewards</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
            </div>

            {/* Total Rewards Banner */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 grid grid-cols-2 gap-4 shrink-0">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total XP</span>
                  <span className="text-2xl font-black text-amber-400">+{projectedRewards.xp}</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Spirit Stones</span>
                  <span className="text-2xl font-black text-indigo-400">+{projectedRewards.stones}</span>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2 bg-slate-900 border-b border-slate-800 shrink-0">
               <button onClick={() => setActiveTab('session')} className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'session' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:bg-slate-800'}`}>
                 Manual Session
               </button>
               <button onClick={() => setActiveTab('streaks')} className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'streaks' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:bg-slate-800'}`}>
                 Streak Bonus
               </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-900">
               
               {/* === TAB: SESSION === */}
               {activeTab === 'session' && (
                 <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="space-y-8">
                    
                    {/* Duration Picker */}
                    <div className="space-y-4">
                       <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex justify-between">
                         Duration
                         <span className="text-slate-300">{Math.floor(duration/60)}h {duration%60}m</span>
                       </label>
                       
                       {/* Quick Presets */}
                       <div className="grid grid-cols-4 gap-2">
                          {[30, 60, 90, 120].map(m => (
                             <button key={m} onClick={() => setDuration(m)} className={`py-2 rounded-lg text-xs font-bold border transition-all ${duration === m ? 'bg-emerald-500 text-slate-900 border-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                               {m}m
                             </button>
                          ))}
                       </div>

                       {/* Slider */}
                       <div className="flex items-center gap-4">
                         <input 
                           type="number" 
                           min="1"
                           max={MAX_DAILY_MINUTES}
                           value={duration}
                           onChange={(e) => setDuration(Math.min(MAX_DAILY_MINUTES, Math.max(0, parseInt(e.target.value) || 0)))}
                           className="w-20 p-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-center outline-none focus:border-emerald-500 transition-all"
                         />
                         <input 
                           type="range" 
                           min="10" 
                           max="720" // Slider max at 12 hours for ease, input allows more
                           step="10" 
                           value={duration > 720 ? 720 : duration} 
                           onChange={(e) => setDuration(parseInt(e.target.value))} 
                           className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                         />
                       </div>
                    </div>

                    {/* Intensity Picker */}
                    <div className="space-y-3">
                       <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Intensity</label>
                       <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                          {Object.entries(INTENSITY_CONFIG).map(([key, cfg]) => (
                             <button
                               key={key}
                               onClick={() => setIntensity(key)}
                               className={`snap-start min-w-[100px] p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${intensity === key ? `${cfg.bg} ${cfg.border} ring-1 ring-white/20 scale-105` : 'bg-slate-800 border-slate-700 opacity-60 hover:opacity-100'}`}
                             >
                                <span className={`text-xs font-bold uppercase ${cfg.color}`}>{cfg.label}</span>
                                <span className="text-[10px] font-mono text-slate-400">x{cfg.multiplier}</span>
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* Add Button */}
                    <button onClick={addSession} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 font-bold uppercase text-xs tracking-wider border border-slate-700 transition-all flex items-center justify-center gap-2 group">
                       <Plus size={16} className="group-hover:scale-110 transition-transform"/> Add Session
                    </button>

                    {/* Session List */}
                    {sessions.length > 0 && (
                       <div className="space-y-2 pt-4 border-t border-slate-800">
                          <label className="text-[10px] font-bold uppercase text-slate-500">Added Sessions</label>
                          {sessions.map(s => (
                             <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                   <div className={`w-2 h-8 rounded-full ${INTENSITY_CONFIG[s.intensity].bg.replace('/10','/80')}`}></div>
                                   <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-200">{Math.floor(s.minutes/60)}h {s.minutes%60}m</span>
                                      <span className={`text-[10px] font-bold uppercase ${INTENSITY_CONFIG[s.intensity].color}`}>{INTENSITY_CONFIG[s.intensity].label}</span>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className="text-right">
                                      <div className="text-xs font-bold text-amber-400">+{s.xp} XP</div>
                                      <div className="text-[10px] text-indigo-400">+{s.stones} SS</div>
                                   </div>
                                   <button onClick={() => setSessions(prev => prev.filter(x => x.id !== s.id))} className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </motion.div>
               )}

               {/* === TAB: STREAKS === */}
               {activeTab === 'streaks' && (
                 <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="grid grid-cols-2 gap-3">
                    {ORDERED_KEYS.map(key => {
                       const count = streakCounts[key]
                       const duration = parseInt(key)
                       const displayDuration = duration > 90 ? (duration / 60) + 'h' : duration + 'm'
                       return (
                          <div key={key} className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${count > 0 ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-800/30 border-slate-800'}`}>
                             <div className="flex justify-between items-start">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wide">{STREAK_LABELS[key]}</span>
                                <span className="text-xs font-black bg-slate-950 px-2 py-1 rounded-md text-slate-400 border border-slate-800">{displayDuration}</span>
                             </div>
                             
                             <div className="flex items-center justify-between mt-2">
                                <div className="text-sm font-bold text-emerald-400">+{STREAK_VALUES[key]} XP</div>
                                <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">
                                   <button onClick={() => updateStreak(key, -1)} className="p-1 hover:text-red-400 text-slate-500 disabled:opacity-20" disabled={count === 0}><Minus size={12}/></button>
                                   <span className="text-xs font-bold w-4 text-center text-white">{count}</span>
                                   <button onClick={() => updateStreak(key, 1)} className="p-1 hover:text-emerald-400 text-slate-500"><Plus size={12}/></button>
                                </div>
                             </div>
                          </div>
                       )
                    })}
                 </motion.div>
               )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
               <button 
                 onClick={handleHarvest}
                 disabled={projectedRewards.xp === 0 && projectedRewards.stones === 0}
                 className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
               >
                 <Zap size={18} fill="currentColor"/> Absorb Essence
               </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
