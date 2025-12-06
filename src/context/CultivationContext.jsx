import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase } from '../supabaseClient'

// --- CONSTANTS ---
const REALMS = [
  { name: 'Condensing Pulse', xp: 0 }, { name: 'Houtian', xp: 200 }, { name: 'Xiantian', xp: 500 },
  { name: 'Revolving Core', xp: 900 }, { name: 'Life Destruction', xp: 1400 }, { name: 'Royal Sea', xp: 2000 },
  { name: 'Royal Extreme', xp: 2700 }, { name: 'Royal Transformation', xp: 3500 }, { name: 'Royal Lord', xp: 4500 },
  { name: 'World King', xp: 5600 }, { name: 'Empyrean', xp: 6800 }, { name: 'True Eggplant', xp: 8100 },
  { name: 'Absolute Mortal Peak', xp: 9500 }, { name: 'Foundation Building', xp: 11000 }, { name: '1st Great Calamity', xp: 12600 },
  { name: '2nd Great Calamity', xp: 14300 }, { name: '3rd Great Calamity', xp: 16100 }, { name: '4th Great Calamity', xp: 18000 },
  { name: '5th Great Calamity', xp: 20000 }, { name: '6th Great Calamity', xp: 22500 }, { name: '7th Great Calamity', xp: 25000 },
  { name: '8th Great Calamity', xp: 28000 }, { name: '9th Great Calamity', xp: 31000 }, { name: 'Nascent', xp: 35000 },
  { name: 'Novice', xp: 39000 }, { name: 'True', xp: 44000 }, { name: 'Spirit', xp: 49000 },
  { name: 'Earth', xp: 55000 }, { name: 'Heaven', xp: 62000 }, { name: 'Emperor', xp: 70000 },
  { name: 'Tyrant', xp: 79000 }, { name: 'Sovereignty', xp: 89000 }, { name: 'IMMORTAL', xp: 100000 },
  { name: 'Celestial Immortal', xp: 112000 }, { name: 'Immortal King', xp: 125000 }, { name: 'Conferred Immortal King', xp: 132000 },
  { name: 'Immortal Monarch', xp: 139000 }, { name: 'Immortal Emperor', xp: 145000 }, { name: 'Immortal Amogus', xp: 148000 },
  { name: 'OPM', xp: 150000 },
]

export const DIFFICULTY_TIERS = {
  'low': { label: 'Low', xp: 10 },
  'low-med': { label: 'Low-Med', xp: 20 },
  'med': { label: 'Med', xp: 35 },
  'med-high': { label: 'Med-High', xp: 50 },
  'high': { label: 'High', xp: 75 },
  'high-extreme': { label: 'High-Extreme', xp: 110 },
  'extreme': { label: 'Extreme', xp: 150 },
}

export const STREAK_VALUES = {
  15: 10, 30: 25, 45: 50, 60: 100, 90: 200, 
  120: 400, 180: 750, 240: 1200, 300: 1800
}

const ENDURANCE_MILESTONES = [
  { minutes: 180, xp: 200 }, { minutes: 300, xp: 600 }, { minutes: 480, xp: 1200 },
  { minutes: 600, xp: 1800 }, { minutes: 750, xp: 2500 }, { minutes: 900, xp: 3000 },
]

const getTodayKey = () => new Date().toISOString().slice(0, 10)

// --- MAPPERS ---
const mapTaskFromDB = (t) => {
  if (!t) return null
  return {
    ...t,
    repeat: t.repeat_type || 'once',      
    repeatDays: t.repeat_days || [],  
    isCompleted: t.is_completed || false,
    isTrivial: t.is_trivial || false,    
    tags: t.tags || [],
    subtasks: t.subtasks || []
  }
}

const mapTaskToDB = (t, userId) => ({
  user_id: userId,
  title: t.title,
  difficulty: t.difficulty,
  is_completed: t.isCompleted,
  is_trivial: t.isTrivial,
  tags: t.tags || [],
  color: t.color || 'default',
  repeat_type: t.repeat,      
  repeat_days: t.repeatDays || [],  
  notes: t.notes || '',
  subtasks: t.subtasks || [],
  order_index: t.order_index || 0
})

const CultivationContext = createContext(null)

export function CultivationProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [weeklyTargets, setWeeklyTargets] = useState([])
  const [tagColors, setTagColors] = useState({})

  // 1. Initial Load (Cache + Auth) - Optimized for Instant Display
  useEffect(() => {
    // A. Load from Cache Immediately (The Ancestral Memory)
    const loadCache = () => {
      try {
        const cachedProfile = localStorage.getItem('cultivation_profile')
        const cachedTasks = localStorage.getItem('cultivation_tasks')
        const cachedTargets = localStorage.getItem('cultivation_targets')
        const lastSync = localStorage.getItem('cultivation_last_sync')
        
        if (cachedProfile) setProfile(JSON.parse(cachedProfile))
        if (cachedTasks) setTasks(JSON.parse(cachedTasks))
        if (cachedTargets) setWeeklyTargets(JSON.parse(cachedTargets))
        
        // ✅ Always show UI immediately if we have cache (no white screen!)
        if (cachedProfile) {
          setLoading(false)
        }
        
        return lastSync ? parseInt(lastSync) : 0
      } catch (e) {
        console.warn("Cache corrupted, starting fresh.")
        return 0
      }
    }
    const lastSyncTime = loadCache()

    // B. Connect to Supabase (The Divine Link) - Background Sync Only
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        // ✅ Only sync if cache is old (> 30 seconds) or doesn't exist
        const now = Date.now()
        const syncInterval = 30000 // 30 seconds
        if (!lastSyncTime || (now - lastSyncTime) > syncInterval) {
          fetchData(session.user.id, session.user.email, true) // Background sync
        }
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        // ✅ Only sync if needed (background, no loading screen)
        const now = Date.now()
        const lastSync = parseInt(localStorage.getItem('cultivation_last_sync') || '0')
        const syncInterval = 30000
        if (!lastSync || (now - lastSync) > syncInterval) {
          fetchData(session.user.id, session.user.email, true)
        }
      } else {
        setProfile(null); setTasks([]); setWeeklyTargets([]); setLoading(false)
        // Clear cache on logout
        localStorage.removeItem('cultivation_profile')
        localStorage.removeItem('cultivation_tasks')
        localStorage.removeItem('cultivation_targets')
        localStorage.removeItem('cultivation_last_sync')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Sync State to Cache (Auto-Save to Scroll) - Instant Updates
  useEffect(() => { 
    if(profile) {
      localStorage.setItem('cultivation_profile', JSON.stringify(profile))
      // ✅ Update sync timestamp when we modify data locally
      localStorage.setItem('cultivation_last_sync', Date.now().toString())
    }
  }, [profile])
  
  useEffect(() => { 
    if(tasks.length > 0) {
      localStorage.setItem('cultivation_tasks', JSON.stringify(tasks))
      localStorage.setItem('cultivation_last_sync', Date.now().toString())
    }
  }, [tasks])
  
  useEffect(() => { 
    if(weeklyTargets.length > 0) {
      localStorage.setItem('cultivation_targets', JSON.stringify(weeklyTargets))
      localStorage.setItem('cultivation_last_sync', Date.now().toString())
    }
  }, [weeklyTargets])


  // 3. Fetch Data (Optimized with Background Sync)
  async function fetchData(userId, userEmail, isBackgroundSync = false) {
    try {
      // ✅ Only show loading if NO cache exists (first time load)
      // If background sync, never show loading screen
      if (!isBackgroundSync && !profile) {
        setLoading(true)
      }
      
      // Profile
      let { data: userProfile, error: profileError } = await supabase
        .from('profiles').select('*').eq('id', userId).single()
      
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ id: userId, username: userEmail?.split('@')[0] || 'Cultivator', last_login_date: getTodayKey() }])
          .select().single()
        userProfile = newProfile
      }

      // Reset Logic
      const today = getTodayKey()
      if (userProfile && userProfile.last_login_date !== today) {
        const lateNightExpiry = userProfile.late_night_expiry
        const isLateNightActive = lateNightExpiry && new Date(lateNightExpiry) >= new Date(today)

        if (!isLateNightActive) {
          const previousState = {
            today_total_minutes: userProfile.today_total_minutes,
            endurance_milestones: userProfile.endurance_milestones,
            last_login_date: userProfile.last_login_date
          }
          userProfile.today_total_minutes = 0
          userProfile.endurance_milestones = []
          userProfile.last_login_date = today
          userProfile.previous_day_state = previousState

          await supabase.from('profiles').update({
            today_total_minutes: 0,
            endurance_milestones: [],
            last_login_date: today,
            previous_day_state: previousState
          }).eq('id', userId)
        }
      }

      setProfile(userProfile)
      setTagColors(userProfile?.tag_colors || {})

      // Tasks
      const { data: tasksData } = await supabase
        .from('tasks').select('*').eq('user_id', userId).order('order_index', { ascending: true })
      if (tasksData) setTasks(tasksData.map(mapTaskFromDB).filter(Boolean))

      // Weekly Targets
      const { data: targetsData } = await supabase
        .from('weekly_targets').select('*').eq('user_id', userId).order('order_index', { ascending: true })
      setWeeklyTargets(targetsData || [])

      // ✅ Update sync timestamp
      localStorage.setItem('cultivation_last_sync', Date.now().toString())

    } catch (error) {
      console.error("Error communing with the Dao:", error)
      // ✅ Don't break the UI if sync fails - keep using cache
    } finally {
      if (!isBackgroundSync) {
        setLoading(false)
      }
    }
  }

  // --- Derived State ---
  const qi = profile?.qi || 0
  const spiritStones = profile?.spirit_stones || 0
  const knownTags = profile?.known_tags || []
  const lateNightExpiry = profile?.late_night_expiry || null
  const realmIndex = useMemo(() => {
    let index = 0; for (let i = 0; i < REALMS.length; i++) { if (qi >= REALMS[i].xp) index = i; else break } return index
  }, [qi])
  const currentRealm = REALMS[realmIndex] || REALMS[0]
  const nextRealm = REALMS[realmIndex + 1] || REALMS[REALMS.length - 1]

  // --- ACTIONS ---
  const signUp = (email, password, username) => supabase.auth.signUp({ email, password, options: { data: { full_name: username } } })
  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signOut = () => supabase.auth.signOut()

  // 1. Tasks
  async function addTask(task) {
    if (!session) return;
    const tempId = crypto.randomUUID()
    setTasks(prev => [{ ...task, id: tempId, isCompleted: false }, ...prev]) 

    const dbPayload = mapTaskToDB(task, session.user.id)
    const { data } = await supabase.from('tasks').insert(dbPayload).select().single()
    
    if (data) {
      setTasks(prev => prev.map(t => t.id === tempId ? mapTaskFromDB(data) : t))
      if (task.tags?.length > 0) {
        const newTags = task.tags.filter(t => !knownTags.includes(t))
        if (newTags.length > 0) {
           const updatedTags = [...knownTags, ...newTags]
           setProfile(prev => ({...prev, known_tags: updatedTags}))
           await supabase.from('profiles').update({ known_tags: updatedTags }).eq('id', session.user.id)
        }
      }
    } else {
      setTasks(prev => prev.filter(t => t.id !== tempId)) 
    }
  }

  async function updateTask(id, updates) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    const dbUpdates = {}
    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty
    if (updates.color !== undefined) dbUpdates.color = updates.color
    await supabase.from('tasks').update(dbUpdates).eq('id', id)
  }

  async function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }

  async function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const newVal = !task.isCompleted
    updateTask(id, { isCompleted: newVal })
    if (newVal && !task.isTrivial) {
       const key = String(task.difficulty).toLowerCase()
       const xpGain = DIFFICULTY_TIERS[key]?.xp || 10
       gainQi(xpGain)
    }
  }

  async function reorderTasks(newOrderedTasks) {
    setTasks(newOrderedTasks)
    const updates = newOrderedTasks.map((t, index) => ({ id: t.id, order_index: index, user_id: session.user.id }))
    await supabase.from('tasks').upsert(updates, { onConflict: 'id' })
  }

  async function duplicateTask(id) {
    const original = tasks.find(t => t.id === id)
    if(!original) return
    addTask({ ...original, title: `${original.title} (Copy)`, isCompleted: false })
  }

  // 2. Weekly Targets
  async function addWeeklyTarget(targetData) {
    if (!session) return
    const optimisticTarget = { ...targetData, id: crypto.randomUUID(), progress: 0 }
    setWeeklyTargets(prev => [optimisticTarget, ...prev])

    const dbPayload = {
      user_id: session.user.id,
      title: targetData.title,
      difficulty: targetData.difficulty || 'med',
      tags: targetData.tags || [],
      progress: 0,
      status: 'active'
    }
    const { data } = await supabase.from('weekly_targets').insert(dbPayload).select().single()
    if (data) setWeeklyTargets(prev => prev.map(t => t.id === optimisticTarget.id ? data : t))
  }

  async function updateWeeklyTarget(id, updates) {
    setWeeklyTargets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    await supabase.from('weekly_targets').update(updates).eq('id', id)
  }

  async function deleteWeeklyTarget(id) {
    setWeeklyTargets(prev => prev.filter(t => t.id !== id))
    await supabase.from('weekly_targets').delete().eq('id', id)
  }

  async function reorderWeeklyTargets(newOrderedTargets) {
    setWeeklyTargets(newOrderedTargets)
    const updates = newOrderedTargets.map((t, index) => ({
      id: t.id,
      order_index: index,
      user_id: session.user.id
    }))
    await supabase.from('weekly_targets').upsert(updates, { onConflict: 'id' })
  }

  async function contributeToWeeklyTarget(targetId, amount) {
    const target = weeklyTargets.find(t => t.id === targetId)
    if (!target) return
    const newProgress = Math.min(100, Math.max(0, (target.progress || 0) + amount))
    const newStatus = newProgress >= 100 ? 'completed' : 'active'
    setWeeklyTargets(prev => prev.map(t => t.id === targetId ? { ...t, progress: newProgress, status: newStatus } : t))
    await supabase.from('weekly_targets').update({ progress: newProgress, status: newStatus }).eq('id', targetId)
    if (newProgress >= 100 && target.progress < 100) gainStones(50)
  }

  async function duplicateWeeklyTarget(id) {
    const original = weeklyTargets.find(t => t.id === id)
    if(!original) return
    addWeeklyTarget({ title: `${original.title} (Copy)`, difficulty: original.difficulty, tags: original.tags })
  }

  // 3. Profile
  async function gainQi(amount) {
    if (!profile || amount === 0) return
    const newQi = Math.max(0, profile.qi + amount)
    setProfile(prev => ({ ...prev, qi: newQi })) 
    await supabase.from('profiles').update({ qi: newQi }).eq('id', session.user.id)
  }

  async function gainStones(amount) {
    if (!profile) return
    const newStones = (profile.spirit_stones || 0) + amount
    setProfile(prev => ({ ...prev, spirit_stones: newStones }))
    await supabase.from('profiles').update({ spirit_stones: newStones }).eq('id', session.user.id)
  }

  async function processDailyHarvest(minutesWorked, streaks, calculatedXP, calculatedStones) {
    if (!session || !profile) return
    const currentMinutes = profile.today_total_minutes || 0
    const newTotalMinutes = currentMinutes + minutesWorked
    let milestoneXP = 0
    const currentMilestones = profile.endurance_milestones || []
    const newMilestones = [...currentMilestones]
    
    ENDURANCE_MILESTONES.forEach(m => {
      if (!currentMilestones.includes(m.minutes) && newTotalMinutes >= m.minutes) {
        milestoneXP += m.xp
        newMilestones.push(m.minutes)
      }
    })

    let streakBonus = 0
    Object.entries(streaks).forEach(([key, count]) => { if(count > 0) streakBonus += (STREAK_VALUES[key] || 0) * count })

    const totalQiGained = calculatedXP + milestoneXP + streakBonus
    const newQi = (profile.qi || 0) + totalQiGained
    const newStones = (profile.spirit_stones || 0) + calculatedStones

    setProfile(prev => ({ ...prev, qi: newQi, spirit_stones: newStones, today_total_minutes: newTotalMinutes, endurance_milestones: newMilestones }))

    await Promise.all([
      supabase.from('profiles').update({ qi: newQi, spirit_stones: newStones, today_total_minutes: newTotalMinutes, endurance_milestones: newMilestones, last_login_date: getTodayKey() }).eq('id', session.user.id),
      supabase.from('cultivation_logs').insert({ user_id: session.user.id, minutes_spent: minutesWorked, qi_gained: totalQiGained, qi_total_snapshot: newQi, stones_total_snapshot: newStones, log_date: getTodayKey() })
    ])
  }

  async function setTagColor(tag, color) {
    const newColors = { ...tagColors, [tag]: color }
    setTagColors(newColors)
    await supabase.from('profiles').update({ tag_colors: newColors }).eq('id', session?.user?.id)
  }

  async function undoDailyReset() {
    if (!profile.previous_day_state) return
    const prev = profile.previous_day_state
    setProfile(curr => ({ ...curr, ...prev, previous_day_state: null }))
    await supabase.from('profiles').update({ today_total_minutes: prev.today_total_minutes, endurance_milestones: prev.endurance_milestones, last_login_date: prev.last_login_date, previous_day_state: null }).eq('id', session.user.id)
  }

  return (
    <CultivationContext.Provider value={{
      session, loading, signUp, signIn, signOut,
      profile, qi, spiritStones, tasks, weeklyTargets, knownTags,
      currentRealm, nextRealm, realmIndex, realms: REALMS,
      tagColors, lateNightExpiry, state: profile || {},
      
      gainQi, gainStones,
      addTask, updateTask, deleteTask, toggleTaskCompletion, reorderTasks, duplicateTask,
      addWeeklyTarget, updateWeeklyTarget, deleteWeeklyTarget, reorderWeeklyTargets, contributeToWeeklyTarget, duplicateWeeklyTarget,
      setTagColor, processDailyHarvest, undoDailyReset,
      
      // Placeholders
      completeTask: () => {}, 
      extendLateNight: () => console.log("Late Night Logic pending"),
      disableLateNight: () => {},
      hardReset: () => {}
    }}>
      {!loading && children}
    </CultivationContext.Provider>
  )
}

export function useCultivation() { return useContext(CultivationContext) }