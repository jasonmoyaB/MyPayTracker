// PROY-01jm-T01: con cuánto se llega al último día del mes CR. Imports .ts por si la usa una Edge Function.
import { dueBy } from './credit.ts'
import { costaRicaMonth } from './monthStats.ts'

type Input = { availableCents: number; scheduleCrc: Record<string, number>; reservedCents: number; typicalCents: number; spentCents: number; now: Date }

// availableCents ya viene sin las cuotas pendientes (splitCredit): aquí se restan una sola vez, hasta fin de mes.
// Sin salario: no se sabe qué día entra.
export function monthEndProjection({ availableCents, scheduleCrc, reservedCents, typicalCents, spentCents, now }: Input) {
  const cardCents = dueBy(scheduleCrc, new Date(costaRicaMonth(now).endMs - 1).toISOString())
  const remainingTypicalCents = Math.max(0, typicalCents - spentCents)
  return { cardCents, reservedCents, remainingTypicalCents, endCents: availableCents - cardCents - reservedCents - remainingTypicalCents }
}
