import type { Currency } from './bankEmail.ts'

// PWA-01jm-T03: texto de la notificación push de un movimiento leído del correo.
// La usa la Edge Function (Deno), por eso importa con extensión como bankEmail.ts.
export type MovementInput = { direction: 'in' | 'out'; amountCents: number; currency: Currency; description: string }

const MAX_DESCRIPTION = 60

export function movementNotification({ direction, amountCents, currency, description }: MovementInput) {
  // Mismo formato que ui/format.ts (domain no puede importar ui).
  const amount = new Intl.NumberFormat('es-CR', { style: 'currency', currency }).format(amountCents / 100)
  const text = description.trim()
  const short = text.length > MAX_DESCRIPTION ? `${text.slice(0, MAX_DESCRIPTION - 1)}…` : text
  return { title: direction === 'in' ? 'Ingreso' : 'Gasto', body: short ? `${amount} · ${short}` : amount }
}
