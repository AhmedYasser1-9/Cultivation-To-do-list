import { useState, useEffect, useRef } from 'react'
import { Brain, ScrollText, Store, Settings, Moon, Calendar, Lock, User, Flame, Package } from 'lucide-react'
import RealmStatus from './components/RealmStatus.jsx'
import MissionBoard from './components/MissionBoard.jsx'
import WeeklyPlan from './components/WeeklyPlan.jsx'
import InnerWorldStats from './components/InnerWorldStats.jsx'
import BreakthroughModal from './components/BreakthroughModal.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import LateNightModal from './components/LateNightModal.jsx'
import ShopModal from './components/ShopModal.jsx'
import InventoryModal from './components/InventoryModal.jsx'
import Toast from './components/Toast.jsx'
import Auth from './components/Auth.jsx'
import CursorEffect from './components/CursorEffect.jsx' 
import { useCultivation } from './context/CultivationContext.jsx'

const navItems = [
  { id: 'personal', label: 'Tasks', description: 'Manage your daily path', icon: User },
  { id: 'weekly', label: 'Weekly Goals', description: 'Track grand ambitions', icon: Calendar }, 
  { id: 'sect', label: 'Community', description: 'Challenges (Locked)', icon: ScrollText, locked: true }, 
  { id: 'stats', label: 'Inner World Stats', description: 'Analytics', icon: Brain, locked: false }, 
  { id: 'shop', label: 'Shop', description: 'Merit Exchange', icon: Store, locked: false }, 
]

function App() {
  const context = useCultivation()
  
  if (!context) return <div className="text-red-500 p-10">Error: Context missing!</div>

  const { 
    session, loading, signOut,
    currentRealm, realmIndex, profile,
    currentStreak, activeBgImage, activeCursor, // ✅ Get Theme States
    lateNightExpiry, 
    extendLateNight = () => {}, disableLateNight = () => {}, hardReset = () => {},
    toast, closeToast
  } = context

  const [showBreakthrough, setShowBreakthrough] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLateNightOpen, setIsLateNightOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [currentView, setCurrentView] = useState('personal')
  
  const prevSessionId = useRef(null)
  const isFirstLoadAfterLogin = useRef(false)

  useEffect(() => {
    const currentSessionId = session?.user?.id || null
    if (prevSessionId.current !== currentSessionId) {
      isFirstLoadAfterLogin.current = true
      prevRealmIndex.current = null
      setShowBreakthrough(null)
      setIsSettingsOpen(false)
      setIsLateNightOpen(false)
      setCurrentView('personal')
      if (prevSessionId.current) {
        localStorage.removeItem(`prevRealmIndex_${prevSessionId.current}`)
      }
      prevSessionId.current = currentSessionId
    }
  }, [session?.user?.id])

  const prevRealmIndex = useRef(null)

  useEffect(() => {
    if (loading || !session || !profile || realmIndex === undefined || realmIndex === null) return
    
    const storageKey = `prevRealmIndex_${session.user.id}`
    
    if (isFirstLoadAfterLogin.current) {
      const timer = setTimeout(() => {
        localStorage.setItem(storageKey, realmIndex.toString())
        prevRealmIndex.current = realmIndex
        isFirstLoadAfterLogin.current = false
      }, 200)
      return () => clearTimeout(timer)
    }
    
    const storedRealmIndex = localStorage.getItem(storageKey)
    const prevRealmIndexValue = storedRealmIndex ? parseInt(storedRealmIndex) : null
    
    if (prevRealmIndexValue !== null && realmIndex > prevRealmIndexValue) {
      setShowBreakthrough(currentRealm)
      localStorage.setItem(storageKey, realmIndex.toString())
      prevRealmIndex.current = realmIndex
    } else if (prevRealmIndexValue === null || realmIndex !== prevRealmIndexValue) {
      localStorage.setItem(storageKey, realmIndex.toString())
      prevRealmIndex.current = realmIndex
    }
  }, [realmIndex, loading, session, profile, currentRealm])

  const handleNavClick = (id) => {
    if (id === 'shop') setIsShopOpen(true)
    else setCurrentView(id)
  }

  if (loading) return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-emerald-500 animate-pulse font-mono uppercase tracking-widest text-sm">Consulting the Heavens...</p>
      </div>
  )
  if (!session) return <Auth />

  const userName = session?.user?.user_metadata?.full_name || "Cultivator"

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-100">
      {/* ✅ Cursor Effect */}
      <CursorEffect type={activeCursor} />

      {/* Sidebar */}
      <div className="fixed inset-y-0 z-20 hidden w-72 flex-col border-r border-amber-900/30 bg-slate-900/95 px-6 py-10 backdrop-blur md:flex">
        <div className="mb-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.6em] text-amber-200">Cultivation Manager</p>
          <h1 className="text-2xl font-semibold text-emerald-400">Dashboard</h1>
          <div className="pt-2">
            <div className="flex items-center justify-between gap-3">
              <div className="overflow-hidden flex-1">
                <p className="text-xs text-slate-500 mb-1">Elder:</p>
                <h2 
                  className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 truncate" 
                  title={userName}
                >
                  {userName}
                </h2>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 p-2 rounded-lg border border-slate-700 min-w-[50px]">
                <Flame size={18} className="text-amber-500 animate-pulse" fill="currentColor"/>
                <span className="text-xs font-bold text-amber-200">{currentStreak} Day</span>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="space-y-4 flex-1">
          {navItems.map(({ id, label, description, icon: Icon, locked }) => (
            <button
              key={id}
              onClick={() => !locked && handleNavClick(id)}
              disabled={locked}
              className={`relative w-full rounded-2xl border px-4 py-5 text-left transition-all duration-200 group ${
                currentView === id && id !== 'shop'
                  ? 'bg-slate-900 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : locked 
                    ? 'bg-slate-950/40 border-slate-800 opacity-50 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-slate-950 via-slate-950/80 to-slate-900/60 border-amber-900/30 hover:border-amber-500/60 hover:bg-slate-900' 
              }`}
            >
              <div className={`absolute inset-0 rounded-2xl blur-3xl transition-colors ${currentView === id ? 'bg-emerald-500/10' : 'bg-transparent'}`} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`rounded-xl border p-2 transition-colors ${currentView === id ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-900/80 border-amber-900/40 text-amber-300 group-hover:text-amber-200'}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-wide">{label}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                  </div>
                </div>
                {locked && <Lock size={14} className="text-slate-600" />}
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <button 
            onClick={() => setIsInventoryOpen(true)} 
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-amber-900/30 bg-slate-900 text-slate-500 hover:text-white hover:border-amber-500/50 transition-all"
          >
            <Package size={18} />
            <span className="text-xs font-bold">Inventory</span>
          </button>
          <div className="flex gap-2">
             <button onClick={() => setIsLateNightOpen(true)} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${lateNightExpiry ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-amber-900/30 text-slate-500 hover:text-white'}`}>
              <Moon size={18} fill={lateNightExpiry ? "currentColor" : "none"} />
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-amber-900/30 text-slate-500 hover:text-white">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Dynamic Background */}
      <main 
        className={`ml-0 min-h-screen px-6 py-8 md:ml-72 md:px-12 md:py-12 transition-all duration-500 bg-cover bg-center bg-fixed ${(!activeBgImage || typeof activeBgImage !== 'string' || !activeBgImage.includes('url')) ? (activeBgImage || 'bg-celestial-grid') : ''}`}
        style={(activeBgImage && typeof activeBgImage === 'string' && activeBgImage.includes('url')) ? { backgroundImage: activeBgImage } : {}}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <RealmStatus />
          {currentView === 'personal' && <MissionBoard />}
          {currentView === 'weekly' && <WeeklyPlan />}
          {currentView === 'stats' && <InnerWorldStats />}
        </div>
      </main>

      {/* Modals */}
      {showBreakthrough && <BreakthroughModal realm={showBreakthrough} onClose={() => setShowBreakthrough(null)} />}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onHardReset={hardReset} onExit={signOut} />
      <LateNightModal isOpen={isLateNightOpen} onClose={() => setIsLateNightOpen(false)} onActivate={extendLateNight} onDisable={disableLateNight} currentExpiry={lateNightExpiry} />
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <InventoryModal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} />
      
      <Toast 
        isOpen={toast.isOpen} 
        onClose={closeToast} 
        message={toast.message} 
        type={toast.type} 
      />
    </div>
  )
}

export default App
