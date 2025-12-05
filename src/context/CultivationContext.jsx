import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

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

const CultivationContext = createContext(null)

export function CultivationProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [weeklyTargets, setWeeklyTargets] = useState([])
  const [tagColors, setTagColors] = useState(() => {
    // Keep local preference for colors
    try { const raw = window.localStorage.getItem(TAGS_COLORS_KEY); return raw ? JSON.parse(raw) : {} } catch { return {} }
  })
  
  // Derived State
  const qi = profile?.qi || 0
  const spiritStones = profile?.spirit_stones || 0
  const lateNightExpiry = profile?.late_night_expiry || null
  
  // ✅ FIX: Calculate knownTags from loaded tasks to prevent crash
  const knownTags = useMemo(() => {
    const allTags = new Set()
    tasks.forEach(t => t.tags?.forEach(tag => allTags.add(tag)))
    weeklyTargets.forEach(t => t.tags?.forEach(tag => allTags.add(tag)))
    return Array.from(allTags)
  }, [tasks, weeklyTargets])

  // --- Auth & Load ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchData(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchData(session.user.id)
      else {
        setProfile(null); setTasks([]); setWeeklyTargets([]); setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // --- Data Fetching ---
  async function fetchData(userId) {
    try {
      setLoading(true)
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(profileData)

      const { data: tasksData } = await supabase.from('tasks').select('*').order('order_index', { ascending: true })
      setTasks(tasksData || [])

      const { data: targetsData } = await supabase.from('weekly_targets').select('*').order('order_index', { ascending: true })
      setWeeklyTargets(targetsData || [])

      // Check Reset Logic
      if (profileData) checkDailyReset(profileData)

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- Realm Logic ---
  function getRealmIndexFromQi(currentQi) {
    let index = 0; for (let i = 0; i < REALMS.length; i++) { if (currentQi >= REALMS[i].xp) index = i; else break } return index
  }
  const realmIndex = useMemo(() => getRealmIndexFromQi(qi), [qi])
  const currentRealm = REALMS[realmIndex]
  const nextRealm = REALMS[realmIndex + 1] || REALMS[REALMS.length - 1]

  // --- Actions ---
  async function updateProfile(updates) {
    if (!user) return
    const { data } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single()
    if (data) setProfile(data)
  }

  async function gainQi(amount) {
    if (!user || amount === 0) return
    const newQi = Math.max(0, qi + amount)
    await updateProfile({ qi: newQi })
  }

  async function gainStones(amount) {
    if (!user || amount === 0) return
    const newStones = Math.max(0, spiritStones + amount)
    await updateProfile({ spirit_stones: newStones })
  }

  async function addTask(task) {
    if (!user) return
    const newTask = {
      user_id: user.id,
      title: task.title,
      difficulty: task.difficulty || 'low',
      tags: task.tags || [],
      notes: task.notes || '',
      subtasks: task.subtasks || [],
      repeat_type: task.repeat || 'once',
      repeat_days: task.repeatDays || [],
      is_trivial: task.isTrivial || false,
      is_completed: false,
      order_index: tasks.length
    }
    const { data } = await supabase.from('tasks').insert([newTask]).select().single()
    if (data) setTasks(prev => [data, ...prev])
  }

  async function updateTask(id, updates) {
    const dbUpdates = { ...updates }
    // Mapping frontend fields to DB fields
    if (updates.isTrivial !== undefined) dbUpdates.is_trivial = updates.isTrivial
    if (updates.repeatDays !== undefined) dbUpdates.repeat_days = updates.repeatDays
    if (updates.repeat !== undefined) dbUpdates.repeat_type = updates.repeat
    if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted

    const { data } = await supabase.from('tasks').update(dbUpdates).eq('id', id).select().single()
    if (data) setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    await updateTask(id, { isCompleted: !task.is_completed }) // Use mapped key helper or manual
  }

  async function completeTask(task) {
    if (task.is_trivial) return
    const key = String(task.difficulty).toLowerCase()
    const xp = DIFFICULTY_TIERS[key]?.xp || 10
    await gainQi(xp)
  }

  // --- Harvest ---
  async function processDailyHarvest(minutesWorked, streaks, calculatedXP, calculatedStones) {
    if (!user) return
    await supabase.from('cultivation_logs').insert([{
      user_id: user.id, activity_type: 'daily_harvest', xp_gained: calculatedXP,
      details: { minutes: minutesWorked, stones: calculatedStones, streaks }
    }])
    
    const newQi = Math.max(0, qi + calculatedXP)
    const newStones = Math.max(0, spiritStones + calculatedStones)
    const newTodayMinutes = (profile.today_minutes || 0) + minutesWorked
    await updateProfile({ qi: newQi, spirit_stones: newStones, today_minutes: newTodayMinutes })
  }

  async function checkDailyReset(currentProfile) {
    if (!currentProfile?.last_login) return
    const lastLoginDate = new Date(currentProfile.last_login).toDateString()
    const todayDate = new Date().toDateString()

    if (lastLoginDate !== todayDate) {
      // 1. Archive & Reset Profile
      await updateProfile({ today_minutes: 0, last_login: new Date().toISOString() })
      // 2. Uncheck Daily Tasks
      await supabase.from('tasks').update({ is_completed: false }).eq('user_id', user.id).eq('repeat_type', 'daily')
      // Refresh
      fetchData(user.id)
    } else {
      updateProfile({ last_login: new Date().toISOString() })
    }
  }

  // --- Mapping for Frontend Components ---
  const mappedTasks = tasks.map(t => ({
    ...t,
    repeatDays: t.repeat_days,
    repeat: t.repeat_type,
    isCompleted: t.is_completed,
    isTrivial: t.is_trivial
  }))

  // Reorder
  async function reorderTasks(newOrderedTasks) {
    setTasks(newOrderedTasks)
    const updates = newOrderedTasks.map((t, index) => ({ id: t.id, order_index: index, user_id: user.id }))
    await supabase.from('tasks').upsert(updates, { onConflict: 'id' })
  }

  // Missing Functions Stubs (to prevent crashes in App.jsx)
  function extendLateNight() { alert("Feature coming to DB soon!") }
  function disableLateNight() { alert("Feature coming to DB soon!") }
  function hardReset() { 
    if(confirm("Are you sure? This clears local cache only now.")) {
        localStorage.clear(); window.location.reload(); 
    }
  }

  return (
    <CultivationContext.Provider value={{
      session, user, loading,
      qi, spiritStones, lateNightExpiry, // ✅ Added lateNightExpiry
      knownTags, // ✅ Added knownTags
      tasks: mappedTasks, 
      weeklyTargets,
      currentRealm, nextRealm, realmIndex, realms: REALMS,
      tagColors, setTagColors,
      
      gainQi, gainStones, completeTask, processDailyHarvest,
      addTask, updateTask, deleteTask, toggleTaskCompletion, reorderTasks,
      
      forceStartNewDay: () => checkDailyReset(profile),
      extendLateNight, disableLateNight, hardReset, undoDailyReset: () => {}
    }}>
      {children}
    </CultivationContext.Provider>
  )
}

export function useCultivation() { return useContext(CultivationContext) }