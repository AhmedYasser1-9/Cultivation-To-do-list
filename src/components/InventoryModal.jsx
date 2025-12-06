import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Package, X, Check, Beaker, Palette, Sparkles } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx'

export default function InventoryModal({ isOpen, onClose }) {
  const { inventory, shopItems, equipItem, consumeItem } = useCultivation()
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'cosmetic' | 'consumable'
  const [processing, setProcessing] = useState(null)

  // ✅ 1. تجميع العناصر المتشابهة حسب item_id ودمج quantity
  const getInventoryWithDetails = () => {
    // تجميع حسب item_id
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
          ids: [] // لحفظ IDs للاستخدام
        }
      }
      
      grouped[key].quantity += (invItem.quantity || 1)
      if (invItem.is_active) grouped[key].is_active = true
      grouped[key].ids.push(invItem.id)
    })
    
    return Object.values(grouped)
  }

  const inventoryWithDetails = getInventoryWithDetails()

  // ✅ Filter by category
  const filteredInventory = activeTab === 'all' 
    ? inventoryWithDetails
    : inventoryWithDetails.filter(item => item.shopItem?.category === activeTab)

  const handleEquip = async (item) => {
    // استخدام أول ID من المجموعة
    const invItem = { id: item.ids[0], item_id: item.item_id }
    setProcessing(item.item_id)
    await equipItem(invItem, item.shopItem.type)
    setProcessing(null)
  }

  const handleConsume = async (item) => {
    // استخدام أول ID من المجموعة
    const invItem = { id: item.ids[0], item_id: item.item_id, quantity: item.quantity }
    setProcessing(item.item_id)
    const res = await consumeItem(invItem, item.shopItem)
    if (!res.success) alert(res.msg)
    setProcessing(null)
  }

  const cosmeticItems = inventoryWithDetails.filter(item => item.shopItem?.category === 'cosmetic')
  const consumableItems = inventoryWithDetails.filter(item => item.shopItem?.category === 'consumable')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" 
            initial={{ scale: 0.95 }} 
            animate={{ scale: 1 }} 
            exit={{ scale: 0.95 }}
          >
            
            {/* Header */}
            <div className="bg-slate-800/80 px-6 py-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <Package className="text-amber-400" size={24} />
                <h2 className="text-xl font-bold text-amber-100 uppercase tracking-widest">Spirit Inventory</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <X className="text-slate-500 hover:text-white" size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 p-4 border-b border-slate-800">
              <button 
                onClick={() => setActiveTab('all')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'all' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Package size={16}/> All ({inventoryWithDetails.length})
              </button>
              <button 
                onClick={() => setActiveTab('cosmetic')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'cosmetic' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Palette size={16}/> Appearance ({cosmeticItems.length})
              </button>
              <button 
                onClick={() => setActiveTab('consumable')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'consumable' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Beaker size={16}/> Alchemy ({consumableItems.length})
              </button>
            </div>

            {/* Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar flex-1">
              {filteredInventory.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Package size={48} className="text-slate-700 mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-wider">Empty Inventory</p>
                  <p className="text-xs text-slate-600 mt-2">Visit the Spirit Pavilion to acquire items</p>
                </div>
              ) : (
                filteredInventory.map((item) => {
                  const isConsumable = item.shopItem.category === 'consumable'
                  
                  return (
                    <div 
                      key={item.item_id} 
                      className={`relative p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
                        item.is_active 
                          ? 'bg-amber-900/10 border-amber-500/50 shadow-lg shadow-amber-900/10' 
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {/* Active Badge */}
                      {item.is_active && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-1 rounded border border-amber-500/30">
                          <Check size={10}/> 
                          <span className="text-[10px] font-bold">Active</span>
                        </div>
                      )}

                      <div className="flex justify-between items-start">
                        <h3 className={`font-bold text-sm ${item.is_active ? 'text-amber-200' : 'text-slate-200'}`}>
                          {item.shopItem.name}
                        </h3>
                      </div>
                      
                      <p className="text-xs text-slate-500 flex-1 line-clamp-2">
                        {item.shopItem.description}
                      </p>

                      {/* Quantity Badge for Consumables */}
                      {isConsumable && (
                        <div className="flex items-center gap-2 text-xs">
                          <Sparkles size={12} className="text-emerald-400" />
                          <span className="text-emerald-300 font-bold">Quantity: {item.quantity}</span>
                        </div>
                      )}
                      
                      <div className="mt-auto">
                        {isConsumable ? (
                          // ✅ 3. تعطيل زر USE إذا كانت الحبة active
                          <button 
                            onClick={() => handleConsume(item)}
                            disabled={item.is_active || processing === item.item_id || item.quantity <= 0}
                            className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
                              item.is_active
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {item.is_active 
                              ? 'Already Active' 
                              : processing === item.item_id 
                                ? 'Using...' 
                                : `Use (${item.quantity})`
                            }
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleEquip(item)}
                            disabled={item.is_active || processing === item.item_id}
                            className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                              item.is_active 
                                ? 'bg-slate-800 text-slate-500 cursor-default' 
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {item.is_active ? 'Equipped' : 'Equip'}
                          </button>
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
