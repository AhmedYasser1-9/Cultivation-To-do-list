import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sword, Sparkles } from 'lucide-react'

export default function BreakthroughModal({ realm, onClose }) {
  // إغلاق عند الضغط على أي مكان
  
  if (!realm) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <motion.div 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[120px]"
             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
             transition={{ duration: 4, repeat: Infinity }}
           />
           <motion.div 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[80px]"
             animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
             transition={{ duration: 3, repeat: Infinity, delay: 1 }}
           />
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center text-center p-8 max-w-2xl"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -50 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border-4 border-amber-400 bg-slate-900 shadow-[0_0_60px_rgba(251,191,36,0.6)]"
          >
            <Sword size={64} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 mb-2"
          >
            <Sparkles className="text-emerald-400" size={20} />
            <h2 className="text-xl font-bold uppercase tracking-[0.4em] text-emerald-400">
              Breakthrough Successful
            </h2>
            <Sparkles className="text-emerald-400" size={20} />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="text-6xl md:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-2xl py-4"
          >
            {realm.name}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur text-slate-300 text-sm"
          >
            Click anywhere to continue your path
          </motion.div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}