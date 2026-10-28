import { createClient } from '@supabase/supabase-js'

// Único cliente de Supabase. ui/ nunca lo importa desde @supabase directo: pasa por data/.
const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// UX-02jm-T05: no se lanza al importar; main.tsx muestra este aviso en vez de la app.
export const configError: string | null = url && publishableKey
  ? null
  : 'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY (ver .env.example).'

// Con configError el cliente nunca se usa; los valores de relleno solo evitan que createClient lance,
// y sin refresco ni sesión persistida no hace requests a ellos.
export const supabase = configError
  ? createClient('http://localhost', 'sin-configurar', { auth: { autoRefreshToken: false, persistSession: false } })
  : createClient(url, publishableKey)
