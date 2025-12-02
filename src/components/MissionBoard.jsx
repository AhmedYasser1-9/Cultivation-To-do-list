import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Scroll, Archive } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'
import MissionCard from './MissionCard.jsx'
import TaskFormModal from './TaskFormModal.jsx'

// تعريف قيم النقاط هنا لاستخدامها في الخصم
const XP_VALUES = {
  Low: 10,
  Medium: 25,
  High: 50,
  Extreme: 100
}

export default function MissionBoard() {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    processSession,
    gainQi // نحتاج هذه الدالة للخصم
  } = useCultivation()
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  const activeTasks = tasks.filter(t => !t.isCompleted)
  const completedTasks = tasks.filter(t => t.isCompleted)

  const handleModalSubmit = (taskData) => {
    addTask(taskData)
  }

  const handleToggle = (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    // المنطق الجديد: إضافة أو خصم
    if (!task.isCompleted) {
      // 1. المهمة لم تكن مكتملة -> الآن تكتمل -> أضف نقاط
      processSession(task.difficulty, 0)
    } else {
      // 2. المهمة كانت مكتملة -> الآن نلغيها -> اخصم نقاط
      // نحسب القيمة ونضربها في سالب
      const amount = XP_VALUES[task.difficulty] || 10
      gainQi(-amount)
    }

    // عكس الحالة البصرية
    toggleTaskCompletion(id)
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Scroll size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-100">Sect Missions</h2>
              <p className="text-xs text-slate-400">Current Mandates ({activeTasks.length})</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-900/20 transition-colors hover:bg-emerald-500"
          >
            <Plus size={16} />
            <span>New Mandate</span>
          </motion.button>
        </div>

        {/* Active Tasks */}
        <div className="flex flex-col gap-3 min-h-[100px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {activeTasks.length > 0 ? (
              activeTasks.map((task) => (
                <MissionCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={deleteTask}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-slate-800 rounded-2xl"
              >
                <p className="text-sm text-slate-500">No active mandates.</p>
                <p className="text-xs text-slate-600 mt-1">Rest, or seek new challenges.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="mt-8 border-t border-slate-800 pt-6"
          >
            <div className="mb-4 flex items-center gap-2 opacity-60">
              <Archive size={14} className="text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Past Glories ({completedTasks.length})
              </h3>
            </div>

            <div className="flex flex-col gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
              <AnimatePresence mode="popLayout" initial={false}>
                {completedTasks.map((task) => (
                  <MissionCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={deleteTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

      </section>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </>
  )
}