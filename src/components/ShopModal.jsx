import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, X, Gem, Check, Palette, Beaker } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'

export default function ShopModal({ isOpen, onClose }) {
  const { shopItems, inventory, spiritStones, buyItem } = useCultivation()
  const [activeTab, setActiveTab] = useState('cosmetic') // 'cosmetic' | 'consumable'
  const [processing, setProcessing] = useState(null)

  const handleBuy = async (item) => {
    setProcessing(item.id)
    const res = await buyItem(item)
    if (!res.success) alert(res.msg)
    setProcessing(null)
  }

  const filteredItems = (shopItems || []).filter(item => item.category === activeTab)

  // ✅ تجميع inventory حسب item_id لحساب الكمية الإجمالية
  const getItemQuantity = (itemId) => {
    return inventory
      .filter(inv => inv.item_id === itemId)
      .reduce((sum, inv) => sum + (inv.quantity || 1), 0)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
            
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
            <div className="flex gap-4 p-4 border-b border-slate-800">
              <button onClick={() => setActiveTab('cosmetic')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'cosmetic' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-500 hover:text-slate-300'}`}>
                <Palette size={16}/> Appearance
              </button>
              <button onClick={() => setActiveTab('consumable')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'consumable' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-slate-500 hover:text-slate-300'}`}>
                <Beaker size={16}/> Alchemy
              </button>
            </div>

            {/* Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar flex-1">
              {filteredItems.map(item => {
                const totalQuantity = getItemQuantity(item.id)
                const isOwned = totalQuantity > 0
                const canAfford = spiritStones >= item.price

                return (
                  <div key={item.id} className={`relative p-4 rounded-2xl border flex flex-col gap-3 transition-all ${isOwned ? 'bg-slate-950/50 border-slate-700' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-200">{item.name}</h3>
                      {/* ✅ 2. إزالة زر USE - فقط عرض "Owned" مع الكمية */}
                      {isOwned && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1">
                          <Check size={10}/> Owned ({totalQuantity})
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-500 flex-1">{item.description}</p>
                    
                    <div className="mt-auto">
                      {/* ✅ شرط الشراء: 
                          - لو consumable: اشتري براحتك (Purchase)
                          - لو cosmetic: اشتري مرة واحدة (Purchase / Already Owned)
                      */}
                      {item.category === 'consumable' ? (
                        <button 
                          onClick={() => handleBuy(item)}
                          disabled={!canAfford || processing === item.id}
                          className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${canAfford ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                        >
                          {canAfford ? 'Purchase' : 'Unaffordable'} 
                          <span className={canAfford ? 'text-emerald-100' : 'text-slate-600'}>({item.price})</span>
                        </button>
                      ) : (
                        !isOwned ? (
                          <button 
                            onClick={() => handleBuy(item)}
                            disabled={!canAfford || processing === item.id}
                            className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${canAfford ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                          >
                            {canAfford ? 'Purchase' : 'Unaffordable'} 
                            <span className={canAfford ? 'text-emerald-100' : 'text-slate-600'}>({item.price})</span>
                          </button>
                        ) : (
                          <div className="w-full py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider text-center cursor-default border border-slate-700">
                            Already Owned
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
