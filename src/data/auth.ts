import { clearAuthKeys, supabase } from './supabase'

export type Session = { userId: string; email: string; signedInAt: number }

type AuthUser = { id: string; email?: string; last_sign_in_at?: string }

// AUTH-02jm-T02: el máximo se cuenta desde el inicio de sesión; refrescar el token no lo cambia.
const toSession = (s: { user: AuthUser } | null): Session | null =>
  s ? { userId: s.user.id, email: s.user.email ?? '', signedInAt: Date.parse(s.user.last_sign_in_at ?? '') || Date.now() } : null

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

// AUTH-01jm-T03: verifica la actual volviendo a entrar (mismo usuario, la sesión sigue) y solo entonces cambia.
// Si la actual es incorrecta, el error es de credenciales (toAppError → 'credentials') y no se toca nada.
export async function changePassword(email: string, current: string, next: string): Promise<void> {
  // Sin email no se puede reautenticar: tratarlo como sesión inválida, no como contraseña incorrecta.
  if (!email) throw Object.assign(new Error('Sesión sin email'), { code: 'session_not_found' })
  await signIn(email, current)
  const { error } = await supabase.auth.updateUser({ password: next })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

// Sesión vencida: el servidor ya no la acepta, así que se borra solo la local (no depende de la red).
export async function endExpiredSession(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: 'local' }).catch((e: unknown) => ({ error: e }))
  // AUTH-02jm-T02: sin red signOut falla y deja la sesión guardada; se borra a mano (AC-6).
  if (error) try { clearAuthKeys(sessionStorage) } catch { /* sin sessionStorage no hay sesión guardada */ }
}

// Llama `cb` con la sesión actual y en cada cambio. Devuelve la función para desuscribirse.
export function onSessionChange(cb: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, s) => cb(toSession(s)))
  return () => data.subscription.unsubscribe()
}
