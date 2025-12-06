import { useState, useEffect, useRef } from 'react'
import { Brain, ScrollText, Store, Settings, Moon, RotateCcw, Calendar, Lock, User, LogOut } from 'lucide-react'
import RealmStatus from './components/RealmStatus.jsx'
import MissionBoard from './components/MissionBoard.jsx'
import WeeklyPlan from './components/WeeklyPlan.jsx'
import BreakthroughModal from './components/BreakthroughModal.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import LateNightModal from './components/LateNightModal.jsx'
import Auth from './components/Auth.jsx'
import { useCultivation } from './context/CultivationContext.jsx'

const navItems = [
  { id: 'personal', label: 'Personal Cultivation', description: 'Manage your daily path', icon: User },
  { id: 'weekly', label: 'Weekly Plan', description: 'Track grand ambitions', icon: Calendar }, 
  { id: 'sect', label: 'Sect Missions', description: 'Community Challenges (Locked)', icon: ScrollText, locked: true }, 
  { id: 'stats', label: 'Inner World', description: 'Mind Palace (Locked)', icon: Brain, locked: true }, 
  { id: 'shop', label: 'Spirit Pavilion', description: 'Merit Exchange (Locked)', icon: Store, locked: true }, 
]

function App() {
  // ✅ استخراج البيانات من السياق مع "دروع حماية" (Default Values)
  // هذا يمنع الشاشة البيضاء إذا كانت دالة معينة غير موجودة في السياق الجديد بعد
  const context = useCultivation()
  
  // حماية إضافية في حال كان السياق نفسه غير موجود
  if (!context) {
    return <div className="text-red-500 p-10">Error: Cultivation Context is missing! Check main.jsx</div>
  }

  const { 
    session, 
    loading, 
    signOut,
    currentRealm,
    realmIndex,
    qi,
    profile,
    // القيم الافتراضية للميزات التي لم تنقل بعد
    lateNightExpiry = null, 
    extendLateNight = () => console.warn("Late Night Not Implemented Yet"), 
    disableLateNight = () => {}, 
    undoDailyReset = () => {}, 
    state = {}, 
    hardReset = () => {} 
  } = context

  const [showBreakthrough, setShowBreakthrough] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLateNightOpen, setIsLateNightOpen] = useState(false)
  const [currentView, setCurrentView] = useState('personal')
  
  const prevSessionId = useRef(null)
  const isFirstLoadAfterLogin = useRef(false)

  // ✅ إعادة تعيين الحالة عند تغيير الـ session (الخروج والدخول)
  useEffect(() => {
    const currentSessionId = session?.user?.id || null
    
    // إذا تغير الـ session (خروج أو دخول مستخدم جديد)
    if (prevSessionId.current !== currentSessionId) {
      // إعادة تعيين جميع الحالات
      isFirstLoadAfterLogin.current = true
      setShowBreakthrough(null)
      setIsSettingsOpen(false)
      setIsLateNightOpen(false)
      setCurrentView('personal')
      
      // مسح localStorage للجلسة السابقة
      if (prevSessionId.current) {
        localStorage.removeItem(`prevRealmIndex_${prevSessionId.current}`)
      }
      
      // تحديث المرجع
      prevSessionId.current = currentSessionId
    }
  }, [session?.user?.id])

  // ✅ فحص breakthrough - فقط بعد اكتمال التحميل الأولي
  useEffect(() => {
    // تأكد من أن البيانات محملة بالكامل
    if (loading || !session || !profile || realmIndex === undefined || realmIndex === null) {
      return
    }
    
    const storageKey = `prevRealmIndex_${session.user.id}`
    
    // ✅ في أول تحميل بعد الدخول، نحفظ الـ realm index الحالي بدون عرض breakthrough
    // نستخدم setTimeout للتأكد من استقرار البيانات
    if (isFirstLoadAfterLogin.current) {
      const timer = setTimeout(() => {
        localStorage.setItem(storageKey, realmIndex.toString())
        isFirstLoadAfterLogin.current = false
      }, 200) // تأخير 200ms للتأكد من استقرار البيانات
      
      return () => clearTimeout(timer)
    }
    
    // ✅ قراءة آخر realm index من localStorage
    const storedRealmIndex = localStorage.getItem(storageKey)
    const prevRealmIndex = storedRealmIndex ? parseInt(storedRealmIndex) : null
    
    // ✅ فقط إذا كان هناك زيادة حقيقية في Realm Index (breakthrough حقيقي)
    if (prevRealmIndex !== null && realmIndex > prevRealmIndex) {
      setShowBreakthrough(currentRealm)
      localStorage.setItem(storageKey, realmIndex.toString())
    } else if (prevRealmIndex === null || realmIndex !== prevRealmIndex) {
      // تحديث القيمة في localStorage حتى لو ما فيش breakthrough
      localStorage.setItem(storageKey, realmIndex.toString())
    }
  }, [realmIndex, loading, session, profile, currentRealm])

  // 1️⃣ شاشة التحميل (تظهر أثناء الاتصال بـ Supabase)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-emerald-500 animate-pulse font-mono uppercase tracking-widest text-sm">
          Consulting the Heavens...
        </p>
      </div>
    )
  }

  // 2️⃣ بوابة الدخول (إذا لم يكن هناك مستخدم مسجل)
  if (!session) {
    return <Auth />
  }

  // حساب اسم المستخدم بشكل آمن جداً
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email || "Cultivator"

  // 3️⃣ التطبيق الرئيسي
  return (
    <div className="min-h-screen bg-slate-950 text-emerald-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 z-20 hidden w-72 flex-col border-r border-amber-900/30 bg-slate-900/95 px-6 py-10 backdrop-blur md:flex">
        <div className="mb-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.6em] text-amber-200">Order of Dawn</p>
          <h1 className="text-2xl font-semibold text-emerald-400">Cultivation Log</h1>
          <div className="pt-2">
            <p className="text-xs text-slate-500 mb-1">Elder:</p>
            <h2 
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 truncate" 
              title={userName}
            >
              {userName}
            </h2>
          </div>
        </div>
        
        <nav className="space-y-4 flex-1">
          {navItems.map(({ id, label, description, icon: Icon, locked }) => (
            <button
              key={id}
              onClick={() => !locked && setCurrentView(id)}
              disabled={locked}
              className={`relative w-full rounded-2xl border px-4 py-5 text-left transition-all duration-200 group ${
                currentView === id 
                  ? 'bg-slate-900 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : locked 
                    ? 'bg-slate-950/40 border-slate-800 opacity-50 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-slate-950 via-slate-950/80 to-slate-900/60 border-amber-900/30 hover:border-amber-500/60 hover:bg-slate-900' 
              }`}
            >
              <div className={`absolute inset-0 rounded-2xl blur-3xl transition-colors ${currentView === id ? 'bg-emerald-500/10' : 'bg-transparent'}`} />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`rounded-xl border p-2 transition-colors ${
                    currentView === id 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                      : locked 
                        ? 'bg-slate-900 border-slate-700 text-slate-600'
                        : 'bg-slate-900/80 border-amber-900/40 text-amber-300 group-hover:text-amber-200'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold tracking-wide ${currentView === id ? 'text-emerald-300' : locked ? 'text-slate-500' : 'text-emerald-50'}`}>{label}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                  </div>
                </div>
                {locked && <Lock size={14} className="text-slate-600" />}
              </div>
            </button>
          ))}
        </nav>

        {/* Footer Controls */}
        <div className="mt-auto space-y-3">
          {state.previousDayState && (
            <button onClick={undoDailyReset} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-400 hover:text-white hover:border-slate-500 transition-all">
              <RotateCcw size={14} /> Undo Daily Reset
            </button>
          )}
          <div className="flex gap-2">
             <button onClick={() => setIsLateNightOpen(true)} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${lateNightExpiry ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-amber-900/30 text-slate-500 hover:text-white'}`}>
              <Moon size={18} fill={lateNightExpiry ? "currentColor" : "none"} />
              <span className="text-xs font-bold">Night</span>
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-amber-900/30 text-slate-500 hover:text-white hover:border-amber-500/50 transition-all">
              <Settings size={18} />
              <span className="text-xs font-bold">System</span>
            </button>
          </div>
        </div>
      </div>

      <main className="ml-0 min-h-screen bg-celestial-grid px-6 py-8 md:ml-72 md:px-12 md:py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <RealmStatus />
          
          {currentView === 'personal' && <MissionBoard />}
          {currentView === 'weekly' && <WeeklyPlan />}
          
          {(currentView === 'stats' || currentView === 'shop' || currentView === 'sect') && (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
              <Lock size={48} className="text-slate-700 mb-4" />
              <h2 className="text-xl font-bold text-slate-500 mb-2">Chamber Sealed</h2>
              <p className="text-xs text-slate-600 uppercase tracking-widest">
                Cultivation base insufficient to access this realm.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showBreakthrough && <BreakthroughModal realm={showBreakthrough} onClose={() => setShowBreakthrough(null)} />}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onHardReset={hardReset} onExit={signOut} />
      <LateNightModal isOpen={isLateNightOpen} onClose={() => setIsLateNightOpen(false)} onActivate={extendLateNight} onDisable={disableLateNight} currentExpiry={lateNightExpiry} />
    </div>
  )
}

export default App