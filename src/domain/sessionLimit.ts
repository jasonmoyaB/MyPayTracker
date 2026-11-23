// AUTH-02jm-T01: límites fijos cercanos a la banca en línea (spec, Supuestos).
export const INACTIVITY_MS = 5 * 60_000
export const MAX_SESSION_MS = 30 * 60_000

export type ExpiryReason = 'inactividad' | 'maximo'

// El máximo gana si ambos vencen: es el motivo que no se evita usando la app.
export function sessionExpiry(now: number, lastActivityAt: number, signedInAt: number): ExpiryReason | null {
  // ponytail: compara el reloj del dispositivo con last_sign_in_at del servidor; con el reloj adelantado >30 min vence al entrar. Si pasa, usar la hora local del evento SIGNED_IN.
  if (now - signedInAt > MAX_SESSION_MS) return 'maximo'
  if (now - lastActivityAt > INACTIVITY_MS) return 'inactividad'
  return null
}
