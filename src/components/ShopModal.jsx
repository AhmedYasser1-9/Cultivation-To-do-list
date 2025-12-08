import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, X, Gem, Check, Palette, Beaker, Image as ImageIcon, MousePointer, Layout, ChevronDown, ChevronUp } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'

export default function ShopModal({ isOpen, onClose }) {
  const { shopItems, inventory, spiritStones, buyItem, showToast } = useCultivation()
  const [expandedSections, setExpandedSections] = useState({
    alchemy: true,
    appearance: true,
    backgrounds: true,
    cursors: true,
    skins: true
  })
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Organize items by category
  const alchemyItems = (shopItems || []).filter(item => item.category === 'consumable')
  const backgrounds = (shopItems || []).filter(item => item.category === 'cosmetic' && item.type === 'background')
  const cursors = (shopItems || []).filter(item => item.category === 'cosmetic' && item.type === 'cursor')
  const skins = (shopItems || []).filter(item => item.category === 'cosmetic' && item.type === 'card_skin')

  // ✅ تجميع inventory حسب item_id لحساب الكمية الإجمالية
  const getItemQuantity = (itemId) => {
    return inventory
      .filter(inv => inv.item_id === itemId)
      .reduce((sum, inv) => sum + (inv.quantity ?? 0), 0)
  }

  const renderItemCard = (item, isOwned, canAfford) => {
    return (
      <div key={item.id} className={`relative p-4 rounded-2xl border flex flex-col gap-3 transition-all group hover:border-slate-600 ${isOwned ? 'bg-slate-950/50 border-slate-700' : 'bg-slate-950 border-slate-800'}`}>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-slate-200">{item.name}</h3>
          {isOwned && (
            <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
              <Check size={12} strokeWidth={3}/> 
              Owned {item.category !== 'cosmetic' && <span className="text-white">×{getItemQuantity(item.id)}</span>}
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

            {/* Content with Sections */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900 space-y-6">
              {/* Alchemy Section */}
              <div className="space-y-3">
                <button 
                  onClick={() => toggleSection('alchemy')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Beaker size={20} className="text-emerald-400" />
                    <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Alchemy (الحبوب والجرعات)</h3>
                    <span className="text-xs text-emerald-400/70">({alchemyItems.length})</span>
                  </div>
                  {expandedSections.alchemy ? <ChevronUp size={18} className="text-emerald-400" /> : <ChevronDown size={18} className="text-emerald-400" />}
                </button>
                {expandedSections.alchemy && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                    {alchemyItems.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-slate-600 text-xs">No alchemy items available</div>
                    ) : (
                      alchemyItems.map(item => {
                        const totalQuantity = getItemQuantity(item.id)
                        const isOwned = totalQuantity > 0
                        const canAfford = spiritStones >= item.price
                        return renderItemCard(item, isOwned, canAfford)
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Appearance Section */}
              <div className="space-y-3">
                <button 
                  onClick={() => toggleSection('appearance')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Palette size={20} className="text-amber-400" />
                    <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Appearance (المظاهر)</h3>
                  </div>
                  {expandedSections.appearance ? <ChevronUp size={18} className="text-amber-400" /> : <ChevronDown size={18} className="text-amber-400" />}
                </button>
                
                {expandedSections.appearance && (
                  <div className="space-y-4 pl-4">
                    {/* Backgrounds Subsection */}
                    <div className="space-y-2">
                      <button 
                        onClick={() => toggleSection('backgrounds')}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <ImageIcon size={16} className="text-amber-300" />
                          <span className="text-xs font-bold text-amber-200">Backgrounds (الخلفيات)</span>
                          <span className="text-xs text-amber-300/70">({backgrounds.length})</span>
                        </div>
                        {expandedSections.backgrounds ? <ChevronUp size={14} className="text-amber-300" /> : <ChevronDown size={14} className="text-amber-300" />}
                      </button>
                      {expandedSections.backgrounds && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                          {backgrounds.length === 0 ? (
                            <div className="col-span-full text-center py-4 text-slate-600 text-xs">No backgrounds available</div>
                          ) : (
                            backgrounds.map(item => {
                              const totalQuantity = getItemQuantity(item.id)
                              const isOwned = totalQuantity > 0
                              const canAfford = spiritStones >= item.price
                              return renderItemCard(item, isOwned, canAfford)
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cursors Subsection */}
                    <div className="space-y-2">
                      <button 
                        onClick={() => toggleSection('cursors')}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <MousePointer size={16} className="text-amber-300" />
                          <span className="text-xs font-bold text-amber-200">Cursor Effects (مؤثرات الماوس)</span>
                          <span className="text-xs text-amber-300/70">({cursors.length})</span>
                        </div>
                        {expandedSections.cursors ? <ChevronUp size={14} className="text-amber-300" /> : <ChevronDown size={14} className="text-amber-300" />}
                      </button>
                      {expandedSections.cursors && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                          {cursors.length === 0 ? (
                            <div className="col-span-full text-center py-4 text-slate-600 text-xs">No cursors available</div>
                          ) : (
                            cursors.map(item => {
                              const totalQuantity = getItemQuantity(item.id)
                              const isOwned = totalQuantity > 0
                              const canAfford = spiritStones >= item.price
                              return renderItemCard(item, isOwned, canAfford)
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* Skins Subsection */}
                    <div className="space-y-2">
                      <button 
                        onClick={() => toggleSection('skins')}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Layout size={16} className="text-amber-300" />
                          <span className="text-xs font-bold text-amber-200">Card Skins (أشكال البطاقات)</span>
                          <span className="text-xs text-amber-300/70">({skins.length})</span>
                        </div>
                        {expandedSections.skins ? <ChevronUp size={14} className="text-amber-300" /> : <ChevronDown size={14} className="text-amber-300" />}
                      </button>
                      {expandedSections.skins && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                          {skins.length === 0 ? (
                            <div className="col-span-full text-center py-4 text-slate-600 text-xs">No skins available</div>
                          ) : (
                            skins.map(item => {
                              const totalQuantity = getItemQuantity(item.id)
                              const isOwned = totalQuantity > 0
                              const canAfford = spiritStones >= item.price
                              return renderItemCard(item, isOwned, canAfford)
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
