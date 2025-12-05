import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Zap, Mail, Lock, Loader2 } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [msg, setMsg] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
        })
        if (error) throw error
        setMsg('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        })
        if (error) throw error
      }
    } catch (error) {
      setMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-emerald-50">
      <div className="w-full max-w-sm rounded-3xl border border-emerald-900/30 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Order of Dawn</h1>
          <p className="text-sm text-slate-400">Gateway to the Inner World</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:outline-none"
                placeholder="cultivator@dao.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {msg && (
            <div className={`rounded-lg p-3 text-xs ${msg.includes('Check') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {msg}
            </div>
          )}

          <button 
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {isSignUp ? 'Join the Sect' : 'Enter Realm'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setMsg('') }}
            className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
          >
            {isSignUp ? 'Already have a soul mark? Log in' : 'New cultivator? Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}