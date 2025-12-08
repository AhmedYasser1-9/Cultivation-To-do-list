import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Download, Upload, Trash2, Settings, LogOut, Palette, Image as ImageIcon, MousePointer, Layout, Check } from 'lucide-react'
import ConfirmModal from './ConfirmModal.jsx'
import { useCultivation } from '../context/CultivationContext.jsx'

export default function SettingsModal({ isOpen, onClose, onHardReset, onExit }) {
  const { inventory, shopItems, equipItem, activeBgImage, activeCursor, activeCardSkin } = useCultivation()
  const fileInputRef = useRef(null)
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('general') // 'general' | 'appearance'

  const handleExport = () => {
    const data = {
      cultivation_profile: localStorage.getItem('cultivation_profile'),
      cultivation_tasks: localStorage.getItem('cultivation_tasks'),
      cultivation_targets: localStorage.getItem('cultivation_targets'),
      cultivation_inventory: localStorage.getItem('cultivation_inventory'),
      cultivation_tag_colors: localStorage.getItem('cultivation_tag_colors') // Fixed key name based on context
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
        if (data.cultivation_profile) localStorage.setItem('cultivation_profile', data.cultivation_profile)
        if (data.cultivation_tasks) localStorage.setItem('cultivation_tasks', data.cultivation_tasks)
        if (data.cultivation_targets) localStorage.setItem('cultivation_targets', data.cultivation_targets)
        if (data.cultivation_inventory) localStorage.setItem('cultivation_inventory', data.cultivation_inventory)
        if (data.cultivation_tag_colors) localStorage.setItem('cultivation_tag_colors', data.cultivation_tag_colors)
        alert("Soul Memory Restored Successfully! Reloading...")
        window.location.reload()
      } catch (err) { alert("Corrupted Scripture!") }
    }
    reader.readAsText(file)
  }

  const requestHardReset = () => {
    setConfirmResetOpen(true)
  }

  const getOwnedItems = (type) => {
    return inventory
      .map(inv => {
        const shopItem = shopItems.find(s => s.id === inv.item_id)
        if (shopItem && shopItem.category === 'cosmetic' && shopItem.type === type && shopItem.metadata) {
          return { ...inv, shopItem }
        }
        return null
      })
      .filter(Boolean)
  }

  const backgrounds = getOwnedItems('background')
  const cursors = getOwnedItems('cursor')
  const skins = getOwnedItems('card_skin')

  const isEquipped = (type, metadata) => {
      if (!metadata) return false
      if (type === 'background') return activeBgImage === metadata.url
      if (type === 'cursor') return activeCursor === metadata.style
      if (type === 'card_skin') return activeCardSkin?.id === metadata.id
      return false
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        >
          <motion.div 
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-800/50 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2"><Settings size={20}/> Sect Settings</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/50">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'general' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    General
                </button>
                <button 
                    onClick={() => setActiveTab('appearance')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'appearance' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Appearance
                </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {activeTab === 'general' ? (
                <div className="space-y-6">
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
                      onClick={requestHardReset}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-900/30 bg-red-950/10 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-wide"
                    >
                      <Trash2 size={16} /> Wipe All Progress
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                    {/* Backgrounds */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-400">
                            <ImageIcon size={16} />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Backgrounds</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <button 
                                onClick={() => equipItem({ id: 'default', item_id: 'default' }, 'background')} // Hacky way to reset? Actually Context doesn't support unequip easily, but let's assume one must be active. 
                                className={`relative aspect-video rounded-lg border overflow-hidden flex items-center justify-center bg-slate-950 transition-all ${!activeBgImage ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                            >
                                <span className="text-xs font-bold text-slate-500">Default</span>
                                {!activeBgImage && <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 p-1 rounded-full"><Check size={10} strokeWidth={4}/></div>}
                            </button>
                            {backgrounds.map(item => {
                                const url = item.shopItem.metadata?.url || ''
                                const isActive = activeBgImage === url
                                if (!url) return null
                                return (
                                    <button 
                                        key={item.id}
                                        onClick={() => equipItem(item, 'background')}
                                        className={`relative aspect-video rounded-lg border overflow-hidden bg-cover bg-center transition-all ${isActive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                                        style={{ backgroundImage: url.includes('url') ? url : `url(${url})` }}
                                    >
                                        <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors" />
                                        <span className="relative z-10 text-xs font-bold text-white shadow-black drop-shadow-md">{item.shopItem.name}</span>
                                        {isActive && <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 p-1 rounded-full z-10"><Check size={10} strokeWidth={4}/></div>}
                                    </button>
                                )
                            })}
                        </div>
                        {backgrounds.length === 0 && <p className="text-xs text-slate-600 italic">No backgrounds acquired.</p>}
                    </div>

                    {/* Cursors */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-400">
                            <MousePointer size={16} />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Cursors</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                onClick={() => equipItem({ id: 'default', item_id: 'default' }, 'cursor')} 
                                className={`relative p-4 rounded-lg border flex flex-col items-center justify-center gap-2 bg-slate-900 transition-all ${!activeCursor ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                            >
                                <MousePointer size={20} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-500">Default</span>
                                {!activeCursor && <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 p-1 rounded-full"><Check size={8} strokeWidth={4}/></div>}
                            </button>
                            {cursors.map(item => {
                                const style = item.shopItem.metadata?.style || ''
                                const isActive = activeCursor === style
                                return (
                                    <button 
                                        key={item.id}
                                        onClick={() => equipItem(item, 'cursor')}
                                        className={`relative p-4 rounded-lg border flex flex-col items-center justify-center gap-2 bg-slate-900 transition-all ${isActive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                                    >
                                        <span className="text-2xl">{item.shopItem.metadata?.preview || '🖱️'}</span>
                                        <span className="text-xs font-bold text-slate-300">{item.shopItem.name}</span>
                                        {isActive && <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 p-1 rounded-full"><Check size={8} strokeWidth={4}/></div>}
                                    </button>
                                )
                            })}
                        </div>
                        {cursors.length === 0 && <p className="text-xs text-slate-600 italic">No cursors acquired.</p>}
                    </div>

                    {/* Skins */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Layout size={16} />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Card Skins</h3>
                        </div>
                         <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => equipItem({ id: 'default', item_id: 'default' }, 'card_skin')} 
                                className={`relative p-6 rounded-lg border flex items-center justify-center bg-slate-900 transition-all ${!activeCardSkin ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                            >
                                <span className="text-xs font-bold text-slate-500">Default Jade</span>
                                {!activeCardSkin && <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 p-1 rounded-full"><Check size={10} strokeWidth={4}/></div>}
                            </button>
                            {skins.map(item => {
                                // Skins logic might be complex to preview, just name for now
                                const id = item.shopItem.metadata?.id
                                const isActive = activeCardSkin?.id === id
                                return (
                                    <button 
                                        key={item.id}
                                        onClick={() => equipItem(item, 'card_skin')}
                                        className={`relative p-6 rounded-lg border flex items-center justify-center bg-slate-900 transition-all ${isActive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                                    >
                                        <span className="text-xs font-bold text-amber-200">{item.shopItem.name}</span>
                                        {isActive && <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 p-1 rounded-full"><Check size={10} strokeWidth={4}/></div>}
                                    </button>
                                )
                            })}
                        </div>
                        {skins.length === 0 && <p className="text-xs text-slate-600 italic">No skins acquired.</p>}
                    </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Internal Confirm Modal */}
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