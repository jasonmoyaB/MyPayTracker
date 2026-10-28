import { endExpiredSession } from '../data/auth'
import { toAppError, type AppError } from '../data/errors'

// UX-02jm-T04: traduce el error y, si la sesión venció, la cierra; App vuelve al login vía onSessionChange.
export function toUiError(e: unknown): AppError {
  const error = toAppError(e)
  // Si signOut falla, se ignora: un rechazo sin manejar volvería aquí vía unhandledrejection (bucle).
  if (error.kind === 'session') endExpiredSession().catch(() => {})
  return error
}
