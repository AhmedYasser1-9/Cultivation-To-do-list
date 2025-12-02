import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LOCAL_STORAGE_KEY = 'cultivationState'
const TASKS_STORAGE_KEY = 'cultivationTasks'
const TAGS_COLORS_KEY = 'cultivationTagColors'

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

// 1. New Difficulty Levels (7 Tiers)
export const DIFFICULTY_TIERS = {
  'low': { label: 'Low', xp: 10 },
  'low-med': { label: 'Low-Med', xp: 20 },
  'med': { label: 'Med', xp: 35 },
  'med-high': { label: 'Med-High', xp: 50 },
  'high': { label: 'High', xp: 75 },
  'high-extreme': { label: 'High-Extreme', xp: 110 },
  'extreme': { label: 'Extreme', xp: 150 },
}

// 2. Streak Bonus Values (Shopping Counter)
export const STREAK_VALUES = {
  15: 10,   // Warmup
  30: 25,   // Focus
  45: 50,   // Flow
  60: 100,  // Deep
  90: 200,  // Immersion
  120: 400, // Zone
  180: 750, // Marathon
  240: 1200, // Beast (4 Hours)
  300: 1800  // Apex (5 Hours)
}

const ENDURANCE_MILESTONES = [
  { minutes: 180, xp: 200 }, { minutes: 300, xp: 600 }, { minutes: 480, xp: 1200 },
  { minutes: 600, xp: 1800 }, { minutes: 750, xp: 2500 }, { minutes: 900, xp: 3000 },
]

function getTodayKey() { return new Date().toISOString().slice(0, 10) }
function getRealmIndexFromQi(qi) {
  let index = 0; for (let i = 0; i < REALMS.length; i++) { if (qi >= REALMS[i].xp) index = i; else break } return index
}

// Loaders
function loadInitialState() {
  if (typeof window === 'undefined') return { qi: 0, spiritStones: 0, lastLoginDate: null, todayTotalMinutes: 0, enduranceMilestonesAwarded: [], knownTags: [] }
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : { qi: 0, spiritStones: 0, lastLoginDate: null, todayTotalMinutes: 0, enduranceMilestonesAwarded: [], knownTags: [] }
  } catch { return { qi: 0, spiritStones: 0, lastLoginDate: null, todayTotalMinutes: 0, enduranceMilestonesAwarded: [], knownTags: [] } }
}
function loadInitialTasks() {
  try { const raw = window.localStorage.getItem(TASKS_STORAGE_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function loadTagColors() {
  try { const raw = window.localStorage.getItem(TAGS_COLORS_KEY); return raw ? JSON.parse(raw) : {} } catch { return {} }
}

const CultivationContext = createContext(null)

export function CultivationProvider({ children }) {
  const [state, setState] = useState(() => loadInitialState())
  const [tasks, setTasks] = useState(() => loadInitialTasks())
  const [tagColors, setTagColors] = useState(() => loadTagColors())

  useEffect(() => { window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state)) }, [state])
  useEffect(() => { window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks)) }, [tasks])
  useEffect(() => { window.localStorage.setItem(TAGS_COLORS_KEY, JSON.stringify(tagColors)) }, [tagColors])

  useEffect(() => {
    const todayKey = getTodayKey()
    if (state.lastLoginDate !== todayKey) {
      setState(prev => ({ ...prev, lastLoginDate: todayKey, todayTotalMinutes: 0, enduranceMilestonesAwarded: [] }))
    }
  }, [])

  const realmIndex = useMemo(() => getRealmIndexFromQi(state.qi), [state.qi])
  const currentRealm = REALMS[realmIndex]
  const nextRealm = REALMS[realmIndex + 1] || REALMS[REALMS.length - 1]

  // --- Core XP Functions ---

  function gainQi(amount) {
    if (amount === 0) return
    setState(prev => {
      const newQi = Math.max(0, prev.qi + amount)
      const cappedQi = Math.min(newQi, REALMS[REALMS.length - 1].xp)
      return { ...prev, qi: cappedQi, lastLoginDate: getTodayKey() }
    })
  }

  // 1. Task XP Only (No time calculation here anymore)
  function completeTask(difficulty) {
    const key = String(difficulty).toLowerCase()
    const xp = DIFFICULTY_TIERS[key]?.xp || 10
    gainQi(xp)
  }

  // 2. Daily Harvest Logic (End of Day Log)
  function processDailyHarvest(minutesWorked, streaks) {
    const todayKey = getTodayKey()
    
    setState(prev => {
      const isNewDay = prev.lastLoginDate !== todayKey
      const baseTodayMinutes = isNewDay ? 0 : prev.todayTotalMinutes
      const baseAwarded = isNewDay ? [] : prev.enduranceMilestonesAwarded
      
      // A. Endurance Base XP (50 XP per hour)
      const enduranceBaseXP = Math.round((50 * minutesWorked) / 60)
      
      // B. Endurance Milestones (Cumulative for the day)
      const updatedTotalMinutes = baseTodayMinutes + minutesWorked
      let milestoneXP = 0
      const newAwarded = [...baseAwarded]
      
      ENDURANCE_MILESTONES.forEach(m => {
        if (!newAwarded.includes(m.minutes) && updatedTotalMinutes >= m.minutes) {
          milestoneXP += m.xp
          newAwarded.push(m.minutes)
        }
      })

      // C. Streak Bonuses (Shopping Cart Style)
      let streakXP = 0
      // streaks is object { '30': count, '60': count ... }
      Object.entries(streaks).forEach(([duration, count]) => {
        const value = STREAK_VALUES[duration] || 0
        streakXP += (value * count)
      })

      const totalHarvest = enduranceBaseXP + milestoneXP + streakXP
      
      const newQi = Math.min(prev.qi + totalHarvest, REALMS[REALMS.length - 1].xp)

      return {
        ...prev,
        qi: newQi,
        lastLoginDate: todayKey,
        todayTotalMinutes: updatedTotalMinutes,
        enduranceMilestonesAwarded: newAwarded
      }
    })
  }

  // --- CRUD ---
  function addTask(task) {
    if (task.tags?.length > 0) {
      setState(prev => {
        const newTags = task.tags.filter(t => !prev.knownTags.includes(t))
        return newTags.length ? { ...prev, knownTags: [...prev.knownTags, ...newTags] } : prev
      })
    }
    const newTask = { id: crypto.randomUUID(), isCompleted: false, difficulty: 'low', tags: [], color: 'default', ...task }
    setTasks(prev => [newTask, ...prev])
  }

  function updateTask(id, updates) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  function reorderTasks(newOrderedTasks) { setTasks(newOrderedTasks) }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)) }
  function toggleTaskCompletion(id) { setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)) }
  function setTagColor(tagName, colorKey) { setTagColors(prev => ({ ...prev, [tagName]: colorKey })) }

  return (
    <CultivationContext.Provider value={{
      qi: state.qi, spiritStones: state.spiritStones, knownTags: state.knownTags,
      tasks, currentRealm, nextRealm, realmIndex, realms: REALMS, tagColors,
      gainQi, completeTask, processDailyHarvest, // Export new functions
      addTask, updateTask, deleteTask, toggleTaskCompletion, reorderTasks, setTagColor
    }}>
      {children}
    </CultivationContext.Provider>
  )
}

export function useCultivation() { return useContext(CultivationContext) }