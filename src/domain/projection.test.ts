import { describe, expect, it } from 'vitest'
import { spentThisMonth, type SpendMovement } from './monthStats'
import { monthEndProjection } from './projection'

const now = new Date('2026-11-10T12:00:00-06:00')
const schedule = { '2026-11-20T06:00:00.000Z': 16_166_00, '2026-12-20T06:00:00.000Z': 16_166_00 }
const base = { availableCents: 300_000_00, scheduleCrc: schedule, reservedCents: 50_000_00, typicalCents: 120_000_00, now }

describe('PROY-01jm-T01: monthEndProjection', () => {
  it('AC-1: 300 000 − 16 166 (solo la cuota de nov) − 50 000 fijos − 50 000 de típico pendiente', () => {
    expect(monthEndProjection({ ...base, spentCents: 70_000_00 })).toEqual({
      cardCents: 16_166_00, reservedCents: 50_000_00, remainingTypicalCents: 50_000_00, endCents: 183_834_00 })
  })
  it('AC-2: gastado más que el típico → lo que falta es 0', () => {
    expect(monthEndProjection({ ...base, spentCents: 150_000_00 }).remainingTypicalCents).toBe(0)
  })
  it('fin de mes en hora CR: la cuota del 1 dic 05:59 UTC (30 nov CR) cuenta, la de dic no', () => {
    const r = monthEndProjection({ ...base, scheduleCrc: { '2026-12-01T05:59:00.000Z': 1_00, '2026-12-01T06:00:00.000Z': 2_00 }, spentCents: 0 })
    expect(r.cardCents).toBe(1_00)
  })
})

const mov = (occurredAt: string, amountCents: number, over: Partial<SpendMovement> = {}): SpendMovement => ({ occurredAt, amountCents,
  direction: 'out', description: 'Super', currency: 'CRC', source: 'manual', paymentMethod: 'cash', ...over })

describe('PROY-01jm-T01: spentThisMonth (mismo filtro que el gasto típico)', () => {
  it('solo gastos CRC del mes CR, sin tarjeta, pagos de tarjeta, ingresos ni USD', () => {
    expect(spentThisMonth([
      mov('2026-11-02T10:00:00-06:00', 10_00),
      mov('2026-11-03T10:00:00-06:00', 20_00, { paymentMethod: 'credit' }),
      mov('2026-11-04T10:00:00-06:00', 30_00, { paymentMethod: 'card_payment' }),
      mov('2026-11-05T10:00:00-06:00', 40_00, { direction: 'in' }),
      mov('2026-11-06T10:00:00-06:00', 50_00, { currency: 'USD' }),
      mov('2026-10-31T23:00:00-06:00', 60_00),
    ], now)).toBe(10_00)
  })
})
