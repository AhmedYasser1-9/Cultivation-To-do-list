import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Zap, Minus, Plus, X, Flame, Trash2 } from 'lucide-react'
import { DIFFICULTY_TIERS } from '../context/CultivationContext.jsx'

// إعدادات المضاعفات
const INTENSITY_CONFIG = {
  'low': { multiplier: 1.0, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50' },
  'low-med': { multiplier: 1.2, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/50' },
  'med': { multiplier: 1.4, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/50' },
  'med-high': { multiplier: 1.6, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50' },
  'high': { multiplier: 1.8, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/50' },
  'high-extreme': { multiplier: 2.2, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50' },
  'extreme': { multiplier: 3.0, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/50' },
}

const STREAK_VALUES = {
  15: 10, 30: 25, 45: 50,
  60: 100, 90: 200, 120: 400,
  180: 750, 240: 1200, 300: 1800
}

const STREAK_LABELS = {
  15: '15m Warmup', 30: '30m Focus', 45: '45m Flow',
  60: '60m Deep', 90: '90m Iron', 120: '2h Zone',
  180: '3h Marathon', 240: '4h Beast', 300: '5h Apex'
}

const TimeInputControl = ({ value, onChange, label, max }) => (
  <div className="flex flex-col gap-2 flex-1">
    <label className="text-xs font-bold uppercase text-slate-400 tracking-widest text-center">{label}</label>
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="h-14 w-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"><Minus size={18} /></button>
      <div className="relative flex-1 h-14 bg-slate-950 border-2 border-slate-800 rounded-xl overflow-hidden focus-within:border-emerald-500 transition-all">
        <input type="number" min="0" max={max} value={value === 0 ? '' : value} placeholder="0" onClick={(e) => e.target.select()} onChange={e => { let v = parseInt(e.target.value); if (isNaN(v)) v = 0; if (max && v > max) v = max; onChange(v) }} className="w-full h-full bg-transparent text-center text-3xl font-black text-emerald-400 outline-none placeholder-slate-800" />
      </div>
      <button type="button" onClick={() => { if (max && value >= max) return; onChange(value + 1) }} className="h-14 w-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 transition-all"><Plus size={18} /></button>
    </div>
  </div>
)

export default function DailyHarvestModal({ isOpen, onClose, onConfirm }) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [intensity, setIntensity] = useState('low')
  const [sessions, setSessions] = useState([]) 
  
  const ORDERED_KEYS = ['15', '30', '45', '60', '90', '120', '180', '240', '300']
  const [streakCounts, setStreakCounts] = useState(ORDERED_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))

  const difficultyKeys = Object.keys(DIFFICULTY_TIERS)

  const updateStreak = (duration, delta) => {
    setStreakCounts(prev => ({ ...prev, [duration]: Math.max(0, prev[duration] + delta) }))
  }

  const addSession = () => {
    const totalMinutes = (Number(hours) * 60) + Number(minutes)
    if (totalMinutes === 0) return

    const config = INTENSITY_CONFIG[intensity]
    const baseXP = Math.round((50 * totalMinutes) / 60)
    const stones = Math.floor((totalMinutes / 6) * config.multiplier) 
    const xp = Math.floor(baseXP * config.multiplier)

    setSessions([...sessions, { 
      id: crypto.randomUUID(), 
      minutes: totalMinutes, 
      intensity, 
      multiplier: config.multiplier, 
      stones,
      xp 
    }])
    
    setHours(0); setMinutes(0);
  }

  const removeSession = (id) => { setSessions(sessions.filter(s => s.id !== id)) }

  const handleHarvest = (e) => {
    e.preventDefault()
    if (sessions.length === 0 && Object.values(streakCounts).every(v => v === 0)) return

    const totalMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0)
    const totalXP = sessions.reduce((acc, s) => acc + s.xp, 0)
    const totalStones = sessions.reduce((acc, s) => acc + s.stones, 0)

    onConfirm(totalMinutes, streakCounts, totalXP, totalStones)
    
    setHours(0); setMinutes(0); setIntensity('low'); setSessions([]);
    setStreakCounts(ORDERED_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
            
            <div className="bg-slate-800/50 px-6 py-4 flex items-center justify-between border-b border-white/5">
              <h2 className="text-xl font-black uppercase tracking-widest text-emerald-100 flex items-center gap-3"><Clock className="text-emerald-400" size={24}/> Spirit Harvest</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* --- Input Section --- */}
              <div className="space-y-4">
                 <div className="flex gap-4 items-end">
                    <div className="flex-1 bg-slate-900/50 rounded-2xl p-4 border border-slate-800 flex gap-4">
                      <TimeInputControl label="Hrs" value={hours} onChange={setHours} max={24} />
                      <TimeInputControl label="Min" value={minutes} onChange={setMinutes} max={59} />
                    </div>
                    <button onClick={addSession} disabled={hours === 0 && minutes === 0} className="h-[100px] w-24 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex flex-col items-center justify-center gap-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                       <Plus size={24} /> <span className="text-xs font-bold uppercase">Add</span>
                    </button>
                 </div>

                 {/* Intensity */}
                 <div className="grid grid-cols-4 md:grid-cols-7 gap-1">
                    {difficultyKeys.map((key) => {
                      const config = INTENSITY_CONFIG[key]
                      return (
                        <button key={key} onClick={() => setIntensity(key)} className={`py-2 rounded-lg border flex flex-col items-center transition-all ${intensity === key ? `${config.bg} ${config.border} ring-1 ring-white/30 scale-105` : 'bg-slate-950 border-slate-800 opacity-60 hover:opacity-100'}`}>
                          <span className={`text-[8px] font-black uppercase ${intensity === key ? config.color : 'text-slate-400'}`}>{DIFFICULTY_TIERS[key]?.label.split('-')[0]}</span>
                          <span className="text-[9px] font-mono text-slate-300">x{config.multiplier}</span>
                        </button>
                      )
                    })}
                 </div>
              </div>

              {/* --- Session List --- */}
              {sessions.length > 0 && (
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                   {sessions.map(s => (
                     <div key={s.id} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-3">
                           <span className={`text-xs font-bold uppercase ${INTENSITY_CONFIG[s.intensity].color}`}>{DIFFICULTY_TIERS[s.intensity].label}</span>
                           <span className="text-sm font-mono text-white">{Math.floor(s.minutes/60)}h {s.minutes%60}m</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-xs text-indigo-300 font-mono">+{s.stones} Stones</span>
                           <button onClick={() => removeSession(s.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14}/></button>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {/* --- Streaks Section (FIXED: Time + Label) --- */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Zap size={14}/> Streaks</h3>
                <div className="grid grid-cols-3 gap-2">
                  {ORDERED_KEYS.map(key => {
                    const labelParts = STREAK_LABELS[key].split(' ') // Split '15m Warmup'
                    const time = labelParts[0] // '15m'
                    const name = labelParts[1] // 'Warmup'
                    
                    return (
                      <div key={key} className="flex flex-col bg-slate-800/40 p-2 rounded-xl border border-white/5">
                        
                        {/* ✅ FIX: Display Time AND Name clearly */}
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex flex-col leading-tight">
                            <span className="text-[9px] font-bold text-amber-400">{time}</span> {/* الوقت ظاهر هنا */}
                            <span className="text-[10px] font-bold text-emerald-100 uppercase">{name}</span>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">+{STREAK_VALUES[key]}</span>
                        </div>

                        <div className="flex items-center justify-between bg-slate-950 rounded-lg p-1 border border-slate-700">
                          <button type="button" onClick={() => updateStreak(key, -1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400"><Minus size={12}/></button>
                          <span className="text-sm font-bold text-white w-4 text-center">{streakCounts[key]}</span>
                          <button type="button" onClick={() => updateStreak(key, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white"><Plus size={12}/></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Confirm */}
              <button onClick={handleHarvest} className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-lg font-black uppercase text-white shadow-xl shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-[0.98]">
                <Zap size={20} fill="currentColor" /> Absorb All Essence
              </button>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}