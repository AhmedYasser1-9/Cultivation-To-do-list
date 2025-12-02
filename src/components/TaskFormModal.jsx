import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Tag as TagIcon, PlusCircle } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext'
import { DIFFICULTY_TIERS } from '../context/CultivationContext' // استدعاء الثوابت

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
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash % TAG_COLORS.length)]
}

export default function TaskFormModal({ isOpen, onClose, onSubmit }) {
  const { knownTags } = useCultivation()
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('low')
  const [tags, setTags] = useState([])
  const [currentTagInput, setCurrentTagInput] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDifficulty('low')
      setTags([])
      setCurrentTagInput('')
    }
  }, [isOpen])

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
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const finalTags = [...tags]
    if (currentTagInput.trim() && !finalTags.includes(currentTagInput.trim())) finalTags.push(currentTagInput.trim())
    onSubmit({ title: trimmedTitle, difficulty, tags: finalTags })
    onClose()
  }

  const suggestedTags = knownTags.filter(t => !tags.includes(t))

  // ألوان الـ 7 مستويات
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
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900 shadow-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-amber-500/20 bg-slate-800/50 px-6 py-4">
              <h2 className="text-lg font-bold uppercase tracking-widest text-amber-100">Issue New Mandate</h2>
            </div>
            <form onSubmit={handleConfirm} className="space-y-6 px-6 py-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mission Objective</label>
                <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Deep Work Session" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-emerald-50 outline-none focus:border-amber-400 transition-all" />
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
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 focus-within:border-emerald-500 transition-all">
                  <AnimatePresence>
                    {tags.map(tag => (
                      <motion.span key={tag} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium border ${getTagColor(tag)}`}>
                        {tag} <button type="button" onClick={() => removeTag(tag)} className="ml-1"><X size={10} /></button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input type="text" value={currentTagInput} onChange={(e) => setCurrentTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder={tags.length===0?"Type & Enter...":""} className="min-w-[100px] flex-1 bg-transparent text-sm text-slate-300 outline-none" />
                </div>
                {suggestedTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <p className="text-[10px] text-slate-500 w-full">Known:</p>
                    {suggestedTags.map(tag => <button key={tag} type="button" onClick={() => addTag(tag)} className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] border opacity-60 hover:opacity-100 ${getTagColor(tag)}`}><PlusCircle size={10}/> {tag}</button>)}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800">Retreat</button>
                <button type="submit" disabled={!title.trim()} className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50">Confirm</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}