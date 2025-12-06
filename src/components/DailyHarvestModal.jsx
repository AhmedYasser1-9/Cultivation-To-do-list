import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Zap, Minus, Plus, X, Trash2, AlertTriangle, Info } from 'lucide-react'
import { DIFFICULTY_TIERS, STREAK_VALUES } from '../context/CultivationContext.jsx'

// إعدادات المضاعفات والألوان
const INTENSITY_CONFIG = {
  'low': { multiplier: 1.0, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50' },
  'low-med': { multiplier: 1.2, color: 'text-teal-400', bg: 'bg-teal-500/20', border: 'border-teal-500/50' },
  'med': { multiplier: 1.4, color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/50' },
  'med-high': { multiplier: 1.6, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' },
  'high': { multiplier: 1.8, color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/50' },
  'high-extreme': { multiplier: 2.2, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50' },
  'extreme': { multiplier: 3.0, color: 'text-rose-500', bg: 'bg-rose-500/20', border: 'border-rose-500/50' },
}

const STREAK_LABELS = {
  15: 'Warmup', 30: 'Focus', 45: 'Flow',
  60: 'Deep', 90: 'Iron', 120: 'Zone',
  180: 'Marathon', 240: 'Beast', 300: 'Apex'
}

const ORDERED_KEYS = ['15', '30', '45', '60', '90', '120', '180', '240', '300']
const MAX_DAILY_MINUTES = 1440 // 24 Hours Limit

export default function DailyHarvestModal({ isOpen, onClose, onConfirm }) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [intensity, setIntensity] = useState('low')
  const [sessions, setSessions] = useState([]) 
  const [streakCounts, setStreakCounts] = useState(ORDERED_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))

  // ✅ Fix: Safe ID Generation
  const generateId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // --- CALCULATIONS ---

  // 1. Total Manual Time (Capped at 24h)
  const currentTotalMinutes = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.minutes, 0)
  }, [sessions])

  // 2. Total Streak Time (Separate Cap at 24h)
  const currentStreakMinutes = useMemo(() => {
    return Object.entries(streakCounts).reduce((acc, [key, count]) => acc + (parseInt(key) * count), 0)
  }, [streakCounts])

  // Limits
  const isLimitReached = currentTotalMinutes >= MAX_DAILY_MINUTES
  const isStreakLimitReached = currentStreakMinutes >= MAX_DAILY_MINUTES

  // Rewards
  const projectedRewards = useMemo(() => {
    const timeXP = sessions.reduce((acc, s) => acc + s.xp, 0)
    const timeStones = sessions.reduce((acc, s) => acc + s.stones, 0)
    const streakBonusXP = Object.entries(streakCounts).reduce((acc, [key, count]) => acc + ((STREAK_VALUES[key] || 0) * count), 0)
    
    return { xp: timeXP + streakBonusXP, stones: timeStones }
  }, [sessions, streakCounts])

  // --- ACTIONS ---

  const updateStreak = (duration, delta) => {
    const dur = parseInt(duration)
    
    // ✅ Logic Fix: Prevent adding streaks if total streak time exceeds 24h
    if (delta > 0) {
      if (currentStreakMinutes + dur > MAX_DAILY_MINUTES) {
        alert("Impossible! Your streaks cannot exceed 24 hours in a single day.")
        return
      }
    }

    setStreakCounts(prev => ({ ...prev, [duration]: Math.max(0, prev[duration] + delta) }))
  }

  const addSession = () => {
    const totalInput = (Number(hours) * 60) + Number(minutes)
    if (totalInput === 0) return
    
    // ✅ Logic Fix: Prevent adding sessions if total manual time exceeds 24h
    if (currentTotalMinutes + totalInput > MAX_DAILY_MINUTES) {
      alert("Cultivator! One day only has 24 hours.")
      return
    }

    const config = INTENSITY_CONFIG[intensity] || INTENSITY_CONFIG['low']
    const baseXP = Math.round((50 * totalInput) / 60)
    const stones = Math.floor((totalInput / 6) * config.multiplier) 
    const xp = Math.floor(baseXP * config.multiplier)

    setSessions([...sessions, { 
      id: generateId(), 
      minutes: totalInput, 
      intensity, 
      xp, stones 
    }])
    setHours(0); setMinutes(0);
  }

  const removeSession = (id) => { setSessions(sessions.filter(s => s.id !== id)) }

  const handleHarvest = (e) => {
    e.preventDefault()
    onConfirm(
      currentTotalMinutes, 
      streakCounts, 
      projectedRewards.xp, 
      projectedRewards.stones
    )
    // Reset
    setHours(0); setMinutes(0); setIntensity('low'); setSessions([]);
    setStreakCounts(ORDERED_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))
  }

  const progressPercent = Math.min(100, (currentTotalMinutes / MAX_DAILY_MINUTES) * 100)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="relative w-full max-w-5xl bg-slate-900 border-2 border-emerald-500/30 rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
            
            {/* --- HEADER --- */}
            <div className="bg-slate-800/80 px-8 py-6 flex items-center justify-between border-b border-white/5 shrink-0">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-2 flex items-center gap-3">
                  <Clock className="text-emerald-400" size={36}/> Spirit Harvest
                </h2>
                <div className="flex items-center gap-4 text-lg font-mono text-slate-400">
                  <span className={`text-4xl font-black ${isLimitReached ? "text-red-400" : "text-emerald-400"}`}>
                    {Math.floor(currentTotalMinutes/60)}h {currentTotalMinutes%60}m
                  </span> 
                  <span className="opacity-50 text-sm font-bold uppercase tracking-wider mt-2">/ 24h Logged</span>
                </div>
              </div>
              
              {/* Rewards Summary */}
              <div className="hidden lg:flex items-center gap-8 bg-slate-950/50 px-8 py-4 rounded-3xl border border-slate-700/50 shadow-inner">
                <div className="text-center">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Qi Essence</span>
                  <span className="text-5xl font-black text-amber-400 drop-shadow-sm">+{projectedRewards.xp}</span>
                </div>
                <div className="w-px h-12 bg-slate-800"></div>
                <div className="text-center">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Stones</span>
                  <span className="text-5xl font-black text-indigo-400 drop-shadow-sm">+{projectedRewards.stones}</span>
                </div>
              </div>

              <button onClick={onClose} className="p-4 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors absolute top-6 right-6 lg:static"><X size={28}/></button>
            </div>

            {/* Progress Line */}
            <div className="h-2 w-full bg-slate-800">
              <motion.div 
                className={`h-full ${isLimitReached ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-300'}`} 
                initial={{ width: 0 }} 
                animate={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* --- BODY --- */}
            <div className="p-8 space-y-12 overflow-y-auto custom-scrollbar flex-1 bg-slate-900">
              
              {/* === SYSTEM 1: MANUAL TIME LOGGING === */}
              <div className="space-y-8 p-6 rounded-[2rem] bg-slate-800/20 border border-white/5">
                 <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-2xl font-bold text-emerald-100 uppercase tracking-widest flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-900/20"><Clock size={28}/></div>
                      1. Time Log
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Info size={14}/> Source of Base XP & Stones
                    </div>
                 </div>

                 <div className="flex flex-col xl:flex-row gap-8">
                    {/* Time Inputs */}
                    <div className="flex-1 bg-slate-950/50 rounded-[2rem] p-8 border-2 border-slate-800 flex gap-8 items-center justify-center">
                      {['Hrs', 'Min'].map((label, idx) => (
                        <div key={label} className="flex flex-col gap-4 items-center w-full">
                          <label className="text-sm font-black uppercase text-slate-500 tracking-[0.4em]">{label}</label>
                          <input 
                            type="number" 
                            min="0" 
                            max={idx === 0 ? 23 : 59} 
                            value={idx === 0 ? (hours === 0 ? '' : hours) : (minutes === 0 ? '' : minutes)} 
                            onChange={e => {
                              let val = parseInt(e.target.value) || 0;
                              if (val < 0) val = 0;
                              if (idx === 0) setHours(Math.min(23, val));
                              else setMinutes(Math.min(59, val));
                            }} 
                            className="w-full h-32 bg-slate-900 border-4 border-slate-800 rounded-3xl text-center text-8xl font-black text-white focus:border-emerald-500 focus:bg-slate-950 outline-none transition-all placeholder:text-slate-800 placeholder:text-8xl"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Intensity & Add */}
                    <div className="flex-1 flex flex-col gap-4">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Focus Intensity</label>
                       <div className="grid grid-cols-4 gap-3 h-full">
                          {Object.keys(DIFFICULTY_TIERS).map((key) => {
                            const config = INTENSITY_CONFIG[key]
                            const isSelected = intensity === key
                            const label = DIFFICULTY_TIERS[key]?.label?.split('-')[0] || key;
                            return (
                              <button 
                                key={key} 
                                onClick={() => setIntensity(key)} 
                                className={`rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${isSelected ? `${config.bg} ${config.border} ring-4 ring-white/10 scale-105 z-10` : 'bg-slate-900 border-slate-800 opacity-50 hover:opacity-100 hover:border-slate-600'}`}
                              >
                                <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? config.color : 'text-slate-400'}`}>{label}</span>
                                <span className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-white' : 'text-slate-600'}`}>x{config.multiplier}</span>
                              </button>
                            )
                          })}
                          <button 
                            onClick={addSession} 
                            disabled={(hours === 0 && minutes === 0) || isLimitReached} 
                            className="col-span-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex flex-col items-center justify-center gap-2 shadow-xl shadow-emerald-900/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                          >
                             <Plus size={40} strokeWidth={4}/> <span className="text-[10px] font-black uppercase tracking-widest">ADD</span>
                          </button>
                       </div>
                    </div>
                 </div>
                 
                 {/* Active Sessions List */}
                 <AnimatePresence>
                 {sessions.length > 0 && (
                    <div className="flex flex-wrap gap-3 p-4 bg-slate-950/30 rounded-3xl border border-slate-800/50">
                      {sessions.map(s => {
                        const tierLabel = DIFFICULTY_TIERS[s.intensity]?.label || s.intensity;
                        return (
                          <motion.div initial={{scale:0, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0, opacity:0}} key={s.id} className="flex items-center gap-5 bg-slate-900 pl-6 pr-4 py-4 rounded-2xl border border-slate-800 shadow-lg">
                             <div className="flex flex-col">
                               <span className={`text-[10px] font-black uppercase tracking-wider ${INTENSITY_CONFIG[s.intensity]?.color}`}>{tierLabel}</span>
                               <span className="text-3xl font-mono font-bold text-white leading-none mt-1">{Math.floor(s.minutes/60)}h {s.minutes%60}m</span>
                             </div>
                             <div className="flex flex-col text-xs font-bold text-slate-500 font-mono leading-tight text-right gap-1">
                                <span><span className="text-amber-500 text-lg">+{s.xp}</span> XP</span>
                                <span><span className="text-indigo-400 text-lg">+{s.stones}</span> SS</span>
                             </div>
                             <div className="w-px h-10 bg-slate-700 mx-2"></div>
                             <button onClick={() => removeSession(s.id)} className="p-2 rounded-xl bg-slate-800 text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"><Trash2 size={20}/></button>
                          </motion.div>
                        )
                      })}
                    </div>
                 )}
                 </AnimatePresence>
              </div>

              {/* === SYSTEM 2: STREAK BONUSES === */}
              <div className="space-y-8 p-6 rounded-[2rem] bg-slate-800/20 border border-white/5">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <h3 className="text-2xl font-bold text-slate-200 uppercase tracking-widest flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-900/20"><Zap size={28}/></div>
                    2. Streak Bonuses
                  </h3>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">XP Multiplier Only</span>
                    <span className={`text-sm font-mono font-bold px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 ${isStreakLimitReached ? "text-red-400 border-red-900/50" : "text-slate-400"}`}>
                      Limit Check: {Math.floor(currentStreakMinutes/60)}h {currentStreakMinutes%60}m / 24h
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                  {ORDERED_KEYS.map(key => {
                    const count = streakCounts[key]
                    const isActive = count > 0
                    const duration = parseInt(key)
                    const isDisabled = !isActive && (currentStreakMinutes + duration > MAX_DAILY_MINUTES)

                    return (
                      <div key={key} className={`relative flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${isActive ? 'bg-slate-800/80 border-indigo-500/40 shadow-xl shadow-indigo-900/10' : 'bg-slate-900/30 border-slate-800'}`}>
                        {/* Label */}
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-5xl font-black ${isActive ? 'text-white' : 'text-slate-700'}`}>{key}</span>
                            <span className="text-sm font-bold text-slate-600 uppercase">min</span>
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-wider mt-2 ${isActive ? 'text-indigo-300' : 'text-slate-600'}`}>{STREAK_LABELS[key]}</span>
                          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit ${isActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950 border-slate-800'}`}>
                             <span className={`text-sm font-mono font-bold ${isActive ? 'text-emerald-400' : 'text-slate-700'}`}>+{STREAK_VALUES[key]} XP</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col items-center gap-3">
                          <button 
                            type="button" 
                            disabled={isDisabled}
                            onClick={() => updateStreak(key, 1)} 
                            className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all shadow-lg ${isDisabled ? 'bg-slate-900 border-slate-800 opacity-30 cursor-not-allowed' : 'bg-slate-800 border-slate-700 hover:bg-indigo-600 hover:text-white text-slate-400 hover:border-indigo-500 hover:scale-105 active:scale-95'}`}
                          >
                            <Plus size={28} strokeWidth={3}/>
                          </button>
                          
                          <span className={`text-4xl font-black w-14 text-center ${count > 0 ? 'text-white' : 'text-slate-800'}`}>{count}</span>
                          
                          <button 
                            type="button" 
                            disabled={count === 0}
                            onClick={() => updateStreak(key, -1)} 
                            className={`w-14 h-14 flex items-center justify-center rounded-2xl border border-slate-700 transition-all ${count === 0 ? 'opacity-10 bg-transparent' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 active:scale-95'}`}
                          >
                            <Minus size={28} strokeWidth={3}/>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* --- FOOTER --- */}
            <div className="p-8 border-t border-slate-800 bg-slate-900 shrink-0 flex flex-col md:flex-row gap-8 items-center">
               <div className="flex-1 w-full md:w-auto flex justify-between md:justify-start gap-12 px-4">
                  <div>
                     <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Qi</span>
                     <span className="text-4xl font-black text-emerald-400">+{projectedRewards.xp}</span>
                  </div>
                  <div>
                     <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Stones</span>
                     <span className="text-4xl font-black text-indigo-400">+{projectedRewards.stones}</span>
                  </div>
               </div>
              <button onClick={handleHarvest} className="w-full md:w-auto flex-[2] flex items-center justify-center gap-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 py-6 text-3xl font-black uppercase text-white shadow-2xl shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/30 transition-all active:scale-[0.98]">
                <Zap size={36} fill="currentColor" /> 
                <span className="tracking-[0.2em]">ABSORB ESSENCE</span>
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}