import type { Currency } from './bankEmail.ts'

// PWA-01jm-T03: texto de la notificación push de un movimiento leído del correo.
// La usa la Edge Function (Deno), por eso importa con extensión como bankEmail.ts.
export type MovementInput = { direction: 'in' | 'out'; amountCents: number; currency: Currency; description: string }

const MAX_DESCRIPTION = 60

// Mismo formato que ui/format.ts (domain no puede importar ui). REC-01jm-T02: lo reutiliza reminder.ts.
export const formatAmount = (cents: number, currency: Currency) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency }).format(cents / 100)

export function movementNotification({ direction, amountCents, currency, description }: MovementInput) {
  const amount = formatAmount(amountCents, currency)
  const text = description.trim()
  const short = text.length > MAX_DESCRIPTION ? `${text.slice(0, MAX_DESCRIPTION - 1)}…` : text
  return { title: direction === 'in' ? 'Ingreso' : 'Gasto', body: short ? `${amount} · ${short}` : amount }
}

// MAIL-02jm-T02: correo del BAC con monto que el parser no leyó. `receivedAt` = fecha del correo (null si no la trae).
export function unreadNotification(receivedAt: string | null) {
  const day = receivedAt && new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', timeZone: 'America/Costa_Rica' })
    .format(new Date(receivedAt))
  return { title: 'Correo del BAC sin leer', body: `No pude leer un correo del BAC${day ? ` del ${day}` : ''}: regístralo a mano`, url: '/#/movimientos' }
}
