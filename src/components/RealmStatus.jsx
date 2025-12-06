import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gem, Zap, Beaker, Sparkles, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'

export function RealmStatus() {
  const { qi, spiritStones, currentRealm, nextRealm, realmIndex, realms, inventory, shopItems, session } = useCultivation()
  const [timeRemaining, setTimeRemaining] = useState({})
  const [showAllActive, setShowAllActive] = useState(false)

  const isMaxRealm = realmIndex >= realms.length - 1
  const currentXpFloor = currentRealm?.xp ?? 0
  const nextXp = isMaxRealm ? currentXpFloor : nextRealm?.xp ?? currentXpFloor

  const rawProgress =
    !isMaxRealm && nextXp > currentXpFloor
      ? ((qi - currentXpFloor) / (nextXp - currentXpFloor)) * 100
      : 100

  const clampedProgress = Math.max(0, Math.min(100, rawProgress))

  // ✅ 3. الحصول على جميع الحبات النشطة (بدلاً من واحدة فقط)
  // ✅ استخدام useMemo لضمان التحديث الفوري
  const activeConsumables = useMemo(() => {
    return inventory
      .filter(inv => {
        const shopItem = shopItems.find(s => s.id === inv.item_id)
        return inv.is_active && shopItem?.category === 'consumable'
      })
      .map(inv => {
        const shopItem = shopItems.find(s => s.id === inv.item_id)
        return { ...inv, shopItem }
      })
      .filter(item => item.shopItem)
  }, [inventory, shopItems])
  const MAX_VISIBLE = 2 // ✅ عدد الحبات الظاهرة قبل القائمة
  const visibleItems = activeConsumables.slice(0, MAX_VISIBLE)
  const hiddenItems = activeConsumables.slice(MAX_VISIBLE)

  // ✅ حساب الوقت المتبقي لجميع الحبات النشطة
  useEffect(() => {
    if (!session?.user?.id || activeConsumables.length === 0) {
      setTimeRemaining({})
      return
    }

    const expiryStorageKey = `inventory_expiry_${session.user.id}`
    
    const updateTimers = () => {
      const expiryData = JSON.parse(localStorage.getItem(expiryStorageKey) || '{}')
      const newTimeRemaining = {}
      
      activeConsumables.forEach(item => {
        const expiryTime = expiryData[item.id]
        if (!expiryTime) return
        
        const now = new Date()
        const expiry = new Date(expiryTime)
        const diff = expiry - now

        if (diff <= 0) {
          return
        }

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        newTimeRemaining[item.id] = { hours, minutes, seconds }
      })
      
      setTimeRemaining(newTimeRemaining)
    }

    updateTimers()
    const interval = setInterval(updateTimers, 1000)

    return () => clearInterval(interval)
  }, [activeConsumables, session?.user?.id])

  const formatTime = (time) => {
    if (!time) return null
    if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m`
    } else if (time.minutes > 0) {
      return `${time.minutes}m ${time.seconds}s`
    } else {
      return `${time.seconds}s`
    }
  }

  const renderActivePill = (item, index) => {
    const timer = timeRemaining[item.id]
    return (
      <motion.div 
        key={item.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex items-center gap-3 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 px-4 py-3 rounded-2xl border border-emerald-500/40 shadow-lg shadow-emerald-900/20"
      >
        <div className="relative">
          <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
            <Beaker size={20} />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border-2 border-slate-900" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={12} className="text-emerald-300 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Active Pill</span>
          </div>
          <p className="text-sm font-bold text-emerald-100 leading-tight">
            {item.shopItem.name}
          </p>
          <p className="text-[10px] text-emerald-400/70 mt-0.5 line-clamp-1">
            {item.shopItem.description}
          </p>
          {/* ✅ Timer Display */}
          {timer && (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-emerald-950/50 rounded-lg border border-emerald-500/30 w-fit">
              <Clock size={10} className="text-emerald-400" />
              <span className="text-[10px] font-mono font-bold text-emerald-300">
                {formatTime(timer)}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-emerald-500/20 bg-slate-900/80 p-6 text-emerald-50 shadow-2xl backdrop-blur-xl">
      
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        {/* Left: Realm Info */}
        <div className="flex-1">
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

        {/* Right: Wealth & Active Items */}
        <div className="flex flex-col gap-3">
          {/* Spirit Stones */}
          <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-2xl border border-indigo-500/20 shadow-inner">
            <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400">
              <Gem size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Spirit Stones</span>
              <span className="text-xl font-black text-indigo-300 font-mono leading-none">{spiritStones.toLocaleString()}</span>
            </div>
          </div>

          {/* ✅ 3. Active Consumables Display - مع دعم عدة حبات */}
          {activeConsumables.length > 0 && (
            <div className="flex flex-col gap-2">
              {/* Visible Items */}
              <AnimatePresence>
                {visibleItems.map((item, index) => renderActivePill(item, index))}
              </AnimatePresence>

              {/* Hidden Items (Collapsible) */}
              {hiddenItems.length > 0 && (
                <>
                  <button
                    onClick={() => setShowAllActive(!showAllActive)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950/50 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30 transition-all text-xs font-bold"
                  >
                    <span>{showAllActive ? 'Hide' : `+${hiddenItems.length} More Active`}</span>
                    {showAllActive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  
                  <AnimatePresence>
                    {showAllActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-2 overflow-hidden"
                      >
                        {hiddenItems.map((item, index) => renderActivePill(item, index))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          )}
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
