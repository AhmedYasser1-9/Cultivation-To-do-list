import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, X, Gem, Check, Palette, Beaker, Image as ImageIcon, MousePointer, Layout } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'

export default function ShopModal({ isOpen, onClose }) {
  const { shopItems, inventory, spiritStones, buyItem, showToast } = useCultivation()
  const [activeTab, setActiveTab] = useState('cosmetic_bg') // 'cosmetic_bg' | 'cosmetic_skin' | 'cosmetic_cursor' | 'consumable'
  const [processing, setProcessing] = useState(null)

  const handleBuy = async (item) => {
    setProcessing(item.id)
    const res = await buyItem(item)
    if (!res.success) {
      showToast(res.msg, 'error')
    } else {
      showToast(res.msg, 'success')
    }
    setProcessing(null)
  }

  const filteredItems = (shopItems || []).filter(item => {
    if (activeTab === 'consumable') return item.category === 'consumable'
    if (activeTab === 'cosmetic_bg') return item.category === 'cosmetic' && item.type === 'background'
    if (activeTab === 'cosmetic_skin') return item.category === 'cosmetic' && item.type === 'card_skin'
    if (activeTab === 'cosmetic_cursor') return item.category === 'cosmetic' && item.type === 'cursor'
    return false
  })

  // ✅ تجميع inventory حسب item_id لحساب الكمية الإجمالية
  const getItemQuantity = (itemId) => {
    return inventory
      .filter(inv => inv.item_id === itemId)
      .reduce((sum, inv) => sum + (inv.quantity ?? 0), 0)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="bg-slate-800/80 px-6 py-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-amber-400" size={24} />
                <h2 className="text-xl font-bold text-amber-100 uppercase tracking-widest">Spirit Pavilion</h2>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-indigo-500/30">
                <Gem size={16} className="text-indigo-400" />
                <span className="text-sm font-black text-indigo-100">{spiritStones.toLocaleString()}</span>
              </div>
              <button onClick={onClose}><X className="text-slate-500 hover:text-white" /></button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-4 border-b border-slate-800 bg-slate-900/50">
              <button onClick={() => setActiveTab('consumable')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'consumable' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
                <Beaker size={16}/> Alchemy
              </button>
              <div className="w-px h-8 bg-slate-800 mx-2 hidden md:block"></div>
              <button onClick={() => setActiveTab('cosmetic_bg')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'cosmetic_bg' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
                <ImageIcon size={16}/> Backgrounds
              </button>
              <button onClick={() => setActiveTab('cosmetic_skin')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'cosmetic_skin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
                <Layout size={16}/> Skins
              </button>
              <button onClick={() => setActiveTab('cosmetic_cursor')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'cosmetic_cursor' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
                <MousePointer size={16}/> Cursors
              </button>
            </div>

            {/* Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar flex-1 bg-slate-900">
              {filteredItems.length === 0 ? (
                 <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
                    <ShoppingBag size={48} className="opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-wider">No Items Found</p>
                 </div>
              ) : (
                filteredItems.map(item => {
                  const totalQuantity = getItemQuantity(item.id)
                  const isOwned = totalQuantity > 0
                  const canAfford = spiritStones >= item.price

                  return (
                    <div key={item.id} className={`relative p-4 rounded-2xl border flex flex-col gap-3 transition-all group hover:border-slate-600 ${isOwned ? 'bg-slate-950/50 border-slate-700' : 'bg-slate-950 border-slate-800'}`}>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-200">{item.name}</h3>
                        {isOwned && (
                          <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                            <Check size={12} strokeWidth={3}/> 
                            Owned {item.category !== 'cosmetic' && <span className="text-white">×{totalQuantity}</span>}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 flex-1 leading-relaxed">{item.description}</p>
                      
                      <div className="mt-auto pt-3">
                        {item.category === 'consumable' ? (
                          <button 
                            onClick={() => handleBuy(item)}
                            disabled={!canAfford || processing === item.id}
                            className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${canAfford ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                          >
                            {canAfford ? 'Purchase' : 'Unaffordable'} 
                            <span className={canAfford ? 'text-emerald-100' : 'text-slate-600'}>({item.price})</span>
                          </button>
                        ) : (
                          !isOwned ? (
                            <button 
                              onClick={() => handleBuy(item)}
                              disabled={!canAfford || processing === item.id}
                              className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${canAfford ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                            >
                              {canAfford ? 'Purchase' : 'Unaffordable'} 
                              <span className={canAfford ? 'text-emerald-100' : 'text-slate-600'}>({item.price})</span>
                            </button>
                          ) : (
                            <div className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider text-center cursor-default border border-slate-700">
                              Acquired
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
