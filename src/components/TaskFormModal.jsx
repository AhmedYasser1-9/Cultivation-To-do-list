import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, PlusCircle, Repeat, Save, PenSquare, Feather, List, Calendar, AlignLeft, Trash2, CheckSquare } from 'lucide-react'
import { useCultivation, DIFFICULTY_TIERS } from '../context/CultivationContext'

const TAG_COLORS = [
  'bg-red-500/10 text-red-400 border-red-500/50',
  'bg-orange-500/10 text-orange-400 border-orange-500/50',
  'bg-amber-500/10 text-amber-400 border-amber-500/50',
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/50',
  'bg-cyan-500/10 text-cyan-400 border-cyan-500/50',
  'bg-blue-500/10 text-blue-400 border-blue-500/50',
  'bg-violet-500/10 text-violet-400 border-violet-500/50',
  'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/50',
  'bg-pink-500/10 text-pink-400 border-pink-500/50',
  'bg-lime-500/10 text-lime-400 border-lime-500/50',
]

const DAYS_OF_WEEK = [
  { id: 0, label: 'S', name: 'Sunday' },
  { id: 1, label: 'M', name: 'Monday' },
  { id: 2, label: 'T', name: 'Tuesday' },
  { id: 3, label: 'W', name: 'Wednesday' },
  { id: 4, label: 'T', name: 'Thursday' },
  { id: 5, label: 'F', name: 'Friday' },
  { id: 6, label: 'S', name: 'Saturday' },
]

const getTagColor = (text) => {
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash % TAG_COLORS.length)]
}

export default function TaskFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const { knownTags } = useCultivation()
  const [activeTab, setActiveTab] = useState('basics') // 'basics' | 'details' | 'schedule'
  
  // Basic Fields
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('low')
  const [tags, setTags] = useState([])
  const [currentTagInput, setCurrentTagInput] = useState('')
  const [isTrivial, setIsTrivial] = useState(false)

  // Details Fields (Deep Inscriptions)
  const [notes, setNotes] = useState('')
  const [subtasks, setSubtasks] = useState([])
  const [newSubtask, setNewSubtask] = useState('')

  // Schedule Fields (Flexible Reincarnation)
  const [repeatType, setRepeatType] = useState('once') // 'once' | 'daily' | 'custom'
  const [selectedDays, setSelectedDays] = useState([])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title)
        setDifficulty(initialData.difficulty)
        setTags(initialData.tags || [])
        setIsTrivial(initialData.isTrivial || false)
        setNotes(initialData.notes || '')
        setSubtasks(initialData.subtasks || [])
        
        // Handle Legacy Repeat Logic
        if (initialData.repeat === 'daily') {
          setRepeatType('daily')
          setSelectedDays([])
        } else if (initialData.repeat === 'custom') {
          setRepeatType('custom')
          setSelectedDays(initialData.repeatDays || [])
        } else {
          setRepeatType('once')
          setSelectedDays([])
        }
      } else {
        // Reset All
        setTitle('')
        setDifficulty('low')
        setTags([])
        setCurrentTagInput('')
        setIsTrivial(false)
        setNotes('')
        setSubtasks([])
        setNewSubtask('')
        setRepeatType('once')
        setSelectedDays([])
      }
      setActiveTab('basics')
    }
  }, [isOpen, initialData])

  // --- Tag Handlers ---
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(currentTagInput) }
    else if (e.key === 'Backspace' && !currentTagInput && tags.length > 0) { setTags(tags.slice(0, -1)) }
  }
  const addTag = (tagText) => {
    const trimmed = tagText.trim()
    if (trimmed && !tags.includes(trimmed)) { setTags([...tags, trimmed]); setCurrentTagInput('') }
  }
  const removeTag = (tagToRemove) => { setTags(tags.filter((t) => t !== tagToRemove)) }

  // --- Subtask Handlers ---
  const addSubtask = () => {
    if (!newSubtask.trim()) return
    setSubtasks([...subtasks, { id: crypto.randomUUID(), text: newSubtask.trim(), completed: false }])
    setNewSubtask('')
  }
  const removeSubtask = (id) => { setSubtasks(subtasks.filter(st => st.id !== id)) }
  const toggleSubtask = (id) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st))
  }

  // --- Schedule Handlers ---
  const toggleDay = (dayId) => {
    setSelectedDays(prev => prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId])
  }

  const handleConfirm = (e) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const finalTags = [...tags]
    if (currentTagInput.trim() && !finalTags.includes(currentTagInput.trim())) finalTags.push(currentTagInput.trim())
    
    onSubmit({ 
      title: trimmedTitle, 
      difficulty, 
      tags: finalTags,
      isTrivial,
      notes,
      subtasks,
      repeat: repeatType,
      repeatDays: repeatType === 'custom' ? selectedDays : []
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
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900 shadow-2xl flex flex-col max-h-[90vh]" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="border-b border-amber-500/20 bg-slate-800/50 px-6 py-4 flex items-center gap-2 flex-shrink-0">
              {initialData ? <PenSquare size={20} className="text-amber-400"/> : <PlusCircle size={20} className="text-amber-400"/>}
              <h2 className="text-lg font-bold uppercase tracking-widest text-amber-100">
                {initialData ? 'Edit Task' : 'New Task'}
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-2 gap-4 flex-shrink-0">
              {[
                { id: 'basics', label: 'Basics', icon: Feather },
                { id: 'details', label: 'Details', icon: AlignLeft },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                    activeTab === tab.id 
                      ? 'text-emerald-400 border-emerald-500' 
                      : 'text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleConfirm} className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              
              {/* === TAB: BASICS === */}
              {activeTab === 'basics' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Title</label>
                    <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Morning Workout" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-emerald-50 outline-none focus:border-amber-400 transition-all" />
                  </div>

                  {/* Trivial Toggle */}
                  <div 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isTrivial ? 'bg-slate-700 border-slate-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`} 
                    onClick={() => setIsTrivial(!isTrivial)}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isTrivial ? 'bg-slate-400 text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                      <Feather size={12} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${isTrivial ? 'text-slate-300' : 'text-slate-400'}`}>Trivial Task</span>
                      <span className="text-[9px] text-slate-500">0 XP Awarded</span>
                    </div>
                  </div>

                  {/* Difficulty */}
                  {!isTrivial && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty</label>
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
                  )}

                  {/* Tags */}
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
                </div>
              )}

              {/* === TAB: DETAILS === */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notes</label>
                    <textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Add detailed instructions, links, or thoughts..."
                      className="w-full h-32 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-amber-400 transition-all resize-none custom-scrollbar"
                    />
                  </div>

                  {/* Subtasks */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Subtasks</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newSubtask} 
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())} 
                        placeholder="Add a step..." 
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300 outline-none focus:border-emerald-500"
                      />
                      <button onClick={addSubtask} type="button" className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 hover:bg-slate-700"><PlusCircle size={18}/></button>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      {subtasks.map(st => (
                        <div key={st.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-950/50 border border-slate-800 group">
                          <button type="button" onClick={() => toggleSubtask(st.id)} className={`text-slate-500 hover:text-emerald-400 ${st.completed ? 'text-emerald-500' : ''}`}>
                            <CheckSquare size={16} />
                          </button>
                          <span className={`flex-1 text-sm ${st.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>{st.text}</span>
                          <button type="button" onClick={() => removeSubtask(st.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {subtasks.length === 0 && <p className="text-xs text-slate-600 text-center py-2">No sub-techniques yet.</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB: SCHEDULE === */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => setRepeatType('once')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${repeatType === 'once' ? 'bg-slate-800 border-slate-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                      <span className="text-xs font-bold uppercase">Once</span>
                    </button>
                    <button type="button" onClick={() => setRepeatType('daily')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${repeatType === 'daily' ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                      <Repeat size={16} />
                      <span className="text-xs font-bold uppercase">Daily</span>
                    </button>
                    <button type="button" onClick={() => setRepeatType('custom')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${repeatType === 'custom' ? 'bg-indigo-900/30 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                      <Calendar size={16} />
                      <span className="text-xs font-bold uppercase">Custom</span>
                    </button>
                  </div>

                  {repeatType === 'custom' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center block">Active Days</label>
                      <div className="flex justify-between gap-1">
                        {DAYS_OF_WEEK.map(day => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                              selectedDays.includes(day.id)
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-900/50'
                                : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-600'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-center text-slate-500 mt-2">Task will reset at 00:00 on selected days.</p>
                    </div>
                  )}
                </div>
              )}

            </form>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 pb-6 px-6 border-t border-slate-800 flex-shrink-0 bg-slate-900">
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800">Cancel</button>
              <button onClick={handleConfirm} disabled={!title.trim()} className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 flex items-center gap-2">
                {initialData ? <Save size={14}/> : <PlusCircle size={14}/>}
                {initialData ? 'Update Task' : 'Save'}
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}