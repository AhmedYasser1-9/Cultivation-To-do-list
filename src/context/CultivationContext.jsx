import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LOCAL_STORAGE_KEY = 'cultivationState'
const TASKS_STORAGE_KEY = 'cultivationTasks'
const TAGS_COLORS_KEY = 'cultivationTagColors' // مفتاح جديد لألوان التاجات

// Realms
const REALMS = [
  { name: 'Condensing Pulse', xp: 0 },
  { name: 'Houtian', xp: 200 },
  { name: 'Xiantian', xp: 500 },
  { name: 'Revolving Core', xp: 900 },
  { name: 'Life Destruction', xp: 1_400 },
  { name: 'Royal Sea', xp: 2_000 },
  { name: 'Royal Extreme', xp: 2_700 },
  { name: 'Royal Transformation', xp: 3_500 },
  { name: 'Royal Lord', xp: 4_500 },
  { name: 'World King', xp: 5_600 },
  { name: 'Empyrean', xp: 6_800 },
  { name: 'True Eggplant', xp: 8_100 },
  { name: 'Absolute Mortal Peak', xp: 9_500 },
  { name: 'Foundation Building', xp: 11_000 },
  { name: '1st Great Calamity', xp: 12_600 },
  { name: '2nd Great Calamity', xp: 14_300 },
  { name: '3rd Great Calamity', xp: 16_100 },
  { name: '4th Great Calamity', xp: 18_000 },
  { name: '5th Great Calamity', xp: 20_000 },
  { name: '6th Great Calamity', xp: 22_500 },
  { name: '7th Great Calamity', xp: 25_000 },
  { name: '8th Great Calamity', xp: 28_000 },
  { name: '9th Great Calamity', xp: 31_000 },
  { name: 'Nascent', xp: 35_000 },
  { name: 'Novice', xp: 39_000 },
  { name: 'True', xp: 44_000 },
  { name: 'Spirit', xp: 49_000 },
  { name: 'Earth', xp: 55_000 },
  { name: 'Heaven', xp: 62_000 },
  { name: 'Emperor', xp: 70_000 },
  { name: 'Tyrant', xp: 79_000 },
  { name: 'Sovereignty', xp: 89_000 },
  { name: 'IMMORTAL', xp: 100_000 },
  { name: 'Celestial Immortal', xp: 112_000 },
  { name: 'Immortal King', xp: 125_000 },
  { name: 'Conferred Immortal King', xp: 132_000 },
  { name: 'Immortal Monarch', xp: 139_000 },
  { name: 'Immortal Emperor', xp: 145_000 },
  { name: 'Immortal Amogus', xp: 148_000 },
  { name: 'OPM', xp: 150_000 },
]

const TASK_XP_MAP = { low: 10, medium: 25, high: 50, extreme: 100 }
const ENDURANCE_MILESTONES = [
  { minutes: 180, xp: 200 }, { minutes: 300, xp: 600 }, { minutes: 480, xp: 1_200 },
  { minutes: 600, xp: 1_800 }, { minutes: 750, xp: 2_500 }, { minutes: 900, xp: 3_000 },
]

function getFocusStreakXp(minutes) {
  if (minutes >= 300) return 1_300; if (minutes >= 240) return 900; if (minutes >= 180) return 600
  if (minutes >= 120) return 350; if (minutes >= 90) return 150; if (minutes >= 60) return 70
  if (minutes >= 30) return 15; return 0
}

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

  // Persistence
  useEffect(() => { window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state)) }, [state])
  useEffect(() => { window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks)) }, [tasks])
  useEffect(() => { window.localStorage.setItem(TAGS_COLORS_KEY, JSON.stringify(tagColors)) }, [tagColors])

  // Daily Reset
  useEffect(() => {
    const todayKey = getTodayKey()
    if (state.lastLoginDate !== todayKey) {
      setState(prev => ({ ...prev, lastLoginDate: todayKey, todayTotalMinutes: 0, enduranceMilestonesAwarded: [] }))
    }
  }, [])

  const realmIndex = useMemo(() => getRealmIndexFromQi(state.qi), [state.qi])
  const currentRealm = REALMS[realmIndex]
  const nextRealm = REALMS[realmIndex + 1] || REALMS[REALMS.length - 1]

  function gainQi(amount) {
    if (amount === 0) return
    setState(prev => {
      const newQi = Math.max(0, prev.qi + amount)
      const cappedQi = Math.min(newQi, REALMS[REALMS.length - 1].xp)
      return { ...prev, qi: cappedQi, lastLoginDate: getTodayKey() }
    })
  }

  function processSession(difficulty, durationMinutes) {
    const minutes = Math.max(0, Number(durationMinutes) || 0)
    const todayKey = getTodayKey()
    setState(prev => {
      const isNewDay = prev.lastLoginDate !== todayKey
      const baseTodayMinutes = isNewDay ? 0 : prev.todayTotalMinutes
      const baseAwarded = isNewDay ? [] : prev.enduranceMilestonesAwarded
      const updatedTodayMinutes = baseTodayMinutes + minutes
      
      const taskXp = TASK_XP_MAP[String(difficulty || '').toLowerCase()] ?? 10
      const focusXp = getFocusStreakXp(minutes)
      const enduranceBaseXp = (50 * minutes) / 60
      
      let milestoneXp = 0
      const newAwarded = [...baseAwarded]
      ENDURANCE_MILESTONES.forEach(m => {
        if (!newAwarded.includes(m.minutes) && updatedTodayMinutes >= m.minutes) {
          milestoneXp += m.xp; newAwarded.push(m.minutes)
        }
      })
      const totalGain = Math.round(taskXp + focusXp + enduranceBaseXp + milestoneXp)
      const newQi = Math.min(prev.qi + totalGain, REALMS[REALMS.length - 1].xp)
      return { ...prev, qi: newQi, lastLoginDate: todayKey, todayTotalMinutes: updatedTodayMinutes, enduranceMilestonesAwarded: newAwarded }
    })
  }

  // --- Task Management ---
  function addTask(task) {
    if (task.tags?.length > 0) {
      setState(prev => {
        const newTags = task.tags.filter(t => !prev.knownTags.includes(t))
        return newTags.length ? { ...prev, knownTags: [...prev.knownTags, ...newTags] } : prev
      })
    }
    const newTask = { id: crypto.randomUUID(), isCompleted: false, difficulty: 'Low', tags: [], color: 'default', ...task }
    setTasks(prev => [newTask, ...prev]) // Add to top
  }

  function updateTask(id, updates) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  // دالة جديدة لترتيب المهام (Drag & Drop)
  function reorderTasks(newOrderedTasks) {
    setTasks(newOrderedTasks)
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function toggleTaskCompletion(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
  }

  // --- Tag Customization ---
  function setTagColor(tagName, colorKey) {
    setTagColors(prev => ({ ...prev, [tagName]: colorKey }))
  }

  return (
    <CultivationContext.Provider value={{
      qi: state.qi, spiritStones: state.spiritStones, knownTags: state.knownTags,
      tasks, currentRealm, nextRealm, realmIndex, realms: REALMS, tagColors,
      gainQi, processSession, addTask, updateTask, deleteTask, toggleTaskCompletion, 
      reorderTasks, setTagColor
    }}>
      {children}
    </CultivationContext.Provider>
  )
}

export function useCultivation() { return useContext(CultivationContext) }