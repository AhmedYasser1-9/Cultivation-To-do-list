import { useState, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Plus, User, CheckCircle2, ListTodo, Sun, Search, Filter, X, Tag, Trash2, Zap, ArrowRight } from 'lucide-react'
import { useCultivation, DIFFICULTY_TIERS } from '../context/CultivationContext.jsx'
import MissionCard from './MissionCard.jsx'
import TaskFormModal from './TaskFormModal.jsx'
import DailyHarvestModal from './DailyHarvestModal.jsx'
import ConfirmModal from './ConfirmModal.jsx'

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
    completeTask, gainQi, reorderTasks, processDailyHarvest
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

  // ✅ Quick Add State
  const [quickAddTitle, setQuickAddTitle] = useState('')

  const availableTags = useMemo(() => {
    const tags = new Set(tasks.flatMap(t => t.tags || []))
    return ['All', ...Array.from(tags)]
  }, [tasks])

  const filteredTasks = tasks.filter(t => {
    const matchesTab = activeTab === 'todo' ? !t.isCompleted : t.isCompleted
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = filterDifficulty === 'All' || t.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
    const matchesTag = filterTag === 'All' || (t.tags && t.tags.includes(filterTag))
    return matchesTab && matchesSearch && matchesDifficulty && matchesTag
  })

  const todoTasks = filteredTasks.filter(t => !t.isCompleted)
  const completedTasks = filteredTasks.filter(t => t.isCompleted)

  const handleReorder = (newOrder) => {
    if (searchQuery === '' && filterDifficulty === 'All' && filterTag === 'All') {
      const otherTasks = tasks.filter(t => t.isCompleted)
      reorderTasks([...newOrder, ...otherTasks])
    }
  }

  const handleToggle = (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    if (!task.isCompleted) {
      completeTask(task)
    } else {
      if (!task.isTrivial) {
        const key = String(task.difficulty).toLowerCase()
        const amount = DIFFICULTY_TIERS[key]?.xp || 10
        gainQi(-amount)
      }
    }
    toggleTaskCompletion(id)
  }

  const handleFormSubmit = (data) => {
    if (editingTask) { updateTask(editingTask.id, data) } else { addTask(data) }
    setEditingTask(null)
  }
  const openEditModal = (task) => { setEditingTask(task); setIsFormOpen(true) }

  const handleDeleteSafe = (id) => {
    setConfirmConfig({
      isOpen: true, title: "Destroy Mandate", message: "Are you sure you want to burn this scroll?", confirmText: "Destroy", isDanger: true,
      onConfirm: () => deleteTask(id)
    })
  }

  // ✅ Quick Add Handler
  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (!quickAddTitle.trim()) return
    addTask({
      title: quickAddTitle.trim(),
      difficulty: 'low', // Default
      repeat: 'once', // Default
      isTrivial: false,
      tags: [],
      notes: '',
      subtasks: []
    })
    setQuickAddTitle('')
  }

  const confirmHarvest = (totalMinutes, streaks) => { processDailyHarvest(totalMinutes, streaks); setIsHarvestOpen(false) }
  const difficultyOptions = Object.keys(DIFFICULTY_TIERS)
  const toggleDifficultyFilter = (d) => { setFilterDifficulty(prev => prev === d ? 'All' : d) }
  const toggleTagFilter = (t) => { setFilterTag(prev => prev === t ? 'All' : t) }

  return (
    <>
      <section className="relative rounded-3xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
        
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20"><User size={20} /></div>
            <div><h2 className="text-lg font-bold text-emerald-100">Personal Cultivation</h2><p className="text-xs text-slate-400">Drag to prioritize your path</p></div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setIsHarvestOpen(true)} className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-bold uppercase text-amber-300 hover:bg-amber-500 hover:text-slate-900 transition-colors mr-2"><Sun size={16} /> <span className="hidden sm:inline">Harvest</span></motion.button>
            <div className="flex rounded-lg bg-slate-950/50 p-1 border border-slate-800">
              <button onClick={() => setActiveTab('todo')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'todo' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><ListTodo size={14} /> To Do</button>
              <button onClick={() => setActiveTab('completed')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'completed' ? 'bg-slate-800 text-amber-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><CheckCircle2 size={14} /> Done</button>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setEditingTask(null); setIsFormOpen(true); }} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg hover:bg-emerald-500 transition-colors"><Plus size={16} /> <span className="hidden sm:inline">New Task</span></motion.button>
          </div>
        </div>

        {/* Filters Toolbar */}
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
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-950/30 border border-slate-800/50 mt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Difficulty Grade</label>{(filterDifficulty !== 'All') && (<button onClick={() => setFilterDifficulty('All')} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"><X size={10}/> Clear</button>)}</div>
                    <div className="flex flex-wrap gap-2">
                      {difficultyOptions.map(d => (<button key={d} onClick={() => toggleDifficultyFilter(d)} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${filterDifficulty === d ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}>{DIFFICULTY_TIERS[d]?.label || d}</button>))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Filter by Tag</label>{(filterTag !== 'All') && (<button onClick={() => setFilterTag('All')} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"><X size={10}/> Clear</button>)}</div>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.filter(t => t !== 'All').map(tag => (<button key={tag} onClick={() => toggleTagFilter(tag)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all ${filterTag === tag ? 'ring-2 ring-offset-1 ring-offset-slate-900 ring-emerald-500 opacity-100 scale-105' : 'opacity-60 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0'} ${getTagColor(tag)}`}>{tag}</button>))}
                    </div>
                  </div>
                  {(filterDifficulty !== 'All' || filterTag !== 'All') && (<div className="pt-3 border-t border-slate-800 flex justify-end"><button onClick={() => { setFilterDifficulty('All'); setFilterTag('All'); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 hover:text-red-300 transition-all"><Trash2 size={14} /> Clear Active Filters</button></div>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-2 min-h-[200px] mb-4">
          {activeTab === 'todo' ? (
            <Reorder.Group axis="y" values={todoTasks} onReorder={handleReorder} className="flex flex-col gap-2">
              {todoTasks.length > 0 ? (
                todoTasks.map((task) => (
                  <MissionCard key={task.id} task={task} onToggle={handleToggle} onDelete={handleDeleteSafe} onUpdate={updateTask} onEdit={() => openEditModal(task)} enableDrag={searchQuery === '' && filterDifficulty === 'All' && filterTag === 'All'} />
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-slate-800/50 rounded-2xl"><p className="text-sm text-slate-500">{(searchQuery || filterDifficulty !== 'All' || filterTag !== 'All') ? 'No mandates match your filters.' : 'No mandates pending.'}</p></div>
              )}
            </Reorder.Group>
          ) : (
            <div className="flex flex-col gap-2">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <MissionCard key={task.id} task={task} onToggle={handleToggle} onDelete={handleDeleteSafe} onUpdate={updateTask} onEdit={() => openEditModal(task)} enableDrag={false} />
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-slate-800/50 rounded-2xl"><p className="text-sm text-slate-500">No past glories yet.</p></div>
              )}
            </div>
          )}
        </div>

        {/* ✅ Quick Flash Add Bar */}
        {activeTab === 'todo' && (
          <form onSubmit={handleQuickAdd} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Zap size={16} className="text-slate-500 group-focus-within:text-amber-400 transition-colors" />
            </div>
            <input 
              type="text" 
              value={quickAddTitle}
              onChange={(e) => setQuickAddTitle(e.target.value)}
              placeholder="Quick Flash: Type mandate & press Enter..." 
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-12 pr-12 py-3 text-sm text-slate-200 outline-none focus:border-amber-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-600 shadow-inner"
            />
            <button 
              type="submit"
              disabled={!quickAddTitle.trim()}
              className="absolute inset-y-1 right-1 p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-emerald-600 hover:text-white disabled:opacity-0 disabled:scale-90 transition-all"
            >
              <ArrowRight size={16} />
            </button>
          </form>
        )}

      </section>

      <TaskFormModal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingTask(null); }} onSubmit={handleFormSubmit} initialData={editingTask} />
      <DailyHarvestModal isOpen={isHarvestOpen} onClose={() => setIsHarvestOpen(false)} onConfirm={confirmHarvest} />
      <ConfirmModal isOpen={confirmConfig.isOpen} onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} onConfirm={confirmConfig.onConfirm} title={confirmConfig.title} message={confirmConfig.message} confirmText={confirmConfig.confirmText} isDanger={confirmConfig.isDanger} />
    </>
  )
}