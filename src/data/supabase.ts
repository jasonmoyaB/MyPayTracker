import { createClient } from '@supabase/supabase-js'

// Único cliente de Supabase. ui/ nunca lo importa desde @supabase directo: pasa por data/.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY (ver .env.example)')

export const supabase = createClient(url, anonKey)
