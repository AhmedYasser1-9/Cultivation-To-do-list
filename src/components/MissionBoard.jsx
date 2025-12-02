import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Plus, User, CheckCircle2, ListTodo } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'
import MissionCard from './MissionCard.jsx'
import TaskFormModal from './TaskFormModal.jsx'

const XP_VALUES = { Low: 10, Medium: 25, High: 50, Extreme: 100 }

export default function MissionBoard() {
  const {
    tasks, addTask, updateTask, deleteTask, toggleTaskCompletion,
    processSession, gainQi, reorderTasks
  } = useCultivation()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('todo')

  // فصل المهام للقائمتين
  const todoTasks = tasks.filter(t => !t.isCompleted)
  const completedTasks = tasks.filter(t => t.isCompleted)

  const handleReorder = (newOrder) => {
    // دمج الترتيب الجديد مع المهام المكتملة للحفاظ على القائمة
    const combined = [...newOrder, ...completedTasks]
    reorderTasks(combined)
  }

  const handleToggle = (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    if (!task.isCompleted) {
      processSession(task.difficulty, 0)
    } else {
      const amount = XP_VALUES[task.difficulty] || 10
      gainQi(-amount)
    }
    toggleTaskCompletion(id)
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
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
            <div className="flex rounded-lg bg-slate-950/50 p-1 border border-slate-800">
              <button onClick={() => setActiveTab('todo')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'todo' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                <ListTodo size={14} /> To Do
              </button>
              <button onClick={() => setActiveTab('completed')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'completed' ? 'bg-slate-800 text-amber-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                <CheckCircle2 size={14} /> Done
              </button>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-900/20 transition-colors hover:bg-emerald-500">
              <Plus size={16} /> <span className="hidden sm:inline">New Task</span>
            </motion.button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-2 min-h-[200px]">
          {activeTab === 'todo' ? (
            <Reorder.Group axis="y" values={todoTasks} onReorder={handleReorder} className="flex flex-col gap-2">
              {todoTasks.length > 0 ? (
                todoTasks.map((task) => (
                  <MissionCard 
                    key={task.id} 
                    task={task} 
                    onToggle={handleToggle} 
                    onDelete={deleteTask} 
                    onUpdate={updateTask}
                    enableDrag={true} // تفعيل السحب هنا فقط
                  />
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-slate-800/50 rounded-2xl">
                  <p className="text-sm text-slate-500">No mandates pending.</p>
                </div>
              )}
            </Reorder.Group>
          ) : (
            // القائمة المكتملة (بدون Reorder Group)
            <div className="flex flex-col gap-2">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <MissionCard 
                    key={task.id} 
                    task={task} 
                    onToggle={handleToggle} 
                    onDelete={deleteTask} 
                    onUpdate={updateTask}
                    enableDrag={false} // تعطيل السحب
                  />
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

      <TaskFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={(data) => addTask(data)} />
    </>
  )
}