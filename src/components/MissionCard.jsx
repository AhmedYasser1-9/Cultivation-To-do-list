import { motion } from 'framer-motion'
import { Trash2, Check } from 'lucide-react'

// ألوان شارات الصعوبة
const difficultyConfig = {
  Low: { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  Medium: { color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' },
  High: { color: 'text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-500/10' },
  Extreme: { color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
}

export default function MissionCard({ task, onToggle, onDelete }) {
  const { id, title, difficulty, isCompleted, tags = [] } = task
  const style = difficultyConfig[difficulty] || difficultyConfig.Low

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group relative flex items-center gap-4 rounded-xl border border-white/5 bg-slate-900/40 p-4 transition-all duration-300 hover:border-amber-500/30 hover:bg-slate-800/60 ${isCompleted ? 'opacity-60' : 'opacity-100'}`}
    >
      {/* Checkbox Button - رفعنا الطبقة لضمان الضغط */}
      <button
        onClick={() => onToggle(id)}
        className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
          isCompleted
            ? 'border-amber-500 bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
            : 'border-slate-600 bg-slate-950/50 hover:border-amber-400/50'
        }`}
      >
        {isCompleted && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Task Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium transition-all ${isCompleted ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-100'}`}>
            {title}
          </span>
          
          {/* Difficulty Badge */}
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.border} ${style.bg} ${style.color}`}>
            {difficulty}
          </span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Delete Button - زر الحذف */}
      <button
        onClick={() => onDelete(id)}
        className="relative z-10 rounded-lg p-2 text-slate-500 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
        title="Destroy Record"
      >
        <Trash2 size={16} />
      </button>

      {/* Hover Glow Effect (Decoration) */}
      <div className="pointer-events-none absolute inset-0 -z-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.article>
  )
}