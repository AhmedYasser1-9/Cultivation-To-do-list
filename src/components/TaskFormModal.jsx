import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Tag as TagIcon, PlusCircle } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext'

const DIFFICULTIES = ['Low', 'Medium', 'High', 'Extreme']

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
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash % TAG_COLORS.length)
  return TAG_COLORS[index]
}

export default function TaskFormModal({ isOpen, onClose, onSubmit }) {
  const { knownTags } = useCultivation() // استدعاء التاجات المحفوظة
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('Low')
  const [tags, setTags] = useState([])
  const [currentTagInput, setCurrentTagInput] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDifficulty('Low')
      setTags([])
      setCurrentTagInput('')
    }
  }, [isOpen])

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(currentTagInput)
    } else if (e.key === 'Backspace' && !currentTagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const addTag = (tagText) => {
    const trimmed = tagText.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setCurrentTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleConfirm = (e) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const finalTags = [...tags]
    if (currentTagInput.trim() && !finalTags.includes(currentTagInput.trim())) {
      finalTags.push(currentTagInput.trim())
    }

    onSubmit({
      title: trimmedTitle,
      difficulty,
      tags: finalTags,
    })
    onClose()
  }

  // تصفية التاجات المحفوظة التي لم يتم اختيارها بعد
  const suggestedTags = knownTags.filter(t => !tags.includes(t))

  const difficultyStyles = {
    Low: 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20 data-[active=true]:bg-emerald-500 data-[active=true]:text-slate-950 data-[active=true]:shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    Medium: 'border-sky-500/50 text-sky-300 hover:bg-sky-500/20 data-[active=true]:bg-sky-500 data-[active=true]:text-slate-950 data-[active=true]:shadow-[0_0_15px_rgba(14,165,233,0.5)]',
    High: 'border-violet-500/50 text-violet-300 hover:bg-violet-500/20 data-[active=true]:bg-violet-500 data-[active=true]:text-slate-950 data-[active=true]:shadow-[0_0_15px_rgba(139,92,246,0.5)]',
    Extreme: 'border-red-500/50 text-red-300 hover:bg-red-500/20 data-[active=true]:bg-red-500 data-[active=true]:text-slate-950 data-[active=true]:shadow-[0_0_15px_rgba(239,68,68,0.5)]',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900 shadow-2xl shadow-amber-900/30"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-amber-500/20 bg-slate-800/50 px-6 py-4">
              <h2 className="text-lg font-bold uppercase tracking-widest text-amber-100">
                Issue New Mandate
              </h2>
              <p className="text-xs text-emerald-400/70">Define the parameters of your cultivation</p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-6 px-6 py-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mission Objective</label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Practice Algorithms for 1 hour"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-emerald-50 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty Grade</label>
                <div className="grid grid-cols-4 gap-2">
                  {DIFFICULTIES.map((level) => (
                    <button
                      key={level}
                      type="button"
                      data-active={difficulty === level}
                      onClick={() => setDifficulty(level)}
                      className={`rounded-lg border px-1 py-2 text-[10px] font-bold uppercase tracking-wide transition-all duration-200 ${difficultyStyles[level]}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tags</label>
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <AnimatePresence>
                    {tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium border ${getTagColor(tag)}`}
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full p-0.5 hover:bg-black/20">
                          <X size={10} />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input
                    type="text"
                    value={currentTagInput}
                    onChange={(e) => setCurrentTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Type & Enter..." : ""}
                    className="min-w-[100px] flex-1 bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600"
                  />
                </div>
                
                {/* Suggested Tags Area */}
                {suggestedTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <p className="w-full text-[10px] text-slate-500">Known Inscriptions:</p>
                    {suggestedTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium border opacity-60 hover:opacity-100 transition-opacity ${getTagColor(tag)}`}
                      >
                        <PlusCircle size={10} /> {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">Retreat</button>
                <button type="submit" disabled={!title.trim()} className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95">Confirm</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}