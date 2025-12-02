import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Plus, User, CheckCircle2, ListTodo, Sun } from 'lucide-react' // Added Sun Icon
import { useCultivation, DIFFICULTY_TIERS } from '../context/CultivationContext.jsx'
import MissionCard from './MissionCard.jsx'
import TaskFormModal from './TaskFormModal.jsx'
import DailyHarvestModal from './DailyHarvestModal.jsx' // Import

export default function MissionBoard() {
  const {
    tasks, addTask, updateTask, deleteTask, toggleTaskCompletion,
    completeTask, gainQi, reorderTasks, processDailyHarvest
  } = useCultivation()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isHarvestOpen, setIsHarvestOpen] = useState(false) // Harvest Modal
  const [activeTab, setActiveTab] = useState('todo')

  const todoTasks = tasks.filter(t => !t.isCompleted)
  const completedTasks = tasks.filter(t => t.isCompleted)

  const handleReorder = (newOrder) => {
    reorderTasks([...newOrder, ...completedTasks])
  }

  const handleToggle = (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    if (!task.isCompleted) {
      // 1. Just award difficulty XP immediately
      completeTask(task.difficulty)
    } else {
      // 2. Penalty for unchecking
      const key = String(task.difficulty).toLowerCase()
      const amount = DIFFICULTY_TIERS[key]?.xp || 10
      gainQi(-amount)
    }
    toggleTaskCompletion(id)
  }

  const confirmHarvest = (totalMinutes, streaks) => {
    processDailyHarvest(totalMinutes, streaks)
    setIsHarvestOpen(false)
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
        
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-100">Personal Cultivation</h2>
              <p className="text-xs text-slate-400">Drag to prioritize your path</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Harvest Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              onClick={() => setIsHarvestOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-bold uppercase text-amber-300 hover:bg-amber-500 hover:text-slate-900 transition-colors"
            >
              <Sun size={16} /> <span className="hidden sm:inline">Harvest</span>
            </motion.button>

            <div className="flex rounded-lg bg-slate-950/50 p-1 border border-slate-800">
              <button onClick={() => setActiveTab('todo')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'todo' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                <ListTodo size={14} /> To Do
              </button>
              <button onClick={() => setActiveTab('completed')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'completed' ? 'bg-slate-800 text-amber-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                <CheckCircle2 size={14} /> Done
              </button>
            </div>
            
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg hover:bg-emerald-500 transition-colors">
              <Plus size={16} /> <span className="hidden sm:inline">New Task</span>
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-[200px]">
          {activeTab === 'todo' ? (
            <Reorder.Group axis="y" values={todoTasks} onReorder={handleReorder} className="flex flex-col gap-2">
              {todoTasks.length > 0 ? (
                todoTasks.map((task) => (
                  <MissionCard key={task.id} task={task} onToggle={handleToggle} onDelete={deleteTask} onUpdate={updateTask} enableDrag={true} />
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-slate-800/50 rounded-2xl">
                  <p className="text-sm text-slate-500">No mandates pending.</p>
                </div>
              )}
            </Reorder.Group>
          ) : (
            <div className="flex flex-col gap-2">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <MissionCard key={task.id} task={task} onToggle={handleToggle} onDelete={deleteTask} onUpdate={updateTask} enableDrag={false} />
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-slate-800/50 rounded-2xl">
                  <p className="text-sm text-slate-500">No past glories yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <TaskFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={(data) => addTask(data)} />
      
      {/* Harvest Modal */}
      <DailyHarvestModal 
        isOpen={isHarvestOpen} 
        onClose={() => setIsHarvestOpen(false)} 
        onConfirm={confirmHarvest} 
      />
    </>
  )
}