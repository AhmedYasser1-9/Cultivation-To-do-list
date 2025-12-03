import { motion } from 'framer-motion'
import { Gem, Zap } from 'lucide-react' // ✅ Import Gem Icon
import { useCultivation } from '../context/CultivationContext.jsx'

export function RealmStatus() {
  const { qi, spiritStones, currentRealm, nextRealm, realmIndex, realms } = useCultivation()

  const isMaxRealm = realmIndex >= realms.length - 1
  const currentXpFloor = currentRealm?.xp ?? 0
  const nextXp = isMaxRealm ? currentXpFloor : nextRealm?.xp ?? currentXpFloor

  const rawProgress =
    !isMaxRealm && nextXp > currentXpFloor
      ? ((qi - currentXpFloor) / (nextXp - currentXpFloor)) * 100
      : 100

  const clampedProgress = Math.max(0, Math.min(100, rawProgress))

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-emerald-500/20 bg-slate-900/80 p-6 text-emerald-50 shadow-2xl backdrop-blur-xl">
      
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        {/* Left: Realm Info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/60 font-bold">Current Realm</p>
          </div>
          <h2 className="text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-100 to-emerald-400 drop-shadow-sm">
            {currentRealm?.name ?? 'Mortal Dust'}
          </h2>
          <p className="mt-2 text-xs font-medium text-slate-400 max-w-md leading-relaxed">
            {isMaxRealm
              ? 'Apex reached. You have transcended all limitations.'
              : 'Circulate your Qi. Break the shackles of the mortal coil.'}
          </p>
        </div>

        {/* Right: Wealth (Spirit Stones) */}
        <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-2xl border border-indigo-500/20 shadow-inner">
          <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400">
            <Gem size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Spirit Stones</span>
            <span className="text-xl font-black text-indigo-300 font-mono leading-none">{spiritStones.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="relative z-10 mt-8 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1 text-emerald-400"><Zap size={12} fill="currentColor"/> Qi Resonance</span>
          <span className="font-mono text-emerald-200/80">
            {qi.toLocaleString()} <span className="text-slate-600">/</span> {nextXp.toLocaleString()}
          </span>
        </div>

        <div className="relative h-4 overflow-hidden rounded-full bg-slate-950 border border-slate-800 shadow-inner">
          {/* Bar Gradient */}
          <motion.div
            className="relative h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300"
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ duration: 1.2, ease: "circOut" }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>

        {!isMaxRealm && (
          <div className="flex justify-end">
            <p className="text-[10px] text-slate-500 font-medium">
              Next Breakthrough: <span className="text-emerald-400">{nextRealm?.name}</span>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default RealmStatus