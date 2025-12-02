import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LOCAL_STORAGE_KEY = 'cultivationState'
const TASKS_STORAGE_KEY = 'cultivationTasks'

// Realms of cultivation – mortal to apex/supreme/sovereign heights.
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

// Difficulty → Task XP
const TASK_XP_MAP = {
  low: 10,
  medium: 25,
  high: 50,
  extreme: 100,
}

// Duration (minutes) → Focus streak bonus
function getFocusStreakXp(minutes) {
  if (minutes >= 300) return 1_300
  if (minutes >= 240) return 900
  if (minutes >= 180) return 600
  if (minutes >= 120) return 350
  if (minutes >= 90) return 150
  if (minutes >= 60) return 70
  if (minutes >= 30) return 15
  return 0
}

// Daily endurance milestone thresholds (minutes) and bonuses.
const ENDURANCE_MILESTONES = [
  { minutes: 180, xp: 200 },
  { minutes: 300, xp: 600 },
  { minutes: 480, xp: 1_200 },
  { minutes: 600, xp: 1_800 },
  { minutes: 750, xp: 2_500 }, // Apex / Supreme grind tier
  { minutes: 900, xp: 3_000 }, // Supreme Tier – Sovereign endurance
]

const CultivationContext = createContext(null)

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10) // YYYY-MM-DD
}

function loadInitialState() {
  if (typeof window === 'undefined') {
    return {
      qi: 0,
      spiritStones: 0,
      lastLoginDate: null,
      todayTotalMinutes: 0,
      enduranceMilestonesAwarded: [],
    }
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      return {
        qi: 0,
        spiritStones: 0,
        lastLoginDate: null,
        todayTotalMinutes: 0,
        enduranceMilestonesAwarded: [],
      }
    }
    const parsed = JSON.parse(raw)
    return {
      qi: Number(parsed.qi) || 0,
      spiritStones: Number(parsed.spiritStones) || 0,
      lastLoginDate: parsed.lastLoginDate || null,
      todayTotalMinutes: Number(parsed.todayTotalMinutes) || 0,
      enduranceMilestonesAwarded: Array.isArray(parsed.enduranceMilestonesAwarded)
        ? parsed.enduranceMilestonesAwarded
        : [],
    }
  } catch {
    // If mortal scripts fail, reset the cultivation record.
    return {
      qi: 0,
      spiritStones: 0,
      lastLoginDate: null,
      todayTotalMinutes: 0,
      enduranceMilestonesAwarded: [],
    }
  }
}

function persistState(state) {
  if (typeof window === 'undefined') return
  const payload = {
    qi: state.qi,
    spiritStones: state.spiritStones,
    lastLoginDate: state.lastLoginDate,
    todayTotalMinutes: state.todayTotalMinutes,
    enduranceMilestonesAwarded: state.enduranceMilestonesAwarded,
  }
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload))
}

function loadInitialTasks() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((task) => ({
      id: String(task.id ?? ''),
      title: String(task.title ?? ''),
      difficulty: task.difficulty ?? 'Low',
      isCompleted: Boolean(task.isCompleted),
      tags: Array.isArray(task.tags) ? task.tags.map(String) : [],
    }))
  } catch {
    return []
  }
}

function persistTasks(tasks) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
}

function getRealmIndexFromQi(qi) {
  let index = 0
  for (let i = 0; i < REALMS.length; i += 1) {
    if (qi >= REALMS[i].xp) index = i
    else break
  }
  return index
}

export function CultivationProvider({ children }) {
  const [state, setState] = useState(() => loadInitialState())
  const [tasks, setTasks] = useState(() => loadInitialTasks())

  // Normalize daily data on mount (handle new day reset).
  useEffect(() => {
    const todayKey = getTodayKey()
    setState((prev) => {
      if (!prev.lastLoginDate || prev.lastLoginDate !== todayKey) {
        const next = {
          ...prev,
          lastLoginDate: todayKey,
          todayTotalMinutes: 0,
          enduranceMilestonesAwarded: [],
        }
        persistState(next)
        return next
      }
      persistState(prev)
      return prev
    })
  }, [])

  // Persist whenever core cultivation attributes change.
  useEffect(() => {
    persistState(state)
  }, [state])

  // Persist task scrolls whenever they change.
  useEffect(() => {
    persistTasks(tasks)
  }, [tasks])

  const realmIndex = useMemo(() => getRealmIndexFromQi(state.qi), [state.qi])
  const currentRealm = REALMS[realmIndex]
  const nextRealm = REALMS[realmIndex + 1] || REALMS[REALMS.length - 1]

  // gainQi: Main function to increase cultivation base and check for breakthroughs.
  function gainQi(amount) {
    if (!amount || Number.isNaN(amount)) return

    setState((prev) => {
      const currentQi = prev.qi
      const targetQi = Math.min(currentQi + amount, REALMS[REALMS.length - 1].xp)
      const newRealmIndex = getRealmIndexFromQi(targetQi)
      const oldRealmIndex = getRealmIndexFromQi(currentQi)

      // Realm breakthrough logic:
      // When crossing thresholds into higher realms, the cultivator ascends from mortal strata
      // toward Apex, Supreme, and Sovereign stages.
      const hasBrokenThrough = newRealmIndex > oldRealmIndex
      // We don't yet dispatch side-effects; UI may listen to `currentRealm` changes.

      return {
        ...prev,
        qi: targetQi,
        // spiritStones unchanged here; other systems may award them.
        lastLoginDate: prev.lastLoginDate || getTodayKey(),
      }
    })
  }

  // processSession: combines Task XP, Focus Streak, and Daily Endurance.
  function processSession(difficulty, durationMinutes) {
    const minutes = Math.max(0, Number(durationMinutes) || 0)
    if (minutes === 0) return { totalXp: 0, breakdown: {} }

    const todayKey = getTodayKey()

    setState((prev) => {
      // Ensure date is current for endurance tracking.
      const isNewDay = !prev.lastLoginDate || prev.lastLoginDate !== todayKey
      const baseTodayMinutes = isNewDay ? 0 : prev.todayTotalMinutes
      const baseAwarded = isNewDay ? [] : prev.enduranceMilestonesAwarded

      const updatedTodayMinutes = baseTodayMinutes + minutes

      // Task XP based on difficulty.
      const difficultyKey = String(difficulty || '').toLowerCase()
      const taskXp = TASK_XP_MAP[difficultyKey] ?? 0

      // Focus streak XP for this session.
      const focusXp = getFocusStreakXp(minutes)

      // Endurance base XP: 50 XP per 60 minutes, proportional.
      const enduranceBaseXp = (50 * minutes) / 60

      // Endurance milestone XP: awarded once when thresholds are crossed in total minutes.
      let enduranceMilestoneXp = 0
      const newAwarded = [...baseAwarded]
      for (const milestone of ENDURANCE_MILESTONES) {
        const alreadyAwarded = newAwarded.includes(milestone.minutes)
        const crossed =
          baseTodayMinutes < milestone.minutes &&
          updatedTodayMinutes >= milestone.minutes
        if (!alreadyAwarded && crossed) {
          enduranceMilestoneXp += milestone.xp
          newAwarded.push(milestone.minutes)
        }
      }

      const totalXpGain = Math.round(
        taskXp + focusXp + enduranceBaseXp + enduranceMilestoneXp,
      )

      const currentQi = prev.qi
      const targetQi = Math.min(
        currentQi + totalXpGain,
        REALMS[REALMS.length - 1].xp,
      )

      const nextState = {
        ...prev,
        qi: targetQi,
        lastLoginDate: todayKey,
        todayTotalMinutes: updatedTodayMinutes,
        enduranceMilestonesAwarded: newAwarded,
      }

      persistState(nextState)
      return nextState
    })
  }

  // ----- Task Management: mission scrolls for the cultivator -----

  function addTask(task) {
    if (!task) return
    setTasks((prev) => {
      const id =
        task.id ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`)

      const nextTask = {
        id,
        title: task.title ?? '',
        difficulty: task.difficulty ?? 'Low',
        isCompleted: Boolean(task.isCompleted),
        tags: Array.isArray(task.tags) ? task.tags : [],
      }

      return [...prev, nextTask]
    })
  }

  function deleteTask(taskId) {
    if (!taskId) return
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  function toggleTaskCompletion(taskId) {
    if (!taskId) return
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, isCompleted: !task.isCompleted }
          : task,
      ),
    )
  }

  const value = {
    qi: state.qi,
    spiritStones: state.spiritStones,
    lastLoginDate: state.lastLoginDate,
    todayTotalMinutes: state.todayTotalMinutes,

    tasks,

    currentRealm,
    nextRealm,
    realmIndex,
    realms: REALMS,

    // Core operations
    gainQi,
    processSession,

    // Task management
    addTask,
    deleteTask,
    toggleTaskCompletion,

    // Placeholder hooks for future Apex/Supreme/Sovereign-tier systems.
    addSpiritStones: (amount) => {
      const delta = Number(amount) || 0
      if (!delta) return
      setState((prev) => {
        const next = {
          ...prev,
          spiritStones: Math.max(0, prev.spiritStones + delta),
        }
        persistState(next)
        return next
      })
    },
    spendSpiritStones: (amount) => {
      const cost = Number(amount) || 0
      if (!cost) return false
      let success = false
      setState((prev) => {
        if (prev.spiritStones < cost) return prev
        success = true
        const next = {
          ...prev,
          spiritStones: prev.spiritStones - cost,
        }
        persistState(next)
        return next
      })
      return success
    },
  }

  return (
    <CultivationContext.Provider value={value}>
      {children}
    </CultivationContext.Provider>
  )
}

export function useCultivation() {
  const ctx = useContext(CultivationContext)
  if (!ctx) {
    throw new Error('useCultivation must be used within a CultivationProvider')
  }
  return ctx
}


