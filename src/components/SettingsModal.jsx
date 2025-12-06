import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Download, Upload, Trash2, Settings, Save, AlertTriangle, LogOut } from 'lucide-react'
import ConfirmModal from './ConfirmModal.jsx' // ✅ Import Custom Modal

export default function SettingsModal({ isOpen, onClose, onHardReset, onExit }) {
  const fileInputRef = useRef(null)
  const [confirmResetOpen, setConfirmResetOpen] = useState(false) // State for custom modal

  const handleExport = () => {
    const data = {
      cultivationState: localStorage.getItem('cultivationState'),
      cultivationTasks: localStorage.getItem('cultivationTasks'),
      cultivationTagColors: localStorage.getItem('cultivationTagColors')
    }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cultivation-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.cultivationState) localStorage.setItem('cultivationState', data.cultivationState)
        if (data.cultivationTasks) localStorage.setItem('cultivationTasks', data.cultivationTasks)
        if (data.cultivationTagColors) localStorage.setItem('cultivationTagColors', data.cultivationTagColors)
        alert("Soul Memory Restored Successfully! Reloading...")
        window.location.reload()
      } catch (err) { alert("Corrupted Scripture!") }
    }
    reader.readAsText(file)
  }

  // Trigger the custom modal instead of window.confirm
  const requestHardReset = () => {
    setConfirmResetOpen(true)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        >
          <motion.div 
            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-slate-800 bg-slate-800/50 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2"><Settings size={20}/> Sect Settings</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Soul Archive</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleExport} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all group">
                    <Download size={24} className="text-emerald-500 group-hover:scale-110 transition-transform"/>
                    <span className="text-xs font-bold text-slate-300">Backup</span>
                  </button>
                  <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-amber-500/50 transition-all group">
                    <Upload size={24} className="text-amber-500 group-hover:scale-110 transition-transform"/>
                    <span className="text-xs font-bold text-slate-300">Restore</span>
                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                {onExit && (
                  <button 
                    onClick={onExit}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-xs font-bold uppercase tracking-wide"
                  >
                    <LogOut size={16} /> Exit
                  </button>
                )}
                <button 
                  onClick={requestHardReset} // ✅ New Handler
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-900/30 bg-red-950/10 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-wide"
                >
                  <Trash2 size={16} /> Wipe All Progress
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ✅ Internal Confirm Modal */}
      <ConfirmModal 
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={onHardReset}
        title="Destroy Cultivation?"
        message="This will permanently erase all realms, tasks, and history. This action is irreversible."
        confirmText="Yes, Wipe Everything"
        isDanger={true}
      />
    </AnimatePresence>
  )
}