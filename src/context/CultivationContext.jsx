import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'
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

const getTodayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const getYesterdayKey = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Parse access_token / refresh_token from URL hash (magic link or direct token URL)
const extractHashSession = () => {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash || ''
  if (!hash.includes('access_token')) return null
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  const expires_in = params.get('expires_in')
  const expires_at = params.get('expires_at')
  if (!access_token || !refresh_token) return null
  return {
    access_token,
    refresh_token,
    expires_in: expires_in ? parseInt(expires_in) : undefined,
    expires_at: expires_at ? parseInt(expires_at) : undefined,
  }
}

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
  const hasFetchedInitial = useRef(false)
  const hadSessionOnce = useRef(false)
  
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [weeklyTargets, setWeeklyTargets] = useState([])
  const [tagColors, setTagColors] = useState({})
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type })
  }
  const closeToast = () => setToast(prev => ({ ...prev, isOpen: false }))
  
  // Shop & Inventory State
  const [shopItems, setShopItems] = useState([])
  const [inventory, setInventory] = useState([])

  // 1. Initial Load (Cache + Auth)
  useEffect(() => {
    let cachedProfile = null

    const loadCache = () => {
      try {
        const cachedProfileStr = localStorage.getItem('cultivation_profile')
        const cachedTasks = localStorage.getItem('cultivation_tasks')
        const cachedTargets = localStorage.getItem('cultivation_targets')
        const cachedInventory = localStorage.getItem('cultivation_inventory')
        const cachedShop = localStorage.getItem('cultivation_shop') // ✅ Cache Shop Items
        const lastSync = localStorage.getItem('cultivation_last_sync')
        
        if (cachedProfileStr) {
          cachedProfile = JSON.parse(cachedProfileStr)
          setProfile(cachedProfile)
        }
        if (cachedTasks) setTasks(JSON.parse(cachedTasks))
        if (cachedTargets) setWeeklyTargets(JSON.parse(cachedTargets))
        if (cachedInventory) setInventory(JSON.parse(cachedInventory))
        if (cachedShop) setShopItems(JSON.parse(cachedShop)) // ✅ Restore Shop Items

        return lastSync ? parseInt(lastSync) : 0
      } catch (e) {
        console.warn("Cache corrupted.")
        return 0
      }
    }
    const lastSyncTime = loadCache()

    const handleSession = async (sess, source = "unknown") => {
      console.log(`📌 handleSession from ${source} | hasSession=${!!sess}`)
      if (sess) {
        setSession(sess)
        hadSessionOnce.current = true
        setLoading(false)

        if (!hasFetchedInitial.current) {
          hasFetchedInitial.current = true
          console.log("🔄 Force syncing data from DB (Background)...")
          fetchData(sess.user.id, sess.user.email, true, true) 
        }
      } else {
        setSession(null)
        setLoading(false)
      }
    }

    (async () => {
      const hashSession = extractHashSession()
      if (hashSession) {
        try {
          await supabase.auth.setSession(hashSession)
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
        } catch (err) {
          console.error("❌ Failed to set hash session:", err)
        }
      }

      supabase.auth.getSession()
        .then(async ({ data: { session }, error }) => {
          if (error) {
            console.error("❌ Session error:", error)
            setLoading(false)
            return
          }

          const expiresAt = session?.expires_at ? session.expires_at * 1000 : 0
          if (session && expiresAt && expiresAt < Date.now()) {
            try {
              const { data, error: refreshErr } = await supabase.auth.refreshSession()
              if (data?.session) return handleSession(data.session, "refreshSession")
              else return handleSession(null, "refreshFailed")
            } catch (err) {
              return handleSession(null, "refreshError")
            }
          }

          handleSession(session, "getSession")
        })
        .catch(err => {
          console.error("❌ Failed to get session:", err)
          setLoading(false)
        })
    })()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        if (!session?.user?.id && !hadSessionOnce.current) return
        setSession(null)
        setProfile(null)
        setTasks([])
        setWeeklyTargets([])
        setInventory([])
        setLoading(false)
        localStorage.clear()
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await handleSession(session, event)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if(profile) localStorage.setItem('cultivation_profile', JSON.stringify(profile)) }, [profile])
  useEffect(() => { if(tasks.length > 0) localStorage.setItem('cultivation_tasks', JSON.stringify(tasks)) }, [tasks])
  useEffect(() => { if(weeklyTargets.length > 0) localStorage.setItem('cultivation_targets', JSON.stringify(weeklyTargets)) }, [weeklyTargets])
  useEffect(() => { 
    if(inventory.length >= 0) {
      localStorage.setItem('cultivation_inventory', JSON.stringify(inventory))
      localStorage.setItem('cultivation_last_sync', Date.now().toString())
    }
  }, [inventory])

  async function fetchData(userId, userEmail, isBackgroundSync = false, forceUpdate = false) {
    try {
      if (!isBackgroundSync && !profile) setLoading(true)
      
      let { data: userProfile, error: profileError } = await supabase
        .from('profiles').select('*').eq('id', userId).single()
      
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ id: userId, username: userEmail?.split('@')[0] || 'Cultivator', last_login_date: getTodayKey(), current_streak: 1 }])
          .select().single()
        userProfile = newProfile
      }

      const today = getTodayKey()
      const yesterday = getYesterdayKey()
      
      if (userProfile && userProfile.last_login_date !== today) {
        const lateNightExpiry = userProfile.late_night_expiry
        const isLateNightActive = lateNightExpiry && new Date(lateNightExpiry) >= new Date(today)

        if (!isLateNightActive) {
           let newStreak = 1
           if (userProfile.last_login_date === yesterday) {
             newStreak = (userProfile.current_streak || 0) + 1
           }

           const previousState = {
             today_total_minutes: userProfile.today_total_minutes,
             endurance_milestones: userProfile.endurance_milestones,
             last_login_date: userProfile.last_login_date
           }

           userProfile.today_total_minutes = 0
           userProfile.endurance_milestones = []
           userProfile.last_login_date = today
           userProfile.previous_day_state = previousState
           userProfile.current_streak = newStreak

           await supabase.from('profiles').update({
             today_total_minutes: 0,
             endurance_milestones: [],
             last_login_date: today,
             previous_day_state: previousState,
             current_streak: newStreak
           }).eq('id', userId)
        }
      }

      setProfile(userProfile)
      setTagColors(userProfile?.tag_colors || {})

      const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', userId).order('order_index', { ascending: true })
      if (tasksData) setTasks(tasksData.map(mapTaskFromDB).filter(Boolean))

      const { data: targetsData } = await supabase.from('weekly_targets').select('*').eq('user_id', userId).order('order_index', { ascending: true })
      setWeeklyTargets(targetsData || [])

      const { data: shopData } = await supabase.from('shop_items').select('*')
      setShopItems(shopData || [])
      localStorage.setItem('cultivation_shop', JSON.stringify(shopData || []))
      
      const { data: invData } = await supabase.from('inventory').select('*').eq('user_id', userId)
      
      const currentDate = new Date()
      const itemsToDeactivate = []
      const validInventory = (invData || []).map(item => {
        if (item.is_active && item.expires_at) {
          const expiryTime = new Date(item.expires_at)
          if (expiryTime < currentDate) {
             itemsToDeactivate.push(item.id)
             return { ...item, is_active: false, expires_at: null }
          }
        }
        return item
      })

      setInventory(validInventory)
      
      if (itemsToDeactivate.length > 0) {
        await supabase.from('inventory').update({ is_active: false, expires_at: null })
          .in('id', itemsToDeactivate)
      }
      
      localStorage.setItem('cultivation_inventory', JSON.stringify(validInventory))
      localStorage.setItem('cultivation_last_sync', Date.now().toString())

    } catch (error) {
      console.error("Error communing with the Dao:", error)
    } finally {
      setLoading(false)
    }
  }

  const qi = profile?.qi || 0
  const spiritStones = profile?.spirit_stones || 0
  const currentStreak = profile?.current_streak || 0
  const activeCardSkin = profile?.active_card_skin || null
  const activeBgImage = profile?.active_bg_image || null
  const activeCursor = profile?.active_cursor || null
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

  async function buyItem(item) {
    if (spiritStones < item.price) return { success: false, msg: "Insufficient Spirit Stones" }
    
    const existingItem = inventory.find(i => i.item_id === item.id)

    if (item.category === 'cosmetic' && existingItem) {
        return { success: false, msg: "You already own this!" }
    }
    
    const newStones = spiritStones - item.price
    setProfile(prev => ({ ...prev, spirit_stones: newStones }))
    await supabase.from('profiles').update({ spirit_stones: newStones }).eq('id', session.user.id)
    
    let newInvItem = null
    
    if (existingItem) {
      const newQuantity = (existingItem.quantity || 0) + 1
      const updated = inventory.map(i => i.id === existingItem.id ? { ...i, quantity: newQuantity } : i)
      setInventory(updated)
      await supabase.from('inventory').update({ quantity: newQuantity }).eq('id', existingItem.id)
    } else {
      const { data } = await supabase
        .from('inventory')
        .insert({ user_id: session.user.id, item_id: item.id, quantity: 1, is_active: false })
        .select()
        .single()
      newInvItem = data
      if (newInvItem) setInventory(prev => [...prev, newInvItem])
    }
    
    return { success: true, msg: "Item Acquired!" }
  }

  async function equipItem(invItem, shopItemType) {
    const updatedInventory = inventory.map(i => {
      const sItem = shopItems.find(s => s.id === i.item_id)
      if (sItem && sItem.type === shopItemType) {
        return { ...i, is_active: i.id === invItem.id }
      }
      return i
    })
    setInventory(updatedInventory)

    const shopItem = shopItems.find(s => s.id === invItem.item_id)
    if (shopItem) {
      if (shopItemType === 'card_skin') {
        setProfile(prev => ({ ...prev, active_card_skin: shopItem.metadata }))
        await supabase.from('profiles').update({ active_card_skin: shopItem.metadata }).eq('id', session.user.id)
      } else if (shopItemType === 'background') {
        setProfile(prev => ({ ...prev, active_bg_image: shopItem.metadata.url }))
        await supabase.from('profiles').update({ active_bg_image: shopItem.metadata.url }).eq('id', session.user.id)
      } else if (shopItemType === 'cursor') {
        setProfile(prev => ({ ...prev, active_cursor: shopItem.metadata.style }))
        await supabase.from('profiles').update({ active_cursor: shopItem.metadata.style }).eq('id', session.user.id)
      }
    }
    
    await supabase.from('inventory').update({ is_active: true }).eq('id', invItem.id)
  }

  async function consumeItem(invItem, shopItem, isUndo = false) {
    if (!isUndo && invItem.quantity <= 0) return { success: false, msg: "Empty!" }

    if (isUndo) {
        const newQty = (invItem.quantity || 0) + 1
        const updatedInventory = inventory.map(i => {
            if (i.id === invItem.id) return { ...i, quantity: newQty, is_active: false, expires_at: null }
            return i
        })
        setInventory(updatedInventory)
        localStorage.setItem('cultivation_inventory', JSON.stringify(updatedInventory))
        await supabase.from('inventory').update({ quantity: newQty, is_active: false, expires_at: null }).eq('id', invItem.id)
        return { success: true, msg: "Deactivated & Returned!" }
    }

    const activeSibling = inventory.find(i => i.item_id === invItem.item_id && i.is_active)
    let baseExpiry = new Date()
    if (activeSibling && activeSibling.expires_at) {
        const activeExpiry = new Date(activeSibling.expires_at)
        if (activeExpiry > baseExpiry) baseExpiry = activeExpiry
    }
    baseExpiry.setHours(baseExpiry.getHours() + 24)
    const newExpiryISO = baseExpiry.toISOString()

    const currentQty = invItem.quantity ?? 0
    const newQty = currentQty - 1
    const itemsToDeactivate = [] 
    if (activeSibling && activeSibling.id !== invItem.id) itemsToDeactivate.push(activeSibling.id)

    if (newQty < 0) return { success: false, msg: "Not enough items!" }
    
    const updatedInventory = inventory.map(i => {
            if (i.id === invItem.id) return { ...i, quantity: newQty, is_active: true, expires_at: newExpiryISO }
            if (itemsToDeactivate.includes(i.id)) return { ...i, is_active: false, expires_at: null }
            return i
    })
    
    await supabase.from('inventory').update({ quantity: newQty, is_active: true, expires_at: newExpiryISO }).eq('id', invItem.id)
    if (itemsToDeactivate.length > 0) await supabase.from('inventory').update({ is_active: false, expires_at: null }).in('id', itemsToDeactivate)

    setInventory(updatedInventory)
    localStorage.setItem('cultivation_inventory', JSON.stringify(updatedInventory))

    // Apply Instant Effects
    if (shopItem.name === 'Memory Pill') {
        // Increment streak logic (as requested by user to be left as is/fixed)
        const newStreak = (profile.current_streak || 0) + 1
        setProfile(prev => ({ ...prev, current_streak: newStreak }))
        await supabase.from('profiles').update({ current_streak: newStreak }).eq('id', session.user.id)
    } else if (shopItem.name === 'Tribulation Thunder Bead') {
        // Level Up
        // TODO: Implement Realm Up logic if needed, currently just consumable
    }

    return { success: true, msg: activeSibling ? "Effect Extended!" : "Activated!" }
  }

  // ... (rest of the functions: addTask, etc. same as before)
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
    if (!task.isTrivial) {
       const key = String(task.difficulty).toLowerCase()
       const xpGain = DIFFICULTY_TIERS[key]?.xp || 10
       if (newVal) gainQi(xpGain)
       else gainQi(-xpGain)
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
    const updates = newOrderedTargets.map((t, index) => ({ id: t.id, order_index: index, user_id: session.user.id }))
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
      supabase.from('profiles').update({ qi: newQi, spirit_stones: newStones, today_total_minutes: newTotalMinutes, endurance_milestones: newMilestones }).eq('id', session.user.id),
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
      session, loading, ...auth,
      profile, qi, spiritStones, currentStreak, tasks, weeklyTargets, shopItems, inventory,
      currentRealm, nextRealm, realmIndex, realms: REALMS,
      tagColors, activeCardSkin, activeBgImage, activeCursor, knownTags, lateNightExpiry,
      gainQi, gainStones,
      addTask, updateTask, deleteTask, toggleTaskCompletion, reorderTasks, duplicateTask,
      addWeeklyTarget, updateWeeklyTarget, deleteWeeklyTarget, reorderWeeklyTargets, contributeToWeeklyTarget, duplicateWeeklyTarget,
      buyItem, equipItem, consumeItem, processDailyHarvest,
      setTagColor, undoDailyReset,
      toast, showToast, closeToast,
      extendLateNight: () => {}, disableLateNight: () => {}, 
      hardReset: async () => {
        if (!session?.user?.id) return
        try {
          await Promise.all([
            supabase.from('tasks').delete().eq('user_id', session.user.id),
            supabase.from('weekly_targets').delete().eq('user_id', session.user.id),
            supabase.from('inventory').delete().eq('user_id', session.user.id),
            supabase.from('cultivation_logs').delete().eq('user_id', session.user.id),
            supabase.from('profiles').update({
              qi: 0,
              spirit_stones: 0,
              current_streak: 0,
              today_total_minutes: 0,
              endurance_milestones: [],
              known_tags: [],
              tag_colors: {},
              active_card_skin: null,
              active_bg_image: null,
              active_cursor: null,
              previous_day_state: null
            }).eq('id', session.user.id)
          ])
          setTasks([])
          setWeeklyTargets([])
          setInventory([])
          setProfile(prev => prev ? { ...prev, qi: 0, spirit_stones: 0, current_streak: 0, today_total_minutes: 0, endurance_milestones: [], known_tags: [], tag_colors: {}, active_card_skin: null, active_bg_image: null, active_cursor: null, previous_day_state: null } : null)
          localStorage.clear()
          window.location.reload()
        } catch (error) {
          console.error("Error resetting:", error)
          alert("Failed to reset. Please try again.")
        }
      }, 
      state: profile || {}
    }}>
      {children}
    </CultivationContext.Provider>
  )
}

export function useCultivation() { return useContext(CultivationContext) }
