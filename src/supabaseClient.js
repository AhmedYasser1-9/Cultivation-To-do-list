import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ✅ 1. إصلاح: إضافة autoRefreshToken وpersistSession للحفاظ على session عند refresh
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // نعالج الهاش يدوياً، فأوقف القراءة التلقائية لتجنب الـ stale hash
    detectSessionInUrl: false,
    storage: window.localStorage
  }
})