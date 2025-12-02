import { useState } from 'react'
import { Reorder, useDragControls, motion } from 'framer-motion'
import { Trash2, Check, MoreHorizontal, GripVertical } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'

// ألوان التاجات المتاحة
const TAG_PALETTE = {
  red: 'bg-red-500/20 text-red-200 border-red-500/30',
  orange: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
  amber: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
  blue: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  violet: 'bg-violet-500/20 text-violet-200 border-violet-500/30',
  fuchsia: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30',
}

const BG_COLORS = {
  default: 'bg-slate-900/40 border-white/5',
  red: 'bg-red-900/20 border-red-500/20',
  orange: 'bg-orange-900/20 border-orange-500/20',
  yellow: 'bg-yellow-900/20 border-yellow-500/20',
  green: 'bg-emerald-900/20 border-emerald-500/20',
  blue: 'bg-blue-900/20 border-blue-500/20',
  purple: 'bg-violet-900/20 border-violet-500/20',
}

const difficultyConfig = {
  Low: { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  Medium: { color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' },
  High: { color: 'text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-500/10' },
  Extreme: { color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
}

const getHashColor = (text) => {
  const keys = Object.keys(TAG_PALETTE)
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_PALETTE[keys[Math.abs(hash % keys.length)]]
}

export default function MissionCard({ task, onToggle, onDelete, onUpdate, enableDrag = false }) {
  const { tagColors, setTagColor } = useCultivation()
  const { id, title, difficulty, isCompleted, tags = [], color = 'default' } = task
  
  const controls = useDragControls()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [showMenu, setShowMenu] = useState(false)
  const [openTagMenu, setOpenTagMenu] = useState(null)

  const style = difficultyConfig[difficulty] || difficultyConfig.Low
  const bgStyle = BG_COLORS[color] || BG_COLORS.default

  const handleBlur = () => { setIsEditing(false); if (editTitle.trim() !== title) onUpdate(id, { title: editTitle }) }
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleBlur() }
  const changeColor = (newColor) => { onUpdate(id, { color: newColor }); setShowMenu(false) }

  const handleTagColorChange = (tag, colorKey) => {
    setTagColor(tag, colorKey)
    setOpenTagMenu(null)
  }

  const Component = enableDrag ? Reorder.Item : motion.div
  
  const dragProps = enableDrag ? {
    value: task,
    dragListener: false,
    dragControls: controls
  } : {}

  return (
    <Component
      {...dragProps}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      // إضافة select-none للكارد كله لمنع التظليل العرضي أثناء الحركة السريعة
      className={`group relative flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 ${bgStyle} ${isCompleted ? 'opacity-50 grayscale-[0.5]' : ''} ${enableDrag ? 'touch-none' : ''}`}
    >
      {/* 🛑 FIX: Drag Handle Update */}
      {!isCompleted && enableDrag && (
        <div 
          onPointerDown={(e) => {
            e.preventDefault() // 1. يمنع المتصفح من بدء تحديد النص
            e.stopPropagation() // 2. يمنع الحدث من الوصول لعناصر أخرى
            controls.start(e) // 3. يبدأ السحب
          }}
          // 4. touch-none و select-none تمنع التفاعل النصي
          className="cursor-grab text-slate-600 hover:text-slate-400 active:cursor-grabbing p-1 touch-none select-none"
        >
          <GripVertical size={16} />
        </div>
      )}

      <button onClick={() => onToggle(id)} className={`relative z-10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-all ${isCompleted ? 'border-amber-500 bg-amber-500 text-slate-900' : 'border-slate-600 bg-slate-950/50 hover:border-amber-400/50'}`}>
        {isCompleted && <Check size={14} strokeWidth={3} />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          {isEditing ? (
            <input 
              autoFocus 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              onBlur={handleBlur} 
              onKeyDown={handleKeyDown} 
              className="w-full bg-transparent text-sm font-medium text-white outline-none" 
            />
          ) : (
            <span 
              onClick={() => !isCompleted && setIsEditing(true)} 
              // select-text يسمح بالتحديد فقط عند الرغبة، لكن المقبض محمي الآن
              className={`w-full text-sm font-medium cursor-text truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200 hover:text-white'}`}
            >
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
           <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${style.border} ${style.bg} ${style.color} select-none`}>{difficulty}</span>
          
          {tags.map((tag) => {
            const savedColor = tagColors[tag]
            const tagClass = savedColor ? TAG_PALETTE[savedColor] : getHashColor(tag)
            return (
              <div key={tag} className="relative">
                <span 
                  onClick={() => !isCompleted && setOpenTagMenu(openTagMenu === tag ? null : tag)}
                  className={`text-[10px] px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 select-none ${tagClass}`}
                >
                  #{tag}
                </span>
                
                {openTagMenu === tag && (
                  <div className="absolute top-6 left-0 z-30 flex gap-1 bg-slate-900 border border-slate-700 p-1.5 rounded-lg shadow-xl">
                    {Object.keys(TAG_PALETTE).map(c => (
                      <button key={c} onClick={() => handleTagColorChange(tag, c)} className={`w-4 h-4 rounded-full ${TAG_PALETTE[c].split(' ')[0]} border border-white/20 hover:scale-110`} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="rounded p-1 text-slate-500 opacity-0 transition-opacity hover:bg-slate-800 hover:text-slate-200 group-hover:opacity-100">
          <MoreHorizontal size={16} />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl z-50">
            <p className="mb-2 text-[10px] font-bold uppercase text-slate-500 px-1">Background Color</p>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {Object.keys(BG_COLORS).map(c => (
                <button key={c} onClick={() => changeColor(c)} className={`h-6 w-6 rounded border border-white/10 ${BG_COLORS[c].split(' ')[0]} hover:scale-110 transition-transform`} />
              ))}
            </div>
            <button onClick={() => onDelete(id)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-400 hover:bg-red-900/20">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </Component>
  )
}