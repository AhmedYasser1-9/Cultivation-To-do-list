import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scroll, Key, Mail, Sparkles, Skull } from 'lucide-react'
import { useCultivation } from '../context/CultivationContext.jsx' // تأكد أن المسار صحيح

export default function Auth() {
  const { signIn, signUp, loading } = useCultivation()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('') // For Sign Up only
  const [msg, setMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password, username)
        if (error) throw error
        setMsg({ type: 'success', text: 'Sect Token sent! Check your Spirit Mail (Email) to confirm.' })
      }
    } catch (error) {
      setMsg({ type: 'error', text: error.message })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_50%)]" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-slate-900 border border-amber-900/30 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
            <Scroll className="text-amber-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-emerald-100 uppercase tracking-widest">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            {isLogin ? 'Sign in to continue your journey' : 'Begin your cultivation path today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-emerald-100 outline-none focus:border-emerald-500 transition-all"
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-emerald-100 outline-none focus:border-emerald-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-emerald-100 outline-none focus:border-emerald-500 transition-all"
              required
            />
          </div>

          {msg && (
            <div className={`p-3 rounded-lg text-xs font-bold text-center ${msg.type === 'error' ? 'bg-red-900/20 text-red-400' : 'bg-emerald-900/20 text-emerald-400'}`}>
              {msg.text}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 py-4 rounded-xl text-white font-bold uppercase tracking-wider shadow-lg hover:from-emerald-500 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setMsg(null); }}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}