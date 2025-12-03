import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Target, Save, PlusCircle, PenSquare } from 'lucide-react'
import { useCultivation, DIFFICULTY_TIERS } from '../context/CultivationContext'

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

const getHashColorKey = (text) => {
  const keys = Object.keys(TAG_THEMES)
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash)
  return keys[Math.abs(hash % keys.length)]
}

// ✅ Added initialData for Edit Mode
export default function WeeklyTargetFormModal({ isOpen, onClose, initialData = null, onSubmit }) {
  const { knownTags, tagColors } = useCultivation()
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('med')
  const [tags, setTags] = useState([])
  const [currentTagInput, setCurrentTagInput] = useState('')

  // ✅ Load initial data if editing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title)
        setDifficulty(initialData.difficulty)
        setTags(initialData.tags || [])
      } else {
        setTitle('')
        setDifficulty('med')
        setTags([])
      }
      setCurrentTagInput('')
    }
  }, [isOpen, initialData])

  const getTagClass = (tag) => {
    const savedKey = tagColors[tag]
    const key = savedKey && TAG_THEMES[savedKey] ? savedKey : getHashColorKey(tag)
    const theme = TAG_THEMES[key]
    return `${theme.bg} ${theme.text} ${theme.border}`
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(currentTagInput) }
    else if (e.key === 'Backspace' && !currentTagInput && tags.length > 0) { setTags(tags.slice(0, -1)) }
  }

  const addTag = (tagText) => {
    const trimmed = tagText.trim()
    if (trimmed && !tags.includes(trimmed)) { setTags([...tags, trimmed]); setCurrentTagInput('') }
  }

  const removeTag = (tagToRemove) => { setTags(tags.filter((t) => t !== tagToRemove)) }

  const handleConfirm = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const finalTags = [...tags]
    if (currentTagInput.trim() && !finalTags.includes(currentTagInput.trim())) finalTags.push(currentTagInput.trim())
    
    // ✅ Use generic onSubmit to handle both Add and Edit
    onSubmit({ 
      title: title.trim(), 
      difficulty, 
      tags: finalTags,
    })
    onClose()
  }

  const suggestedTags = knownTags.filter(t => !tags.includes(t))

  const diffStyles = {
    'low': 'border-emerald-500 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20',
    'low-med': 'border-teal-500 text-teal-400 bg-teal-500/10 hover:bg-teal-500/20',
    'med': 'border-sky-500 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20',
    'med-high': 'border-blue-500 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20',
    'high': 'border-indigo-500 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20',
    'high-extreme': 'border-purple-500 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20',
    'extreme': 'border-rose-600 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-900 shadow-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-indigo-500/20 bg-slate-800/50 px-6 py-4 flex items-center gap-2">
              {initialData ? <PenSquare size={20} className="text-indigo-400"/> : <Target size={20} className="text-indigo-400"/>}
              <h2 className="text-lg font-bold uppercase tracking-widest text-indigo-100">
                {initialData ? 'Modify Ambition' : 'Forge Weekly Destiny'}
              </h2>
            </div>
            <form onSubmit={handleConfirm} className="space-y-6 px-6 py-6">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Main Objective</label>
                <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Master React Hooks" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-indigo-50 outline-none focus:border-indigo-400 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty Grade</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DIFFICULTY_TIERS).map(([key, data]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDifficulty(key)}
                      className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide border transition-all ${difficulty === key ? `${diffStyles[key]} ring-1 ring-white/50` : 'border-slate-700 text-slate-500 hover:border-slate-500'}`}
                    >
                      {data.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tags</label>
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 focus-within:border-indigo-500 transition-all">
                  <AnimatePresence>
                    {tags.map(tag => (
                      <motion.span key={tag} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium border ${getTagClass(tag)}`}>
                        {tag} <button type="button" onClick={() => removeTag(tag)} className="ml-1"><X size={10} /></button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input type="text" value={currentTagInput} onChange={(e) => setCurrentTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder={tags.length===0?"Type & Enter...":""} className="min-w-[100px] flex-1 bg-transparent text-sm text-slate-300 outline-none" />
                </div>
                {/* ✅ DISPLAY KNOWN TAGS (From Personal Cultivation) */}
                {suggestedTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <p className="text-[10px] text-slate-500 w-full">Known from Personal Cultivation:</p>
                    {suggestedTags.map(tag => (
                      <button 
                        key={tag} 
                        type="button" 
                        onClick={() => addTag(tag)} 
                        className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] border opacity-70 hover:opacity-100 transition-opacity ${getTagClass(tag)}`}
                      >
                        <PlusCircle size={10}/> {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={!title.trim()} className="rounded-lg bg-indigo-600 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2">
                  <Save size={14}/> {initialData ? 'Update Target' : 'Set Target'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}