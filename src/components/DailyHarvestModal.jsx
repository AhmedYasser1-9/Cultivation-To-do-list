import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Zap, Minus, Plus, X } from 'lucide-react'

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

// مكون الوقت مع أرقام ملونة واضحة
const TimeInputControl = ({ value, onChange, label, max }) => (
  <div className="flex flex-col gap-2 flex-1">
    <label className="text-xs font-bold uppercase text-slate-400 tracking-widest text-center">
      {label}
    </label>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-16 w-12 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all active:scale-95"
      >
        <Minus size={20} />
      </button>
      
      {/* الشاشة الرقمية: لون أخضر مضيء للأرقام */}
      <div className="relative flex-1 h-16 bg-slate-950 border-2 border-slate-800 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
        <input 
          type="number" 
          min="0" 
          max={max}
          value={value === 0 ? '' : value} 
          placeholder="0"
          onClick={(e) => e.target.select()}
          onChange={e => {
            let v = parseInt(e.target.value)
            if (isNaN(v)) v = 0
            if (max && v > max) v = max 
            onChange(v)
          }} 
          className="w-full h-full bg-transparent text-center text-4xl font-black text-emerald-400 outline-none placeholder-slate-800" 
        />
      </div>
      
      <button
        type="button"
        onClick={() => {
          if (max && value >= max) return
          onChange(value + 1)
        }}
        className="h-16 w-12 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 hover:border-emerald-500/50 transition-all active:scale-95"
      >
        <Plus size={20} />
      </button>
    </div>
  </div>
)

export default function DailyHarvestModal({ isOpen, onClose, onConfirm }) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  
  const ORDERED_KEYS = ['15', '30', '45', '60', '90', '120', '180', '240', '300']

  const [streakCounts, setStreakCounts] = useState(
    ORDERED_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  )

  const updateStreak = (duration, delta) => {
    setStreakCounts(prev => ({
      ...prev,
      [duration]: Math.max(0, prev[duration] + delta)
    }))
  }

  const handleHarvest = (e) => {
    e.preventDefault()
    const totalMinutes = (Number(hours) * 60) + Number(minutes)
    if (totalMinutes === 0 && Object.values(streakCounts).every(v => v === 0)) return

    onConfirm(totalMinutes, streakCounts)
    setHours(0); setMinutes(0);
    setStreakCounts(ORDERED_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div 
            className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto"
            initial={{ scale: 0.95, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.95, y: 20 }}
          >
            
            <div className="bg-slate-800/50 px-6 py-4 flex items-center justify-between border-b border-white/5">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-emerald-100 flex items-center gap-3">
                  <Clock className="text-emerald-400" size={24}/> Daily Harvest
                </h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleHarvest} className="p-6 space-y-8">
              
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                <div className="flex gap-6">
                  <TimeInputControl label="Hours" value={hours} onChange={setHours} max={24} />
                  <TimeInputControl label="Minutes" value={minutes} onChange={setMinutes} max={59} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap size={14}/> Streak Multipliers
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ORDERED_KEYS.map(key => (
                    <div key={key} className="flex flex-col bg-slate-800/40 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-emerald-100 uppercase">{STREAK_LABELS[key]}</span>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">+{STREAK_VALUES[key]}</span>
                      </div>
                      
                      <div className="flex items-center justify-between bg-slate-950 rounded-lg p-1 border border-slate-700">
                        <button type="button" onClick={() => updateStreak(key, -1)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400"><Minus size={14}/></button>
                        <span className="text-lg font-bold text-white w-6 text-center">{streakCounts[key]}</span>
                        <button type="button" onClick={() => updateStreak(key, 1)} className="w-8 h-8 flex items-center justify-center rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"><Plus size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-lg font-black uppercase text-white shadow-xl shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-[0.98]"
              >
                <Zap size={20} fill="currentColor" /> 
                Absorb Daily Qi
              </button>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}