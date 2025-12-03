import { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom' // ✅ Import Portal
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { Calendar, Plus, Trash2, Check, MoreHorizontal, PenSquare, Copy, GripVertical, Search, X, Filter } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'
import WeeklyTargetFormModal from './WeeklyTargetFormModal.jsx'

// --- CONSTANTS (Same as before) ---
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

const DIFFICULTY_TIERS = {
  'low': { label: 'Low' }, 'low-med': { label: 'Low-Med' }, 'med': { label: 'Med' },
  'med-high': { label: 'Med-High' }, 'high': { label: 'High' }, 
  'high-extreme': { label: 'High-Extreme' }, 'extreme': { label: 'Extreme' },
}

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

const getHashColorKey = (text) => {
  const keys = Object.keys(TAG_THEMES)
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash)
  return keys[Math.abs(hash % keys.length)]
}

function WeeklyCard({ target, onDelete, onUpdate, onDuplicate, onEdit, tagColors, setTagColor, enableDrag }) {
  const controls = useDragControls()
  
  // State for Menus
  const [showMenu, setShowMenu] = useState(false)
  const [openTagMenu, setOpenTagMenu] = useState(null)
  
  // Refs & Pos
  const menuButtonRef = useRef(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })

  const isCompleted = target.progress >= 100
  
  const diffKey = difficultyConfig[target.difficulty] ? target.difficulty : (difficultyConfig[target.difficulty.toLowerCase()] ? target.difficulty.toLowerCase() : 'low')
  const style = difficultyConfig[diffKey]
  const bgStyle = CARD_THEMES[target.color] || CARD_THEMES.default

  const changeColor = (newColor) => { onUpdate(target.id, { color: newColor }); setShowMenu(false) }
  const handleTagColorChange = (tag, colorKey) => { setTagColor(tag, colorKey); setOpenTagMenu(null) }
  const handleDuplicate = () => { onDuplicate(target.id); setShowMenu(false) }
  const handleToggleComplete = () => {
    const newProgress = isCompleted ? 0 : 100
    onUpdate(target.id, { progress: newProgress, status: newProgress >= 100 ? 'completed' : 'active' })
  }

  // ✅ Open Card Menu (Calculate Position)
  const handleOpenMenu = (e) => {
    e.stopPropagation()
    const rect = menuButtonRef.current.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 5, left: rect.right - 224 }) // Align Right
    setShowMenu(true)
  }

  // ✅ Open Tag Menu (Calculate Position)
  const handleOpenTagMenu = (e, tag) => {
    e.stopPropagation()
    if (isCompleted) return
    if (openTagMenu === tag) {
      setOpenTagMenu(null)
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 5, left: rect.left })
      setOpenTagMenu(tag)
    }
  }

  const Component = enableDrag ? Reorder.Item : motion.div
  const dragProps = enableDrag ? {
    value: target, dragListener: false, dragControls: controls, drag: "y", dragElastic: 0, dragMomentum: false,
    whileDrag: { scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)", zIndex: 50, cursor: "grabbing" },
    transition: { duration: 0.2 }
  } : {}

  return (
    <>
      <Component
        {...dragProps}
        layout
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className={`group relative flex flex-col gap-3 rounded-xl border p-4 transition-colors duration-200 ${bgStyle} ${isCompleted ? 'opacity-50 grayscale-[0.5]' : ''} ${enableDrag ? 'touch-none' : ''}`}
      >
        <div className="flex items-center gap-3">
          {!isCompleted && enableDrag && (
            <div onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); controls.start(e) }} className="cursor-grab text-slate-500 hover:text-slate-300 active:cursor-grabbing p-2 -ml-2 touch-none select-none flex-shrink-0 transition-colors">
              <GripVertical size={18} />
            </div>
          )}

          <button type="button" onClick={handleToggleComplete} className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border-2 font-mono text-xs font-bold transition-colors ${isCompleted ? 'border-emerald-500 bg-emerald-500 text-slate-900' : 'border-slate-700 bg-slate-950 text-indigo-300 hover:border-indigo-400'}`}>
            {isCompleted ? <Check size={18} strokeWidth={3} /> : `${target.progress}%`}
          </button>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className={`w-full text-base font-medium truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>{target.title}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {style && <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${style.border} ${style.bg} ${style.color} select-none`}>{target.difficulty}</span>}
              {target.tags && target.tags.map((tag) => {
                const savedKey = tagColors[tag]; const key = savedKey && TAG_THEMES[savedKey] ? savedKey : getHashColorKey(tag); const theme = TAG_THEMES[key]
                return (
                  <span 
                    key={tag} 
                    onClick={(e) => handleOpenTagMenu(e, tag)} 
                    className={`text-xs font-bold px-2.5 py-1 rounded-md border cursor-pointer shadow-sm select-none transition-transform active:scale-95 ${theme.bg} ${theme.text} ${theme.border}`}
                  >
                    #{tag}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="relative flex-shrink-0">
            <button 
              ref={menuButtonRef}
              onClick={handleOpenMenu} 
              className="rounded p-1.5 text-slate-500 opacity-0 transition-all hover:bg-slate-800 hover:text-slate-200 group-hover:opacity-100"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
          <motion.div className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} initial={{ width: 0 }} animate={{ width: `${target.progress}%` }} transition={{ duration: 0.5 }} />
        </div>
      </Component>

      {/* ✅ Portal for Card Menu */}
      {showMenu && createPortal(
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
          <div 
            className="fixed z-[110] w-56 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <p className="mb-2 text-[10px] font-bold uppercase text-slate-500 px-1">Card Color</p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {Object.keys(CARD_THEMES).map(c => (
                <button key={c} onClick={() => changeColor(c)} className={`h-7 w-7 rounded-full ${CARD_PICKER_STYLES[c]} hover:scale-110 hover:ring-2 ring-white/50 transition-all shadow-md`} title={c.charAt(0).toUpperCase() + c.slice(1)} />
              ))}
            </div>
            <div className="h-px bg-slate-800 my-2" />
            
            <button onClick={() => { onEdit(target); setShowMenu(false); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors mb-1"><PenSquare size={14} /> Edit Details</button>
            <button onClick={handleDuplicate} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors mb-1"><Copy size={14} /> Duplicate</button>
            <button onClick={() => onDelete(target.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /> Delete Target</button>
          </div>
        </>,
        document.body
      )}

      {/* ✅ Portal for Tag Menu */}
      {openTagMenu && createPortal(
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpenTagMenu(null)} />
          <div 
            className="fixed z-[110] grid grid-cols-6 gap-2 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl w-64"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {Object.entries(TAG_THEMES).map(([k, t]) => (
              <button key={k} onClick={() => handleTagColorChange(openTagMenu, k)} className={`w-6 h-6 rounded-full ${t.bg} ${t.border} border-2 hover:scale-110 hover:brightness-125 transition-all shadow-sm`} title={k.charAt(0).toUpperCase() + k.slice(1)} />
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  )
}

export default function WeeklyPlan() {
  const { weeklyTargets, addWeeklyTarget, deleteWeeklyTarget, updateWeeklyTarget, duplicateWeeklyTarget, reorderWeeklyTargets, tagColors, setTagColor } = useCultivation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulties, setSelectedDifficulties] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const availableTags = useMemo(() => {
    const tags = new Set(weeklyTargets.flatMap(t => t.tags || []))
    return Array.from(tags)
  }, [weeklyTargets])

  // Filter Logic
  const filteredTargets = weeklyTargets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(t.difficulty)
    const matchesTag = selectedTags.length === 0 || (t.tags && t.tags.some(tag => selectedTags.includes(tag)))
    return matchesSearch && matchesDifficulty && matchesTag
  })

  const difficultyOptions = Object.keys(DIFFICULTY_TIERS)
  const toggleDifficultyFilter = (d) => {
    setSelectedDifficulties(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }
  const toggleTagFilter = (t) => {
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDifficulties([])
    setSelectedTags([])
  }

  // ✅ Drag is only enabled when filters are EMPTY
  const isDragEnabled = searchQuery === '' && selectedDifficulties.length === 0 && selectedTags.length === 0
  
  const handleReorder = (newOrder) => {
    if (isDragEnabled) reorderWeeklyTargets(newOrder)
  }

  const handleModalSubmit = (data) => {
    if (editingTarget) { updateWeeklyTarget(editingTarget.id, data) } else { addWeeklyTarget(data) }
    setEditingTarget(null)
  }
  const openNewModal = () => { setEditingTarget(null); setIsModalOpen(true) }
  const openEditModal = (target) => { setEditingTarget(target); setIsModalOpen(true) }

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
        <motion.button whileHover={{ scale: 1.05 }} onClick={openNewModal} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg hover:bg-indigo-500 transition-colors"><Plus size={16} /> <span className="hidden sm:inline">New Target</span></motion.button>
      </div>

      <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search ambitions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950/50 pl-9 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X size={14} /></button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${showFilters || selectedDifficulties.length > 0 || selectedTags.length > 0 ? 'bg-slate-800 border-indigo-500/50 text-indigo-400' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}>
              <Filter size={16} />
            </button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-950/30 border border-slate-800/50 mt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Difficulty Grade</label></div>
                    <div className="flex flex-wrap gap-2">
                      {difficultyOptions.map(d => (
                        <button key={d} onClick={() => toggleDifficultyFilter(d)} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${selectedDifficulties.includes(d) ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}>{DIFFICULTY_TIERS[d]?.label || d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Filter by Tag</label></div>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <button key={tag} onClick={() => toggleTagFilter(tag)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all ${selectedTags.includes(tag) ? 'ring-2 ring-offset-1 ring-offset-slate-900 ring-indigo-500 opacity-100 scale-105' : 'opacity-60 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0'} ${getTagColor(tag)}`}>{tag}</button>
                      ))}
                    </div>
                  </div>
                  {(selectedDifficulties.length > 0 || selectedTags.length > 0 || searchQuery) && (
                    <div className="pt-3 border-t border-slate-800 flex justify-end">
                      <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 hover:text-red-300 transition-all"><Trash2 size={14} /> Clear Active Filters</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2 min-h-[200px]">
        {/* ✅ FIXED: Removed AnimatePresence around the list items. This fixes the jitter/drag conflict. */}
        <Reorder.Group axis="y" values={filteredTargets} onReorder={handleReorder} className="flex flex-col gap-2">
          {filteredTargets.length > 0 ? (
            filteredTargets.map(target => (
              <WeeklyCard 
                key={target.id}
                target={target}
                onDelete={deleteWeeklyTarget}
                onUpdate={updateWeeklyTarget}
                onDuplicate={duplicateWeeklyTarget}
                onEdit={openEditModal}
                tagColors={tagColors}
                setTagColor={setTagColor}
                enableDrag={isDragEnabled}
              />
            ))
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-slate-800/50 rounded-2xl">
              <p className="text-sm text-slate-500">{(searchQuery || selectedDifficulties.length > 0 || selectedTags.length > 0) ? 'No ambitions match your filters.' : 'The destiny scroll is blank.'}</p>
            </div>
          )}
        </Reorder.Group>
      </div>

      <WeeklyTargetFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={editingTarget} onSubmit={handleModalSubmit} />
    </section>
  )
}