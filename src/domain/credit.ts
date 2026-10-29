import { CR_OFFSET_MS } from './date'
import type { SummaryMovement } from './summary'

// TC-01jm: una sola tarjeta (la de la hermana) con corte y pago fijos; sin config (ponytail).
const CUT_DAY = 6
const DUE_DAY = 20

export type PaymentMethod = 'cash' | 'credit'
export type CreditMovement = SummaryMovement & { paymentMethod: PaymentMethod; occurredAt: string }

// Día `day` a las 00:00 CR del mes local de `ref`, o del siguiente si ya pasó `limitDay`. Date.UTC pasa dic → ene.
function crDay(ref: Date, day: number, limitDay: number): string {
  const local = new Date(ref.getTime() - CR_OFFSET_MS)
  const next = local.getUTCDate() > limitDay ? 1 : 0
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + next, day) + CR_OFFSET_MS).toISOString()
}

// TC-01jm-T02: hasta el día de corte (inclusive, hora CR) se paga el 20 de ese mes; después, el del siguiente.
export function creditDueAt(occurredAt: string): string {
  return crDay(new Date(occurredAt), DUE_DAY, CUT_DAY)
}

// El día de corte aún cuenta como "próximo" mientras sea ese día en CR.
export function nextCutAt(now: Date): string {
  return crDay(now, CUT_DAY, CUT_DAY)
}

// TC-01jm-T02: la compra con tarjeta es un gasto cuya fecha efectiva es su pago. Así el ancla de
// saldo de cuenta (BAL-01jm) no la resta dos veces si es posterior al pago.
export function splitCredit<T extends CreditMovement>(movements: T[], now: Date) {
  const settled: T[] = []
  // TC-01jm-T06: dueAt = pago más temprano de lo pendiente; el 20 del calendario puede no tener deuda.
  const pending = { crcCents: 0, usdCents: 0, dueAt: null as string | null }
  for (const m of movements) {
    if (m.paymentMethod !== 'credit') { settled.push(m); continue }
    const dueAt = creditDueAt(m.occurredAt)
    if (Date.parse(dueAt) <= now.getTime()) { settled.push({ ...m, occurredAt: dueAt }); continue }
    // ISO UTC de toISOString: el orden de texto es el orden de fechas.
    if (pending.dueAt === null || dueAt < pending.dueAt) pending.dueAt = dueAt
    if (m.currency === 'CRC') pending.crcCents += m.amountCents
    else pending.usdCents += m.amountCents
  }
  return { settled, pending }
}
