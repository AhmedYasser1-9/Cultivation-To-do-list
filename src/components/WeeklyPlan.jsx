import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, Trash2, Check, MoreHorizontal, PenSquare, Copy } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'
import WeeklyTargetFormModal from './WeeklyTargetFormModal.jsx'

// ... (KEEP TAG_THEMES, CARD_THEMES, CARD_PICKER_STYLES, difficultyConfig, getHashColorKey AS IS) ...
const TAG_THEMES = {
  red:     { bg: 'bg-red-500/20', text: 'text-red-200', border: 'border-red-500/50' },
  orange:  { bg: 'bg-orange-500/20', text: 'text-orange-200', border: 'border-orange-500/50' },
  amber:   { bg: 'bg-amber-500/20', text: 'text-amber-200', border: 'border-amber-500/50' },
  yellow:  { bg: 'bg-yellow-400/20', text: 'text-yellow-200', border: 'border-yellow-400/50' },
  lime:    { bg: 'bg-lime-500/20', text: 'text-lime-200', border: 'border-lime-500/50' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-200', border: 'border-emerald-500/50' },
  teal:    { bg: 'bg-teal-500/20', text: 'text-teal-200', border: 'border-teal-500/50' },
  cyan:    { bg: 'bg-cyan-500/20', text: 'text-cyan-200', border: 'border-cyan-500/50' },
  blue:    { bg: 'bg-blue-500/20', text: 'text-blue-200', border: 'border-blue-500/50' },
  indigo:  { bg: 'bg-indigo-500/20', text: 'text-indigo-200', border: 'border-indigo-500/50' },
  violet:  { bg: 'bg-violet-500/20', text: 'text-violet-200', border: 'border-violet-500/50' },
  fuchsia: { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-200', border: 'border-fuchsia-500/50' },
  pink:    { bg: 'bg-pink-500/20', text: 'text-pink-200', border: 'border-pink-500/50' },
}

const CARD_THEMES = {
  default: 'bg-slate-900/60 border-slate-800',
  red:     'bg-red-950/40 border-red-900/60 shadow-[inset_0_0_15px_rgba(127,29,29,0.2)]',
  orange:  'bg-orange-950/40 border-orange-900/60 shadow-[inset_0_0_15px_rgba(124,45,18,0.2)]',
  amber:   'bg-amber-950/40 border-amber-900/60 shadow-[inset_0_0_15px_rgba(120,53,15,0.2)]',
  green:   'bg-emerald-950/40 border-emerald-900/60 shadow-[inset_0_0_15px_rgba(6,78,59,0.2)]',
  blue:    'bg-blue-950/40 border-blue-900/60 shadow-[inset_0_0_15px_rgba(30,58,138,0.2)]',
  indigo:  'bg-indigo-950/40 border-indigo-900/60 shadow-[inset_0_0_15px_rgba(49,46,129,0.2)]',
  violet:  'bg-violet-950/40 border-violet-900/60 shadow-[inset_0_0_15px_rgba(91,33,182,0.2)]',
  pink:    'bg-pink-950/40 border-pink-900/60 shadow-[inset_0_0_15px_rgba(131,24,67,0.2)]',
}

const CARD_PICKER_STYLES = {
  default: 'bg-slate-800 border-slate-600',
  red:     'bg-red-900 border-red-700',
  orange:  'bg-orange-900 border-orange-700',
  amber:   'bg-amber-900 border-amber-700',
  green:   'bg-emerald-900 border-emerald-700',
  blue:    'bg-blue-900 border-blue-700',
  indigo:  'bg-indigo-900 border-indigo-700',
  violet:  'bg-violet-900 border-violet-700',
  pink:    'bg-pink-900 border-pink-700',
}

const difficultyConfig = {
  'low': { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  'low-med': { color: 'text-teal-400', border: 'border-teal-500/30', bg: 'bg-teal-500/10' },
  'med': { color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' },
  'med-high': { color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  'high': { color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
  'high-extreme': { color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  'extreme': { color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
  'Low': { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  'Medium': { color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' },
  'High': { color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
  'Extreme': { color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
}

const getHashColorKey = (text) => {
  const keys = Object.keys(TAG_THEMES)
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash)
  return keys[Math.abs(hash % keys.length)]
}

// ✅ Updated WeeklyCard (Added Edit & Duplicate)
function WeeklyCard({ target, onDelete, onUpdate, onDuplicate, onEdit, tagColors, setTagColor }) {
  const [showMenu, setShowMenu] = useState(false)
  const [openTagMenu, setOpenTagMenu] = useState(null)
  const isCompleted = target.progress >= 100
  
  const diffKey = difficultyConfig[target.difficulty] ? target.difficulty : (difficultyConfig[target.difficulty.toLowerCase()] ? target.difficulty.toLowerCase() : 'low')
  const style = difficultyConfig[diffKey]
  const bgStyle = CARD_THEMES[target.color] || CARD_THEMES.default

  const changeColor = (newColor) => {
    onUpdate(target.id, { color: newColor })
    setShowMenu(false)
  }

  const handleTagColorChange = (tag, colorKey) => {
    setTagColor(tag, colorKey)
    setOpenTagMenu(null)
  }

  const handleDuplicate = () => {
    onDuplicate(target.id)
    setShowMenu(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200 ${bgStyle} ${isCompleted ? 'opacity-50 grayscale-[0.5]' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-2 font-mono text-[10px] font-bold ${isCompleted ? 'border-emerald-500 bg-emerald-500 text-slate-900' : 'border-slate-700 bg-slate-950 text-indigo-400'}`}>
          {isCompleted ? <Check size={16} strokeWidth={3} /> : `${target.progress}%`}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className={`w-full text-base font-medium truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
              {target.title}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {style && <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${style.border} ${style.bg} ${style.color} select-none`}>{target.difficulty}</span>}
            
            {target.tags && target.tags.map((tag) => {
              const savedKey = tagColors[tag]
              const key = savedKey && TAG_THEMES[savedKey] ? savedKey : getHashColorKey(tag)
              const theme = TAG_THEMES[key]
              
              return (
                <div key={tag} className="relative">
                   <span 
                      onClick={() => !isCompleted && setOpenTagMenu(openTagMenu === tag ? null : tag)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border cursor-pointer shadow-sm select-none ${theme.bg} ${theme.text} ${theme.border}`}
                   >
                    #{tag}
                  </span>
                  {openTagMenu === tag && (
                    <div className="absolute top-9 left-0 z-30 grid grid-cols-6 gap-2 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl w-64">
                      {Object.entries(TAG_THEMES).map(([k, t]) => (
                        <button key={k} onClick={() => handleTagColorChange(tag, k)} className={`w-6 h-6 rounded-full ${t.bg} ${t.border} border-2 hover:scale-110 hover:brightness-125 transition-all shadow-sm`} title={k.charAt(0).toUpperCase() + k.slice(1)} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button onClick={() => setShowMenu(!showMenu)} className="rounded p-1.5 text-slate-500 opacity-0 transition-all hover:bg-slate-800 hover:text-slate-200 group-hover:opacity-100">
            <MoreHorizontal size={18} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 z-50 w-56 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
              <p className="mb-2 text-[10px] font-bold uppercase text-slate-500 px-1">Card Color</p>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {Object.keys(CARD_THEMES).map(c => (
                  <button key={c} onClick={() => changeColor(c)} className={`h-7 w-7 rounded-full ${CARD_PICKER_STYLES[c]} hover:scale-110 hover:ring-2 ring-white/50 transition-all shadow-md`} title={c.charAt(0).toUpperCase() + c.slice(1)} />
                ))}
              </div>
              <div className="h-px bg-slate-800 my-2" />
              
              {/* ✅ ADDED: Edit & Duplicate Buttons */}
              <button onClick={() => { onEdit(target); setShowMenu(false); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors mb-1">
                <PenSquare size={14} /> Edit Details
              </button>
              <button onClick={handleDuplicate} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors mb-1">
                <Copy size={14} /> Duplicate
              </button>
              
              <button onClick={() => onDelete(target.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 size={14} /> Delete Target
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
        <motion.div 
          className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${target.progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  )
}

export default function WeeklyPlan() {
  const { weeklyTargets, addWeeklyTarget, deleteWeeklyTarget, updateWeeklyTarget, duplicateWeeklyTarget, tagColors, setTagColor } = useCultivation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState(null) // ✅ Track editing target

  // ✅ Wrapper for submitting (Handles Add vs Update)
  const handleModalSubmit = (data) => {
    if (editingTarget) {
      updateWeeklyTarget(editingTarget.id, data)
    } else {
      addWeeklyTarget(data)
    }
    setEditingTarget(null)
  }

  const openNewModal = () => {
    setEditingTarget(null)
    setIsModalOpen(true)
  }

  const openEditModal = (target) => {
    setEditingTarget(target)
    setIsModalOpen(true)
  }

  return (
    <section className="relative rounded-3xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
      
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-100">Destiny Calendar</h2>
            <p className="text-xs text-slate-400">Grand Ambitions</p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={openNewModal}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg hover:bg-indigo-500 transition-colors"
        >
          <Plus size={16} /> <span className="hidden sm:inline">New Target</span>
        </motion.button>
      </div>

      <div className="flex flex-col gap-2 min-h-[200px]">
        <AnimatePresence>
          {weeklyTargets.length > 0 ? (
            weeklyTargets.map(target => (
              <WeeklyCard 
                key={target.id}
                target={target}
                onDelete={deleteWeeklyTarget}
                onUpdate={updateWeeklyTarget}
                onDuplicate={duplicateWeeklyTarget} // ✅ Passed duplicate handler
                onEdit={openEditModal} // ✅ Passed edit handler
                tagColors={tagColors}
                setTagColor={setTagColor}
              />
            ))
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-slate-800/50 rounded-2xl">
              <p className="text-sm text-slate-500">The destiny scroll is blank.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ Pass editing target and submit handler */}
      <WeeklyTargetFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingTarget} 
        onSubmit={handleModalSubmit}
      />
    </section>
  )
}