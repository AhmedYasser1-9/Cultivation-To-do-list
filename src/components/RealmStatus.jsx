import { motion } from 'framer-motion'
import { useCultivation } from '../context/CultivationContext.jsx'

export function RealmStatus() {
  const { qi, currentRealm, nextRealm, realmIndex, realms } = useCultivation()

  const isMaxRealm = realmIndex >= realms.length - 1
  const currentXpFloor = currentRealm?.xp ?? 0
  const nextXp = isMaxRealm ? currentXpFloor : nextRealm?.xp ?? currentXpFloor

  const rawProgress =
    !isMaxRealm && nextXp > currentXpFloor
      ? ((qi - currentXpFloor) / (nextXp - currentXpFloor)) * 100
      : 100

  const clampedProgress = Math.max(0, Math.min(100, rawProgress))

  return (
    <section className="rounded-[32px] border border-amber-900/30 bg-slate-900/60 p-6 text-emerald-50 shadow-aura backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.6em] text-amber-200">
            Realm
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-emerald-300">
            {currentRealm?.name ?? 'Unknown Realm'}
          </h2>
          <p className="mt-2 text-xs text-emerald-400/80">
            {isMaxRealm
              ? 'You stand at the Apex Sovereign tier. No higher realm awaits.'
              : 'Advancing from mortal strata toward Supreme and Sovereign heights.'}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase text-emerald-400">
          <span>Qi Channeling</span>
          <span>
            {qi.toLocaleString()} / {nextXp.toLocaleString()} Qi
          </span>
        </div>

        <div className="relative h-3 overflow-hidden rounded-full border border-amber-900/40 bg-slate-950/80">
          {/* Soft inner glow representing circulating qi */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-amber-300/10 to-red-400/10" />

          {/* Progress Bar with Direct Animation */}
          <motion.div
            className="relative h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400 shadow-[0_0_25px_rgba(52,211,153,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Subtle pulsing aura at the leading edge */}
            <motion.div
              className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-full bg-emerald-300/40 blur-lg"
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        {!isMaxRealm && (
          <p className="text-xs text-emerald-400/80">
            Breakthrough to{' '}
            <span className="font-semibold text-emerald-300">
              {nextRealm?.name}
            </span>{' '}
            at{' '}
            <span className="font-mono text-amber-200">
              {nextXp.toLocaleString()} Qi
            </span>
            .
          </p>
        )}
      </div>
    </section>
  )
}

export default RealmStatus