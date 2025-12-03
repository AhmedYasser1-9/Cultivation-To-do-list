import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LOCAL_STORAGE_KEY = 'cultivationState'
const TASKS_STORAGE_KEY = 'cultivationTasks'
const TAGS_COLORS_KEY = 'cultivationTagColors'
const WEEKLY_PLAN_KEY = 'cultivationWeeklyPlan'

// ... (KEEP REALMS, DIFFICULTY_TIERS, STREAK_VALUES, ENDURANCE_MILESTONES AS IS) ...
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

function getTodayKey() { return new Date().toISOString().slice(0, 10) }
function getRealmIndexFromQi(qi) {
  let index = 0; for (let i = 0; i < REALMS.length; i++) { if (qi >= REALMS[i].xp) index = i; else break } return index
}

function loadInitialState() {
  const defaultState = { 
    qi: 0, 
    spiritStones: 0, 
    lastLoginDate: null, 
    todayTotalMinutes: 0, 
    enduranceMilestonesAwarded: [], 
    knownTags: [], 
    lateNightExpiry: null, 
    previousDayState: null,
    history: [], 
    inventory: [], 
    activeBuffs: {} 
  }
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState
  } catch { return defaultState }
}

function loadInitialTasks() {
  try { const raw = window.localStorage.getItem(TASKS_STORAGE_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function loadTagColors() {
  try { const raw = window.localStorage.getItem(TAGS_COLORS_KEY); return raw ? JSON.parse(raw) : {} } catch { return {} }
}
function loadWeeklyPlan() {
  try { const raw = window.localStorage.getItem(WEEKLY_PLAN_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}

const CultivationContext = createContext(null)

export function CultivationProvider({ children }) {
  const [state, setState] = useState(() => loadInitialState())
  const [tasks, setTasks] = useState(() => loadInitialTasks())
  const [tagColors, setTagColors] = useState(() => loadTagColors())
  const [weeklyTargets, setWeeklyTargets] = useState(() => loadWeeklyPlan())

  useEffect(() => { window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state)) }, [state])
  useEffect(() => { window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks)) }, [tasks])
  useEffect(() => { window.localStorage.setItem(TAGS_COLORS_KEY, JSON.stringify(tagColors)) }, [tagColors])
  useEffect(() => { window.localStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(weeklyTargets)) }, [weeklyTargets])

  // --- Date & Reset Logic ---
  useEffect(() => {
    const todayKey = getTodayKey()
    const lastLogin = state.lastLoginDate

    if (lastLogin && lastLogin !== todayKey) {
      const isLateNightActive = state.lateNightExpiry && new Date(state.lateNightExpiry) >= new Date(todayKey)
      if (!isLateNightActive) {
        performReset(todayKey, lastLogin)
      }
    } else if (!lastLogin) {
      setState(prev => ({ ...prev, lastLoginDate: todayKey }))
    }
  }, [state.lastLoginDate, state.lateNightExpiry])

  const realmIndex = useMemo(() => getRealmIndexFromQi(state.qi), [state.qi])
  const currentRealm = REALMS[realmIndex]
  const nextRealm = REALMS[realmIndex + 1] || REALMS[REALMS.length - 1]

  function performReset(newDateKey, oldDateKey) {
    setState(prev => {
      const historyEntry = {
        date: oldDateKey,
        minutes: prev.todayTotalMinutes,
        qiTotal: prev.qi, 
        stones: prev.spiritStones 
      }

      const snapshot = {
        lastLoginDate: prev.lastLoginDate,
        todayTotalMinutes: prev.todayTotalMinutes,
        enduranceMilestonesAwarded: prev.enduranceMilestonesAwarded,
      }
      
      return { 
        ...prev, 
        lastLoginDate: newDateKey, 
        todayTotalMinutes: 0, 
        enduranceMilestonesAwarded: [],
        previousDayState: snapshot,
        history: [...(prev.history || []), historyEntry] 
      }
    })

    const todayDayIndex = new Date().getDay()
    setTasks(prevTasks => prevTasks.map(task => {
      let shouldReset = false
      if (task.repeat === 'daily') shouldReset = true
      else if (task.repeat === 'custom' && task.repeatDays && task.repeatDays.includes(todayDayIndex)) shouldReset = true

      if (shouldReset) {
        const resetSubtasks = task.subtasks ? task.subtasks.map(st => ({ ...st, completed: false })) : []
        return { ...task, isCompleted: false, subtasks: resetSubtasks }
      }
      return task
    }))
  }

  function undoDailyReset() {
    if (!state.previousDayState) return
    const prev = state.previousDayState
    setState(curr => ({
      ...curr,
      lastLoginDate: prev.lastLoginDate,
      todayTotalMinutes: prev.todayTotalMinutes,
      enduranceMilestonesAwarded: prev.enduranceMilestonesAwarded,
      previousDayState: null, 
      lateNightExpiry: getTodayKey(),
      history: curr.history.slice(0, -1) 
    }))
  }

  function extendLateNight(days) {
    const today = new Date()
    const expiry = new Date(today)
    expiry.setDate(today.getDate() + days)
    const expiryKey = expiry.toISOString().slice(0, 10)
    setState(prev => ({ ...prev, lateNightExpiry: expiryKey }))
  }

  function disableLateNight() { setState(prev => ({ ...prev, lateNightExpiry: null })) }

  function forceStartNewDay() {
    const todayKey = getTodayKey()
    performReset(todayKey, state.lastLoginDate || todayKey)
  }

  function gainQi(amount) {
    if (amount === 0) return
    setState(prev => {
      const multiplier = 1 
      const finalAmount = Math.floor(amount * multiplier)
      const newQi = Math.max(0, prev.qi + finalAmount)
      const cappedQi = Math.min(newQi, REALMS[REALMS.length - 1].xp)
      return { ...prev, qi: cappedQi, lastLoginDate: getTodayKey() }
    })
  }

  function gainStones(amount) {
     if (amount <= 0) return
     setState(prev => ({ ...prev, spiritStones: (prev.spiritStones || 0) + amount }))
  }

  function completeTask(task) {
    if (task.isTrivial) return 
    const key = String(task.difficulty).toLowerCase()
    const xp = DIFFICULTY_TIERS[key]?.xp || 10
    gainQi(xp)
  }

  // ✅ Harvest Logic Updated: Now accepts calculated XP and Stones from the Modal
  function processDailyHarvest(minutesWorked, streaks, calculatedXP, calculatedStones) {
    const todayKey = getTodayKey()
    setState(prev => {
      const isNewDay = prev.lastLoginDate !== todayKey
      const isLateNight = prev.lateNightExpiry && new Date(prev.lateNightExpiry) >= new Date(todayKey)
      const baseTodayMinutes = (isNewDay && !isLateNight) ? 0 : prev.todayTotalMinutes
      const baseAwarded = (isNewDay && !isLateNight) ? [] : prev.enduranceMilestonesAwarded
      const updatedTotalMinutes = baseTodayMinutes + minutesWorked

      if (updatedTotalMinutes > 1440) {
        alert("Cultivator! One day only has 24 hours.")
        return prev 
      }
      
      // Milestones
      let milestoneXP = 0
      const newAwarded = [...baseAwarded]
      ENDURANCE_MILESTONES.forEach(m => {
        if (!newAwarded.includes(m.minutes) && updatedTotalMinutes >= m.minutes) {
          milestoneXP += m.xp
          newAwarded.push(m.minutes)
        }
      })

      // Streaks
      let streakXP = 0
      Object.entries(streaks).forEach(([duration, count]) => {
        const value = STREAK_VALUES[duration] || 0
        streakXP += (value * count)
      })

      const totalHarvest = calculatedXP + milestoneXP + streakXP
      const newQi = Math.min(prev.qi + totalHarvest, REALMS[REALMS.length - 1].xp)
      const newStones = (prev.spiritStones || 0) + calculatedStones

      return {
        ...prev,
        qi: newQi,
        spiritStones: newStones,
        lastLoginDate: isLateNight ? prev.lastLoginDate : todayKey,
        todayTotalMinutes: updatedTotalMinutes,
        enduranceMilestonesAwarded: newAwarded
      }
    })
  }

  function addTask(task) {
    if (task.tags?.length > 0) {
      setState(prev => {
        const newTags = task.tags.filter(t => !prev.knownTags.includes(t))
        return newTags.length ? { ...prev, knownTags: [...prev.knownTags, ...newTags] } : prev
      })
    }
    const newTask = { 
      id: crypto.randomUUID(), 
      isCompleted: false, 
      difficulty: 'low', 
      tags: [], 
      color: 'default', 
      repeat: 'once',
      isTrivial: false,
      notes: '', 
      subtasks: [], 
      repeatDays: [], 
      ...task 
    }
    setTasks(prev => [newTask, ...prev])
  }

  function duplicateTask(taskId) {
    const originalTask = tasks.find(t => t.id === taskId)
    if (!originalTask) return
    const newTask = { ...originalTask, id: crypto.randomUUID(), title: `${originalTask.title} (Copy)`, isCompleted: false }
    setTasks(prev => [newTask, ...prev])
  }

  function updateTask(id, updates) { setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t)) }
  function reorderTasks(newOrderedTasks) { setTasks(newOrderedTasks) }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)) }
  function toggleTaskCompletion(id) { setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)) }
  function setTagColor(tagName, colorKey) { setTagColors(prev => ({ ...prev, [tagName]: colorKey })) }

  function addWeeklyTarget(targetData) {
    const data = typeof targetData === 'string' ? { title: targetData } : targetData
    if (data.tags?.length > 0) {
      setState(prev => {
        const newTags = data.tags.filter(t => !prev.knownTags.includes(t))
        return newTags.length ? { ...prev, knownTags: [...prev.knownTags, ...newTags] } : prev
      })
    }
    const newTarget = {
      id: crypto.randomUUID(), title: data.title || 'Untitled Oath', difficulty: data.difficulty || 'med',
      tags: data.tags || [], progress: 0, status: 'active', createdAt: new Date().toISOString(), ...data
    }
    setWeeklyTargets(prev => [newTarget, ...prev])
  }

  function duplicateWeeklyTarget(id) {
    const original = weeklyTargets.find(t => t.id === id)
    if (!original) return
    const newTarget = { ...original, id: crypto.randomUUID(), title: `${original.title} (Copy)`, progress: 0, createdAt: new Date().toISOString() }
    setWeeklyTargets(prev => [newTarget, ...prev])
  }

  function updateWeeklyTarget(id, updates) {
    if (updates.tags?.length > 0) {
      setState(prev => {
        const newTags = updates.tags.filter(t => !prev.knownTags.includes(t))
        return newTags.length ? { ...prev, knownTags: [...prev.knownTags, ...newTags] } : prev
      })
    }
    setWeeklyTargets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }
  function deleteWeeklyTarget(id) { setWeeklyTargets(prev => prev.filter(t => t.id !== id)) }
  function contributeToWeeklyTarget(id, amount) {
    setWeeklyTargets(prev => prev.map(t => {
      if (t.id === id) {
        const numeric = Number.isNaN(Number(amount)) ? 0 : Number(amount)
        const newProgress = Math.min(100, Math.max(0, numeric))
        if (newProgress >= 100 && t.progress < 100) {
             gainStones(50) 
        }
        return { ...t, progress: newProgress, status: newProgress >= 100 ? 'completed' : 'active' }
      }
      return t
    }))
  }
  function reorderWeeklyTargets(newOrder) { setWeeklyTargets(newOrder) }

  function hardReset() { localStorage.clear(); window.location.reload() }

  return (
    <CultivationContext.Provider value={{
      state, 
      qi: state.qi, 
      spiritStones: state.spiritStones, 
      knownTags: state.knownTags, 
      lateNightExpiry: state.lateNightExpiry,
      tasks, currentRealm, nextRealm, realmIndex, realms: REALMS, tagColors,
      weeklyTargets,
      gainQi, gainStones, completeTask, processDailyHarvest, 
      addTask, updateTask, deleteTask, toggleTaskCompletion, reorderTasks, setTagColor, duplicateTask,
      addWeeklyTarget, updateWeeklyTarget, deleteWeeklyTarget, duplicateWeeklyTarget, contributeToWeeklyTarget, 
      reorderWeeklyTargets,
      forceStartNewDay, extendLateNight, disableLateNight, undoDailyReset, hardReset
    }}>
      {children}
    </CultivationContext.Provider>
  )
}

export function useCultivation() { return useContext(CultivationContext) }