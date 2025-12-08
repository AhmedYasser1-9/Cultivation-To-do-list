import { useState, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Plus, User, CheckCircle2, ListTodo, Sun, Search, Filter, X, Zap, ArrowRight, Repeat } from 'lucide-react'
import { useCultivation, DIFFICULTY_TIERS } from '../context/CultivationContext.jsx'
import MissionCard from './MissionCard.jsx'
import TaskFormModal from './TaskFormModal.jsx'
import DailyHarvestModal from './DailyHarvestModal.jsx'
import ConfirmModal from './ConfirmModal.jsx'
import Toast from './Toast.jsx'

const TAG_COLORS = [
  'bg-red-500/20 text-red-200 border-red-500/30',
  'bg-orange-500/20 text-orange-200 border-orange-500/30',
  'bg-amber-500/20 text-amber-200 border-amber-500/30',
  'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
  'bg-blue-500/20 text-blue-200 border-blue-500/30',
  'bg-violet-500/20 text-violet-200 border-violet-500/30',
  'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30',
]
const getTagColor = (text) => {
  if (text === 'All') return 'bg-slate-800 text-slate-300 border-slate-600'
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash % TAG_COLORS.length)]
}

export default function MissionBoard() {
  const {
    tasks, addTask, updateTask, deleteTask, toggleTaskCompletion,
    gainQi, reorderTasks, processDailyHarvest, showToast
  } = useCultivation()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isHarvestOpen, setIsHarvestOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('todo')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('All')
  const [filterTag, setFilterTag] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, isDanger: false })
  const [quickAddTitle, setQuickAddTitle] = useState('')

  const availableTags = useMemo(() => {
    const tags = new Set(tasks.flatMap(t => t.tags || []))
    return ['All', ...Array.from(tags)]
  }, [tasks])

  const filteredTasks = tasks.filter(t => {
    const matchesTab = activeTab === 'todo' ? !t.isCompleted : t.isCompleted
    if (!matchesTab) return false
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = filterDifficulty === 'All' || t.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
    const matchesTag = filterTag === 'All' || (t.tags && t.tags.includes(filterTag))
    return matchesSearch && matchesDifficulty && matchesTag
  })

  // List Logic
  const displayTasks = activeTab === 'todo' ? filteredTasks.filter(t => !t.isCompleted) : filteredTasks.filter(t => t.isCompleted)

  const handleReorder = (newOrderedSubset) => {
    const subsetIds = new Set(newOrderedSubset.map(t => t.id))
    const otherTasks = tasks.filter(t => !subsetIds.has(t.id))
    // Put reordered tasks AT THE TOP of the main list
    reorderTasks([...newOrderedSubset, ...otherTasks])
  }

  const handleToggle = (id) => {
    // Logic is now centralized in CultivationContext!
    toggleTaskCompletion(id)
  }

  // ✅ Spirit Echo (Formerly Foresight)
  const handleForesightAction = () => {
    const tomorrowDayIndex = (new Date().getDay() + 1) % 7
    
    const completedTasks = tasks.filter(t => t.isCompleted)
    const tasksToAdd = completedTasks.filter(t => {
      const isDaily = t.repeat === 'daily'
      const isCustomTomorrow = t.repeat === 'custom' && (t.repeatDays || []).includes(tomorrowDayIndex)
      return isDaily || isCustomTomorrow
    })

    if (tasksToAdd.length === 0) {
      showToast('🔮 No echoes found for tomorrow', 'info')
      return
    }

    tasksToAdd.forEach(originalTask => {
      const newTask = {
        ...originalTask,
        id: crypto.randomUUID(),
        isCompleted: false,
        repeat: originalTask.repeat, 
        repeatDays: originalTask.repeatDays
      }
      addTask(newTask)
      deleteTask(originalTask.id)
    })

    showToast(`✨ ${tasksToAdd.length} tasks echoed from the void!`, 'success')
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (!quickAddTitle.trim()) return
    addTask({
      title: quickAddTitle.trim(), difficulty: 'low',
      repeat: 'once', repeatDays: [],
      isTrivial: false, tags: [], notes: '', subtasks: []
    })
    setQuickAddTitle('')
  }
  
  const handleFormSubmit = (data) => { if (editingTask) { updateTask(editingTask.id, data) } else { addTask(data) }; setEditingTask(null) }
  const handleDeleteSafe = (id) => { setConfirmConfig({ isOpen: true, title: "Destroy Mandate", message: "Are you sure?", confirmText: "Destroy", isDanger: true, onConfirm: () => deleteTask(id) }) }
  const confirmHarvest = (minutes, streaks, xp, stones) => { processDailyHarvest(minutes, streaks, xp, stones); setIsHarvestOpen(false) } 
  const difficultyOptions = Object.keys(DIFFICULTY_TIERS)
  const toggleDifficultyFilter = (d) => { setFilterDifficulty(prev => prev === d ? 'All' : d) }
  const toggleTagFilter = (t) => { setFilterTag(prev => prev === t ? 'All' : t) }
  const isDragEnabled = searchQuery === '' && filterDifficulty === 'All' && filterTag === 'All'

  return (
    <>
      <section className="relative rounded-3xl border border-amber-900/30 bg-slate-900/80 shadow-2xl p-6 backdrop-blur-md">
        
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-amber-500/10 text-amber-400 border-amber-500/20">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-100">
                Tasks
              </h2>
              <p className="text-xs text-slate-400">Drag to prioritize</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* ✅ Next Tasks Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              onClick={handleForesightAction}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/50 bg-indigo-600/20 px-3 py-2 text-xs font-bold uppercase text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-500/20"
            >
              <Repeat size={16} />
              <span className="hidden sm:inline">Repeat Tasks</span>
            </motion.button>
            <div className="w-px h-6 bg-slate-800 mx-1"></div>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setIsHarvestOpen(true)} className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-bold uppercase text-amber-300 hover:bg-amber-500 hover:text-slate-900 transition-colors mr-2"><Sun size={16} /> <span className="hidden sm:inline">Harvest</span></motion.button>
            <div className="flex rounded-lg bg-slate-950/50 p-1 border border-slate-800">
              <button onClick={() => setActiveTab('todo')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'todo' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><ListTodo size={14} /> To Do</button>
              <button onClick={() => setActiveTab('completed')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'completed' ? 'bg-slate-800 text-amber-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><CheckCircle2 size={14} /> Done</button>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setEditingTask(null); setIsFormOpen(true); }} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg hover:bg-emerald-500 transition-colors"><Plus size={16} /> <span className="hidden sm:inline">New Task</span></motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search mandates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950/50 pl-9 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X size={14} /></button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${showFilters || filterDifficulty !== 'All' || filterTag !== 'All' ? 'bg-slate-800 border-emerald-500/50 text-emerald-400' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}>
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-2 min-h-[200px] mb-4">
          <Reorder.Group axis="y" values={displayTasks} onReorder={handleReorder} className="flex flex-col gap-2">
            {displayTasks.length > 0 ? (
              displayTasks.map((task) => (
                <MissionCard 
                  key={task.id} 
                  task={task}
                  onToggle={handleToggle} onDelete={handleDeleteSafe} onUpdate={(id, d) => updateTask(id, d)} onEdit={() => { setEditingTask(task); setIsFormOpen(true); }} 
                  enableDrag={isDragEnabled} 
                />
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-800/50 rounded-2xl">
                <p className="text-sm text-slate-500">
                  No mandates pending.
                </p>
              </div>
            )}
          </Reorder.Group>
        </div>

        {/* Quick Add */}
        <form onSubmit={handleQuickAdd} className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Zap size={16} className="text-slate-500" /></div>
          <input type="text" value={quickAddTitle} onChange={(e) => setQuickAddTitle(e.target.value)} placeholder="Quick Add..." className="w-full rounded-xl border border-slate-700 bg-slate-950/80 focus:border-amber-500/50 pl-12 pr-12 py-3 text-sm text-slate-200 outline-none transition-all shadow-inner" />
          <button type="submit" disabled={!quickAddTitle.trim()} className="absolute inset-y-1 right-1 p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-emerald-600 hover:text-white disabled:opacity-0 transition-all"><ArrowRight size={16} /></button>
        </form>

      </section>
      <TaskFormModal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingTask(null); }} onSubmit={handleFormSubmit} initialData={editingTask} />
      <DailyHarvestModal isOpen={isHarvestOpen} onClose={() => setIsHarvestOpen(false)} onConfirm={confirmHarvest} />
      <ConfirmModal isOpen={confirmConfig.isOpen} onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} onConfirm={confirmConfig.onConfirm} title={confirmConfig.title} message={confirmConfig.message} confirmText={confirmConfig.confirmText} isDanger={confirmConfig.isDanger} />
    </>
  )
}