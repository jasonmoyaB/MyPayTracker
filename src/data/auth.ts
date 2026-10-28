import { supabase } from './supabase'

export type Session = { userId: string; email: string }

const toSession = (s: { user: { id: string; email?: string } } | null): Session | null =>
  s ? { userId: s.user.id, email: s.user.email ?? '' } : null

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

// Sesión vencida: el servidor ya no la acepta, así que se borra solo la local (no depende de la red).
export async function endExpiredSession(): Promise<void> {
  await supabase.auth.signOut({ scope: 'local' })
}

// Llama `cb` con la sesión actual y en cada cambio. Devuelve la función para desuscribirse.
export function onSessionChange(cb: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, s) => cb(toSession(s)))
  return () => data.subscription.unsubscribe()
}
