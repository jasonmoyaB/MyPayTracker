import { describe, expect, it } from 'vitest'
import { budgetAlert, budgetStatus, type BudgetMovement } from './budget'
import { formatAmount } from './notification'

const now = new Date('2026-11-27T12:00:00-06:00')
const out = (amountCents: number, extra: Partial<BudgetMovement> = {}): BudgetMovement => ({
  amountCents, currency: 'CRC', direction: 'out', description: 'AUTO MERCADO ESCAZU', occurredAt: '2026-11-10T12:00:00-06:00',
  source: 'manual', paymentMethod: 'cash', ...extra,
})
const super80 = [{ category: 'Súper' as const, limitCents: 80_000_00 }]

describe('PRES-01jm-T02: budgetStatus', () => {
  it('AC-1: ₡64 000 de ₡80 000 en Súper → 80 % y aviso', () => {
    const [s] = budgetStatus(super80, [out(64_000_00)], now)
    expect(s).toEqual({ category: 'Súper', spentCents: 64_000_00, limitCents: 80_000_00, percent: 80 })
    expect(budgetAlert(s)).toEqual({ kind: 'warn', title: 'Presupuesto', url: '/#/resumen',
      body: `Súper: llevas ${formatAmount(64_000_00, 'CRC')} de ${formatAmount(80_000_00, 'CRC')}` })
  })
  it('AC-3: ₡81 000 → aviso del 100 %', () => {
    const [s] = budgetStatus(super80, [out(81_000_00)], now)
    expect(budgetAlert(s)?.kind).toBe('exceeded')
  })
  it('justo en el tope solo es el 80 %; abajo del 80 % no avisa', () => {
    expect(budgetAlert(budgetStatus(super80, [out(80_000_00)], now)[0])?.kind).toBe('warn')
    expect(budgetAlert(budgetStatus(super80, [out(63_999_99)], now)[0])).toBeNull()
  })
  it('regla GAS-01jm: cuota del mes, sin pagos de tarjeta, sin USD, sin otros meses ni otras categorías', () => {
    const ms = [
      out(120_000_00, { paymentMethod: 'credit', installments: 12, occurredAt: '2026-10-01T12:00:00-06:00' }), // cuota 20 nov: ₡10 000
      out(50_000_00, { paymentMethod: 'card_payment' }),
      out(30_00, { currency: 'USD' }),
      out(9_000_00, { occurredAt: '2026-10-15T12:00:00-06:00' }),
      out(7_000_00, { description: 'UBER TRIP' }),
      out(2_000_00, { direction: 'in' }),
    ]
    expect(budgetStatus(super80, ms, now)[0].spentCents).toBe(10_000_00)
  })
})
