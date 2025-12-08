import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CursorEffect({ type }) {
  const [trail, setTrail] = useState([])
  const requestRef = useRef()
  const timerRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = Date.now()
      if (now - timerRef.current > 30) { // Throttle
        setTrail(prev => [
          ...prev.slice(-15), // Limit trail length
          { x: e.clientX, y: e.clientY, id: Math.random() }
        ])
        timerRef.current = now
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Clear old particles
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => prev.slice(1))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  if (!type || type === 'none') return null

  const getStyle = () => {
    switch(type) {
      case 'ink': return 'bg-slate-900 w-3 h-3 rounded-full opacity-80 blur-[1px]'
      case 'flower': return 'bg-pink-400 w-2 h-2 rounded-full shadow-[0_0_5px_pink]'
      case 'fire': return 'bg-orange-500 w-2 h-2 rounded-full blur-[2px] shadow-[0_0_10px_orange]'
      case 'sword': return 'bg-cyan-300 w-1 h-6 rotate-45 opacity-80 shadow-[0_0_8px_cyan]'
      case 'lightning': return 'bg-violet-400 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_violet]'
      default: return 'bg-white w-2 h-2 rounded-full'
    }
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {trail.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0, y: 10 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute ${getStyle()}`}
            style={{ left: p.x, top: p.y }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
