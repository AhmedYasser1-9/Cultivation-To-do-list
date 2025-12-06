import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sword, Sparkles, Lock, Zap, Star } from 'lucide-react'

export default function BreakthroughModal({ realm, onClose }) {
  const [stage, setStage] = useState('locked') // locked -> cracking -> shattering -> reveal
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (realm) {
      setStage('locked')
      setParticles([])
    }
  }, [realm])

  const generateParticles = () => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1.5,
    }))
    setParticles(newParticles)
  }

  const startBreakthrough = () => {
    setStage('cracking')
    generateParticles()
    
    // الجدول الزمني للمشهد السينمائي المحسّن
    // 1. التشققات تبدأ وتنتشر (2.5 ثانية)
    setTimeout(() => {
      setStage('shattering')
    }, 2500)

    // 2. الانفجار الضوئي والكشف (بعد التكسير بـ 1.2 ثانية)
    setTimeout(() => {
      setStage('reveal')
    }, 3200)
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
              {/* Enhanced Glow Effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-emerald-500/30 to-amber-500/30 blur-[80px] rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute inset-0 bg-amber-500/10 blur-[40px] rounded-full"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock size={100} className="text-slate-700 relative z-10 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]" />
              </motion.div>
              
              <motion.div 
                className="absolute inset-0 border-4 border-amber-500/40 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            
            <motion.h2 
              className="text-4xl font-black uppercase tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(251,191,36,0.5)",
                  "0 0 40px rgba(16,185,129,0.8)",
                  "0 0 20px rgba(251,191,36,0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Bottleneck Reached
            </motion.h2>
            <motion.p 
              className="text-emerald-400 mt-4 text-base font-bold animate-pulse"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Click to shatter the barrier
            </motion.p>
          </motion.div>
        )}


        {/* ================= STAGE 2 & 3: CRACKING & SHATTERING ================= */}
        {(stage === 'cracking' || stage === 'shattering') && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none overflow-hidden">
            
            {/* 1. Enhanced Screen Shake Effect */}
            <motion.div
              className="absolute inset-0 bg-black"
              animate={{ 
                x: stage === 'shattering' ? [-10, 10, -10, 10, -5, 5, 0] : [-3, 3, -3, 3, 0], 
                y: stage === 'shattering' ? [-10, 10, -10, 10, -5, 5, 0] : [-3, 3, -3, 3, 0],
                rotate: stage === 'shattering' ? [-1, 1, -1, 1, 0] : 0
              }}
              transition={{ 
                duration: stage === 'shattering' ? 0.15 : 0.3, 
                repeat: stage === 'shattering' ? 8 : Infinity,
                ease: "easeInOut"
              }}
            />

            {/* 2. Enhanced Cracks with Multiple Layers */}
            <svg viewBox="0 0 100 100" className="absolute w-full h-full opacity-100">
              {/* Main Cracks - More Dynamic */}
              {[
                "M50 50 L30 20 L10 30 M50 50 L70 20 L90 10",
                "M50 50 L20 60 L10 80 M50 50 L80 70 L90 90",
                "M50 50 L60 40 L80 50 M50 50 L40 60 L20 50",
                "M50 50 L35 35 L15 15 M50 50 L65 65 L85 85"
              ].map((path, idx) => (
                <motion.path
                  key={idx}
                  d={path}
                  fill="transparent"
                  stroke={stage === 'shattering' ? "#ffffff" : "#fbbf24"}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, strokeWidth: 0.5, opacity: 1 }}
                  animate={stage === 'shattering' 
                    ? { 
                        pathLength: 1, 
                        strokeWidth: [2, 25, 0], 
                        opacity: [1, 1, 0],
                        stroke: ["#fbbf24", "#ffffff", "#ffffff"]
                      }
                    : { 
                        pathLength: 1, 
                        strokeWidth: [0.5, 2, 1],
                        opacity: [0.5, 1, 0.8]
                      }
                  }
                  transition={{ 
                    duration: stage === 'shattering' ? 0.6 : 1.5 + idx * 0.2, 
                    delay: idx * 0.1,
                    ease: stage === 'shattering' ? "easeOut" : "easeInOut"
                  }}
                />
              ))}
            </svg>

            {/* 3. Enhanced Particle Effects */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 rounded-full bg-amber-400"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                initial={{ 
                  scale: 0, 
                  opacity: 0,
                  x: 0,
                  y: 0
                }}
                animate={stage === 'shattering' ? {
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                } : {
                  scale: [0, 1, 0.5],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: "easeOut"
                }}
              />
            ))}

            {/* 4. Enhanced Impact Ripples - Multiple Waves */}
            {[0, 0.2, 0.4].map((delay, idx) => (
              <motion.div 
                key={idx}
                className="absolute w-[300px] h-[300px] border-2 border-amber-500/60 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 4], 
                  opacity: [0.8, 0],
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: delay,
                  repeat: stage === 'cracking' ? Infinity : 0,
                  ease: "easeOut"
                }}
              />
            ))}

            {/* 5. Central Energy Burst */}
            {stage === 'shattering' && (
              <motion.div
                className="absolute w-[500px] h-[500px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(251,191,36,0.8) 0%, rgba(16,185,129,0.6) 50%, transparent 100%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 3], opacity: [1, 1, 0] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
          </div>
        )}


        {/* ================= ENHANCED WHITE FLASH BANG ================= */}
        {stage === 'shattering' && (
          <>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-white via-amber-100 to-emerald-100 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.8, 0] }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute inset-0 bg-white z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          </>
        )}


        {/* ================= STAGE 4: THE REVEAL (NEW REALM) - ENHANCED ================= */}
        {stage === 'reveal' && (
          <motion.div
            className="relative z-50 flex flex-col items-center text-center p-8 max-w-4xl w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            {/* Enhanced Divine Background Aura with Multiple Layers */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[150px] -z-10"
              style={{
                background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, rgba(16,185,129,0.15) 50%, transparent 100%)'
              }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] -z-10"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(251,191,36,0.2) 50%, transparent 100%)'
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />

            {/* Enhanced Realm Icon with Glow */}
            <motion.div 
              initial={{ scale: 0, rotate: -360, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 100,
                damping: 15,
                duration: 1.2
              }}
              className="mb-10 relative"
            >
              {/* Outer Glow Rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-amber-400/60"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-amber-400 bg-slate-900/90 shadow-[0_0_100px_rgba(251,191,36,0.6)] backdrop-blur-sm">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sword size={80} className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced Title with Better Animation */}
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
            >
              <motion.div 
                className="flex items-center justify-center gap-4 mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="text-emerald-400" size={32} />
                </motion.div>
                <motion.h3 
                  className="text-2xl font-bold uppercase tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400"
                  animate={{ 
                    textShadow: [
                      "0 0 20px rgba(16,185,129,0.5)",
                      "0 0 40px rgba(251,191,36,0.8)",
                      "0 0 20px rgba(16,185,129,0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Ascension Successful
                </motion.h3>
                <motion.div
                  animate={{ rotate: [0, -360], scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="text-emerald-400" size={32} />
                </motion.div>
              </motion.div>

              <motion.h1 
                className="text-7xl md:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-emerald-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] py-6"
                animate={{ 
                  scale: [1, 1.02, 1],
                  textShadow: [
                    "0 0 30px rgba(251,191,36,0.4)",
                    "0 0 50px rgba(16,185,129,0.6)",
                    "0 0 30px rgba(251,191,36,0.4)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {realm.name}
              </motion.h1>
            </motion.div>

            {/* Enhanced Story Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 1.2 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <motion.p 
                className="text-xl text-slate-200 leading-relaxed font-medium"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                "The shackles of the previous realm have shattered. You now stand upon a higher peak, gazing into the vast dao."
              </motion.p>
              <motion.p 
                className="text-sm text-emerald-400/80 mt-6 italic font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
              >
                ✨ New features unlocked: Inner World capacity increased ✨
              </motion.p>
            </motion.div>

            {/* Enhanced Close Button */}
            <motion.button
              onClick={onClose}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 3.5, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(251,191,36,0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="mt-16 px-12 py-5 rounded-full border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-200 hover:from-amber-500 hover:to-emerald-500 hover:text-slate-900 transition-all uppercase tracking-widest text-sm font-bold shadow-[0_0_30px_rgba(251,191,36,0.3)]"
            >
              Stabilize Foundation
            </motion.button>

          </motion.div>
        )}

      </motion.div>
    </AnimatePresence>
  )
}