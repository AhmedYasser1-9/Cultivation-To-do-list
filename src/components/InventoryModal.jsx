import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Package, X, Check, Beaker, Palette, Sparkles, Clock, AlertTriangle, Image as ImageIcon, MousePointer, Layout, ChevronDown, ChevronUp } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'

// ⏳ Duration Based Items (Show Extend / Countdown)
const DURATION_ITEMS = ['Spirit Gathering Array', 'Focus Incense', 'Essence Liquid']

export default function InventoryModal({ isOpen, onClose }) {
  const { inventory, shopItems, equipItem, unequipItem, consumeItem, session, showToast } = useCultivation()
  const [expandedSections, setExpandedSections] = useState({
    alchemy: true,
    appearance: true,
    backgrounds: true,
    cursors: true,
    skins: true
  })
  const [processing, setProcessing] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState({})

  // ✅ Timer Logic for Active Duration Items
  useEffect(() => {
    if (!isOpen || !session?.user?.id) return

    const updateTimers = () => {
      const newTimeRemaining = {}
      
      inventory.forEach(item => {
        if (item.is_active && DURATION_ITEMS.includes(shopItems.find(s => s.id === item.item_id)?.name)) {
          const expiryTime = item.expires_at
          if (expiryTime) {
            const now = new Date()
            const expiry = new Date(expiryTime)
            const diff = expiry - now
            
            if (diff > 0) {
              const hours = Math.floor(diff / (1000 * 60 * 60))
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
              newTimeRemaining[item.id] = `${hours}h ${minutes}m`
            } else {
              newTimeRemaining[item.id] = "Expired"
            }
          }
        }
      })
      setTimeRemaining(newTimeRemaining)
    }

    updateTimers()
    const interval = setInterval(updateTimers, 60000)
    return () => clearInterval(interval)
  }, [isOpen, inventory, shopItems, session?.user?.id])

  const getInventoryWithDetails = () => {
    const grouped = {}
    inventory.forEach(invItem => {
      const shopItem = shopItems.find(s => s.id === invItem.item_id)
      if (!shopItem) return
      const key = invItem.item_id
      if (!grouped[key]) {
        grouped[key] = {
          item_id: invItem.item_id,
          shopItem,
          quantity: 0,
          is_active: false,
          ids: [] 
        }
      }
      grouped[key].quantity += (invItem.quantity ?? 0)
      if (invItem.is_active) grouped[key].is_active = true
      grouped[key].ids.push(invItem.id)
    })
    return Object.values(grouped)
  }

  const inventoryWithDetails = getInventoryWithDetails()
  
  // Organize by category
  const alchemyItems = inventoryWithDetails.filter(item => item.shopItem?.category === 'consumable' && (item.quantity > 0 || item.is_active))
  const backgrounds = inventoryWithDetails.filter(item => item.shopItem?.category === 'cosmetic' && item.shopItem?.type === 'background' && (item.quantity > 0 || item.is_active))
  const cursors = inventoryWithDetails.filter(item => item.shopItem?.category === 'cosmetic' && item.shopItem?.type === 'cursor' && (item.quantity > 0 || item.is_active))
  const skins = inventoryWithDetails.filter(item => item.shopItem?.category === 'cosmetic' && item.shopItem?.type === 'card_skin' && (item.quantity > 0 || item.is_active))

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleEquip = async (item) => {
    const invItem = { id: item.ids[0], item_id: item.item_id }
    setProcessing(item.item_id)
    await equipItem(invItem, item.shopItem.type)
    setProcessing(null)
  }

  const handleUnequip = async (itemType) => {
    setProcessing(itemType)
    await unequipItem(itemType)
    setProcessing(null)
  }

  const handleConsume = async (item) => {
    const activeId = item.ids.find(id => {
       const inv = inventory.find(i => i.id === id)
       return inv && inv.is_active
    })

    const availableId = item.ids.find(id => {
        const inv = inventory.find(i => i.id === id)
        return inv && inv.quantity > 0
    })
    
    const targetId = availableId || item.ids[0]
    const realInvItem = inventory.find(i => i.id === targetId)

    if (!realInvItem) {
      setConfirming(null)
      return
    }
    
    setProcessing(item.item_id)
    const res = await consumeItem(realInvItem, item.shopItem)
    if (!res.success) {
      showToast(res.msg, 'error')
    } else {
      showToast(res.msg, 'success')
    }
    setProcessing(null)
    setConfirming(null)
  }

  const renderItemCard = (item) => {
    const isConsumable = item.shopItem.category === 'consumable'
    const isDurationItem = DURATION_ITEMS.includes(item.shopItem.name)
    const activeId = item.ids.find(id => timeRemaining[id])
    const timeLeft = activeId ? timeRemaining[activeId] : null
    const isConfirming = confirming === item.item_id

    return (
      <div key={item.item_id} className={`relative p-4 rounded-2xl border flex flex-col gap-3 transition-all ${item.is_active ? 'bg-amber-900/10 border-amber-500/50 shadow-lg shadow-amber-900/10' : 'bg-slate-950 border-slate-800'}`}>
        {item.is_active && (
          <div className="absolute -top-1 -right-1 flex items-center gap-2">
             {isDurationItem && timeLeft && (
               <div className="flex items-center gap-1 bg-slate-900 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 shadow-md">
                 <Clock size={10} />
                 <span className="text-[10px] font-mono font-bold">{timeLeft}</span>
               </div>
             )}
             <div className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/50 border-2 border-slate-900">
               <Check size={12} strokeWidth={3}/> 
               <span className="text-xs font-bold">ACTIVE</span>
             </div>
          </div>
        )}

        <div className="flex justify-between items-start mt-2">
          <h3 className={`font-bold text-sm ${item.is_active ? 'text-amber-200' : 'text-slate-200'}`}>{item.shopItem.name}</h3>
        </div>
        <p className="text-xs text-slate-500 flex-1 line-clamp-2">{item.shopItem.description}</p>

        {isConsumable && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg w-fit">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-emerald-300 font-bold text-sm">×{item.quantity}</span>
          </div>
        )}
        
        <div className="mt-auto pt-3">
          {isConsumable ? (
            isConfirming ? (
              <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                 <button onClick={() => setConfirming(null)} className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 text-xs font-bold uppercase">Cancel</button>
                 <button onClick={() => handleConsume(item)} className="flex-[2] py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase shadow-lg">Confirm</button>
              </div>
            ) : (
              <button 
                onClick={() => setConfirming(item.item_id)}
                disabled={processing === item.item_id || item.quantity <= 0}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                  processing === item.item_id ? 'bg-slate-700 text-slate-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {item.is_active && isDurationItem ? (
                  <>Extend (+24h)</>
                ) : (
                  <>Consume</>
                )}
              </button>
            )
          ) : (
            <button 
              onClick={() => handleEquip(item)}
              disabled={item.is_active || processing === item.item_id}
              className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${item.is_active ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {item.is_active ? 'Equipped' : 'Equip'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4" 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        >
          <motion.div 
            className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" 
            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
          >
            <div className="bg-slate-800/80 px-6 py-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <Package className="text-amber-400" size={24} />
                <h2 className="text-xl font-bold text-amber-100 uppercase tracking-widest">Spirit Inventory</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 transition-colors"><X className="text-slate-500 hover:text-white" size={20} /></button>
            </div>

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
                      <div className="col-span-full text-center py-8 text-slate-600 text-xs">No alchemy items</div>
                    ) : (
                      alchemyItems.map(item => renderItemCard(item))
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
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <ImageIcon size={16} className="text-amber-300" />
                          <span className="text-xs font-bold text-amber-200">Backgrounds (الخلفيات)</span>
                          <span className="text-xs text-amber-300/70">({backgrounds.length})</span>
                        </div>
                        <button
                          onClick={() => toggleSection('backgrounds')}
                          className="text-amber-300 hover:text-amber-200 transition-colors"
                        >
                          {expandedSections.backgrounds ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      {expandedSections.backgrounds && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                          {backgrounds.length === 0 ? (
                            <div className="col-span-full text-center py-4 text-slate-600 text-xs">No backgrounds</div>
                          ) : (
                            backgrounds.map(item => renderItemCard(item))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cursors Subsection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <MousePointer size={16} className="text-amber-300" />
                          <span className="text-xs font-bold text-amber-200">Cursor Effects (مؤثرات الماوس)</span>
                          <span className="text-xs text-amber-300/70">({cursors.length})</span>
                        </div>
                        <button
                          onClick={() => toggleSection('cursors')}
                          className="text-amber-300 hover:text-amber-200 transition-colors"
                        >
                          {expandedSections.cursors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      {expandedSections.cursors && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                          {cursors.length === 0 ? (
                            <div className="col-span-full text-center py-4 text-slate-600 text-xs">No cursors</div>
                          ) : (
                            cursors.map(item => renderItemCard(item))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Skins Subsection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <Layout size={16} className="text-amber-300" />
                          <span className="text-xs font-bold text-amber-200">Card Skins (أشكال البطاقات)</span>
                          <span className="text-xs text-amber-300/70">({skins.length})</span>
                        </div>
                        <button
                          onClick={() => toggleSection('skins')}
                          className="text-amber-300 hover:text-amber-200 transition-colors"
                        >
                          {expandedSections.skins ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      {expandedSections.skins && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                          {skins.length === 0 ? (
                            <div className="col-span-full text-center py-4 text-slate-600 text-xs">No skins</div>
                          ) : (
                            skins.map(item => renderItemCard(item))
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
