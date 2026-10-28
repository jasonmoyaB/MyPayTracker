import { describe, expect, it } from 'vitest'
import { costaRicaMonth, lastEmailMovement, monthStats, topExpenses, type MonthMovement } from './monthStats'

// 1 nov 2026 00:30 en Costa Rica = 06:30 UTC.
const now = new Date('2026-11-01T06:30:00Z')

const m = (occurredAt: string, amountCents: number, direction: 'in' | 'out',
  description = 'X', currency: 'CRC' | 'USD' = 'CRC', source = 'manual'): MonthMovement =>
  ({ occurredAt, amountCents, direction, description, currency, source })

describe('costaRicaMonth', () => {
  it('el mes empieza y termina a medianoche de Costa Rica (−06:00)', () => {
    expect(costaRicaMonth(now)).toEqual({
      startMs: Date.parse('2026-11-01T00:00:00-06:00'),
      endMs: Date.parse('2026-12-01T00:00:00-06:00'),
    })
  })
  it('a las 23:59 del 31 dic en CR sigue siendo diciembre', () => {
    const { startMs, endMs } = costaRicaMonth(new Date('2027-01-01T05:59:00Z'))
    expect(startMs).toBe(Date.parse('2026-12-01T00:00:00-06:00'))
    expect(endMs).toBe(Date.parse('2027-01-01T00:00:00-06:00'))
  })
})

describe('AC-3: monthStats', () => {
  it('suma solo CRC del mes en curso; neto = ingresos − gastos', () => {
    const movements = [
      m('2026-11-01T00:00:00-06:00', 100_000, 'in'),
      m('2026-11-01T00:10:00-06:00', 30_000, 'out'),
      m('2026-10-31T23:59:00-06:00', 999, 'out'), // mes anterior
      m('2026-11-01T00:10:00-06:00', 500, 'out', 'X', 'USD'), // USD aparte
    ]
    expect(monthStats(movements, now)).toEqual({ incomeCents: 100_000, expenseCents: 30_000, netCents: 70_000 })
  })
  it('sin movimientos del mes: todo en cero', () => {
    expect(monthStats([], now)).toEqual({ incomeCents: 0, expenseCents: 0, netCents: 0 })
  })
})

describe('AC-4: topExpenses', () => {
  it('agrupa gastos CRC del mes por descripción exacta y devuelve los 3 mayores', () => {
    const d = '2026-11-01T00:10:00-06:00'
    const movements = [
      m(d, 1_000, 'out', 'Super'), m(d, 2_500, 'out', 'Super'),
      m(d, 3_000, 'out', 'Gasolina'), m(d, 100, 'out', 'Café'), m(d, 2_000, 'out', 'Farmacia'),
      m(d, 9_999, 'in', 'Salario'), m(d, 9_999, 'out', 'Amazon', 'USD'),
      m('2026-10-15T10:00:00-06:00', 9_999, 'out', 'Viejo'),
      m(d, 50, 'out', 'super'), // descripción distinta: no se agrupa
    ]
    expect(topExpenses(movements, now)).toEqual([
      { description: 'Super', cents: 3_500 },
      { description: 'Gasolina', cents: 3_000 },
      { description: 'Farmacia', cents: 2_000 },
    ])
  })
  it('sin gastos del mes: lista vacía', () => {
    expect(topExpenses([], now)).toEqual([])
  })
})

describe('AC-6: lastEmailMovement', () => {
  it('devuelve la fecha más reciente de un movimiento leído del correo', () => {
    const movements = [
      m('2026-10-30T10:00:00-06:00', 1, 'out', 'X', 'CRC', 'email_regex'),
      m('2026-10-31T10:00:00-06:00', 1, 'out', 'X', 'CRC', 'email_ai'),
      m('2026-11-01T00:10:00-06:00', 1, 'out', 'X', 'CRC', 'manual'),
    ]
    expect(lastEmailMovement(movements)).toBe('2026-10-31T10:00:00-06:00')
  })
  it('sin movimientos de correo: null', () => {
    expect(lastEmailMovement([m('2026-11-01T00:10:00-06:00', 1, 'out')])).toBeNull()
  })
})
