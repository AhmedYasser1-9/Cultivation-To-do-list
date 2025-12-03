import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sword, Sparkles, Lock } from 'lucide-react'

export default function BreakthroughModal({ realm, onClose }) {
  const [stage, setStage] = useState('locked') // locked -> cracking -> shattering -> reveal

  useEffect(() => {
    if (realm) setStage('locked')
  }, [realm])

  const startBreakthrough = () => {
    setStage('cracking')
    
    // الجدول الزمني للمشهد السينمائي
    // 1. التشققات تبدأ وتنتشر (2 ثانية)
    setTimeout(() => {
      setStage('shattering')
    }, 2000)

    // 2. الانفجار الضوئي (بعد التكسير بـ 1.5 ثانية)
    setTimeout(() => {
      setStage('reveal')
    }, 2800)
  }

  if (!realm) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        
        {/* ================= STAGE 1: THE BARRIER (LOCKED) ================= */}
        {stage === 'locked' && (
          <motion.div 
            className="relative z-20 flex flex-col items-center justify-center cursor-pointer"
            onClick={startBreakthrough}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full animate-pulse" />
              <Lock size={80} className="text-slate-700 relative z-10" />
              <motion.div 
                className="absolute inset-0 border-4 border-slate-800 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <h2 className="text-3xl font-black uppercase tracking-[0.5em] text-slate-700">
              Bottleneck Reached
            </h2>
            <p className="text-slate-500 mt-4 text-sm animate-pulse">
              Click to attack the barrier
            </p>
          </motion.div>
        )}


        {/* ================= STAGE 2 & 3: CRACKING & SHATTERING ================= */}
        {(stage === 'cracking' || stage === 'shattering') && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            
            {/* 1. Screen Shake Effect */}
            <motion.div
              className="absolute inset-0 bg-black"
              animate={{ 
                x: [-5, 5, -5, 5, 0], 
                y: [-5, 5, -5, 0] 
              }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />

            {/* 2. The Cracks (SVG Animation) */}
            <svg viewBox="0 0 100 100" className="absolute w-full h-full opacity-90">
              {/* مسارات التشققات: تبدأ من المنتصف وتخرج للأطراف */}
              <motion.path
                d="M50 50 L30 20 L10 30 M50 50 L70 20 L90 10 M50 50 L20 60 L10 80 M50 50 L80 70 L90 90 M50 50 L60 40 L80 50"
                fill="transparent"
                stroke="#fbbf24" // لون النور (Amber)
                strokeLinecap="round"
                initial={{ pathLength: 0, strokeWidth: 0.5, opacity: 1 }}
                animate={stage === 'shattering' 
                  ? { pathLength: 1, strokeWidth: 20, opacity: 0, stroke: "#fff" } // Shatter: Cracks become pure light and expand
                  : { pathLength: 1, strokeWidth: 1 } // Cracking: Just drawing lines
                }
                transition={{ duration: stage === 'shattering' ? 0.5 : 1.5, ease: "easeInOut" }}
              />
              {/* More chaotic cracks */}
              <motion.path
                 d="M50 50 L40 40 L20 10 M50 50 L60 60 L80 90"
                 fill="transparent"
                 stroke="#fbbf24"
                 initial={{ pathLength: 0, strokeWidth: 0.2 }}
                 animate={stage === 'shattering' 
                  ? { pathLength: 1, strokeWidth: 30, opacity: 0, stroke: "#fff" } 
                  : { pathLength: 1, strokeWidth: 0.5 } 
                }
                 transition={{ duration: stage === 'shattering' ? 0.4 : 1.2, delay: 0.2 }}
              />
            </svg>

            {/* 3. Sound Waves / Impact Ripples */}
            <motion.div 
              className="absolute w-[200px] h-[200px] border-4 border-amber-500/50 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 5], opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </div>
        )}


        {/* ================= WHITE FLASH BANG ================= */}
        {stage === 'shattering' && (
          <motion.div 
            className="absolute inset-0 bg-white z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        )}


        {/* ================= STAGE 4: THE REVEAL (NEW REALM) ================= */}
        {stage === 'reveal' && (
          <motion.div
            className="relative z-50 flex flex-col items-center text-center p-8 max-w-4xl w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            {/* Divine Background Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 rounded-full blur-[120px] animate-pulse -z-10" />

            {/* Realm Icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 1.5 }}
              className="mb-10 flex h-32 w-32 items-center justify-center rounded-full border-4 border-amber-400 bg-slate-900/80 shadow-[0_0_80px_rgba(251,191,36,0.4)]"
            >
              <Sword size={64} className="text-amber-400" />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="text-emerald-400" size={24} />
                <h3 className="text-xl font-bold uppercase tracking-[0.4em] text-emerald-400">
                  Ascension Successful
                </h3>
                <Sparkles className="text-emerald-400" size={24} />
              </div>

              <h1 className="text-6xl md:text-8xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-2xl py-4">
                {realm.name}
              </h1>
            </motion.div>

            {/* Story / Lore Section (Placeholder for future) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-12 max-w-xl mx-auto"
            >
              <p className="text-lg text-slate-300 leading-relaxed font-medium">
                "The shackles of the previous realm have shattered. You now stand upon a higher peak, gazing into the vast dao."
              </p>
              <p className="text-sm text-slate-500 mt-4 italic">
                (New features unlocked: Inner World capacity increased)
              </p>
            </motion.div>

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3 }}
              className="mt-16 px-10 py-4 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500 hover:text-slate-900 transition-all uppercase tracking-widest text-xs font-bold"
            >
              Stabilize Foundation
            </motion.button>

          </motion.div>
        )}

      </motion.div>
    </AnimatePresence>
  )
}