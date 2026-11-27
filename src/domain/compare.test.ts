import { describe, expect, it } from 'vitest'
import type { BudgetMovement } from './budget'
import { compareMonths } from './compare'

const out = (occurredAt: string, amountCents: number, extra: Partial<BudgetMovement> = {}): BudgetMovement => ({
  amountCents, currency: 'CRC', direction: 'out', description: 'AUTO MERCADO ESCAZU', occurredAt, source: 'manual', paymentMethod: 'cash', ...extra,
})

describe('ANA-01jm-T01: compareMonths', () => {
  const now = new Date('2026-11-10T12:00:00-06:00')
  it('AC-1: Súper ₡40 000 (1–10 nov) contra ₡30 000 (1–10 oct) → +₡10 000', () => {
    const ms = [out('2026-11-05T10:00:00-06:00', 40_000_00), out('2026-10-10T23:00:00-06:00', 30_000_00)]
    expect(compareMonths(ms, now)).toEqual([{ category: 'Súper', thisCents: 40_000_00, lastCents: 30_000_00, diffCents: 10_000_00 }])
  })
  it('AC-2: el 15 oct no cuenta; ordena por |diferencia|; sin USD, pagos de tarjeta ni ingresos', () => {
    const ms = [
      out('2026-10-15T10:00:00-06:00', 99_000_00),
      out('2026-11-01T00:00:00-06:00', 1_000_00, { description: 'UBER TRIP' }),
      out('2026-10-02T10:00:00-06:00', 5_000_00, { description: 'SODA TICA' }),
      out('2026-11-02T10:00:00-06:00', 7_000_00, { currency: 'USD' }),
      out('2026-11-02T10:00:00-06:00', 7_000_00, { paymentMethod: 'card_payment' }),
      out('2026-11-02T10:00:00-06:00', 7_000_00, { direction: 'in' }),
      out('2026-11-10T13:00:00-06:00', 7_000_00), // después de "ahora"
    ]
    expect(compareMonths(ms, now)).toEqual([
      { category: 'Comida', thisCents: 0, lastCents: 5_000_00, diffCents: -5_000_00 },
      { category: 'Transporte', thisCents: 1_000_00, lastCents: 0, diffCents: 1_000_00 },
    ])
  })
  it('AC-3: el 31 mar toma febrero completo', () => {
    const ms = [out('2026-02-28T23:30:00-06:00', 2_000_00), out('2026-03-01T00:30:00-06:00', 1_000_00)]
    expect(compareMonths(ms, new Date('2026-03-31T12:00:00-06:00'))).toEqual([{ category: 'Súper', thisCents: 1_000_00, lastCents: 2_000_00, diffCents: -1_000_00 }])
  })
  it('cuota de tarjeta en su mes (GAS-01jm)', () => {
    // Compra 1 oct (antes del corte) en 2 cuotas → 20 oct y 20 nov; al 25 nov cada una cae en su mes.
    const ms = [out('2026-10-01T12:00:00-06:00', 2_000_00, { paymentMethod: 'credit', installments: 2 })]
    expect(compareMonths(ms, new Date('2026-11-25T12:00:00-06:00'))).toEqual([{ category: 'Súper', thisCents: 1_000_00, lastCents: 1_000_00, diffCents: 0 }])
  })
})
