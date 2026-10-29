import { describe, expect, it } from 'vitest'
import { creditDueAt, dueBy, installmentDues, nextCutAt, nextPayDay, ongoingPurchase, splitCredit, type CreditMovement } from './credit'
import { summarize, summarizeFromAccount } from './summary'

const at = (iso: string) => Date.parse(iso)
const m = (occurredAt: string, amountCents: number, paymentMethod: 'cash' | 'credit' = 'credit',
  direction: 'in' | 'out' = 'out', currency: 'CRC' | 'USD' = 'CRC'): CreditMovement =>
  ({ occurredAt, amountCents, paymentMethod, direction, currency })

describe('TC-01jm AC-1: creditDueAt', () => {
  it('compra el 6 (CR) se paga el 20 del mismo mes', () => {
    expect(at(creditDueAt('2026-10-06T10:00:00-06:00'))).toBe(at('2026-10-20T00:00:00-06:00'))
  })
  it('borde: 23:59 CR del 6 (05:59Z del 7) sigue siendo el 6', () => {
    expect(at(creditDueAt('2026-10-07T05:59:00Z'))).toBe(at('2026-10-20T00:00:00-06:00'))
  })
  it('compra el 7 se paga el 20 del mes siguiente', () => {
    expect(at(creditDueAt('2026-10-07T00:00:00-06:00'))).toBe(at('2026-11-20T00:00:00-06:00'))
  })
  it('diciembre pasa a enero', () => {
    expect(at(creditDueAt('2026-12-15T12:00:00-06:00'))).toBe(at('2027-01-20T00:00:00-06:00'))
  })
})

describe('nextCutAt', () => {
  it('el 28 oct: corte 6 nov', () => {
    expect(at(nextCutAt(new Date('2026-10-28T12:00:00-06:00')))).toBe(at('2026-11-06T00:00:00-06:00'))
  })
  it('el 6 todavía es corte de este mes', () => {
    expect(at(nextCutAt(new Date('2026-12-06T23:00:00-06:00')))).toBe(at('2026-12-06T00:00:00-06:00'))
  })
})

describe('TC-01jm AC-2/AC-3: splitCredit con summarize', () => {
  const salary = m('2026-10-01T08:00:00-06:00', 15_000_000, 'cash', 'in')
  const purchase = m('2026-10-10T12:00:00-06:00', 20_000_000)
  const usd = m('2026-10-11T12:00:00-06:00', 5_000, 'credit', 'out', 'USD')

  it('antes del 20: saldo 150 000 y deuda 200 000 (USD aparte)', () => {
    const { settled, pending } = splitCredit([salary, purchase, usd], new Date('2026-10-28T12:00:00-06:00'))
    expect(summarize(0, settled).balanceCrcCents).toBe(15_000_000)
    expect(pending).toEqual({ crcCents: 20_000_000, usdCents: 5_000, dueAt: creditDueAt(purchase.occurredAt),
      scheduleCrc: { [creditDueAt(purchase.occurredAt)]: 20_000_000 } })
  })
  it('desde el 20: ya no es deuda, entra como gasto con fecha de pago', () => {
    const { settled, pending } = splitCredit([salary, purchase], new Date('2026-11-20T00:00:00-06:00'))
    expect(summarize(0, settled).balanceCrcCents).toBe(-5_000_000)
    expect(pending).toEqual({ crcCents: 0, usdCents: 0, dueAt: null, scheduleCrc: {} })
    expect(at(settled[1].occurredAt)).toBe(at('2026-11-20T00:00:00-06:00'))
  })
})

describe('TC-01jm-T06: pending.dueAt es el pago más temprano de la deuda', () => {
  it('compra del 10 nov vista el 15 nov → 20 dic, no el 20 nov del calendario', () => {
    const { pending } = splitCredit([m('2026-11-10T12:00:00-06:00', 100), m('2026-12-10T12:00:00-06:00', 100)],
      new Date('2026-11-15T12:00:00-06:00'))
    expect(at(pending.dueAt!)).toBe(at('2026-12-20T00:00:00-06:00'))
  })
})

describe('TC-01jm AC-5: ancla de saldo posterior al pago', () => {
  it('la compra ya está en el saldo del banco: no se resta', () => {
    const { settled } = splitCredit([m('2026-10-10T12:00:00-06:00', 20_000_000)], new Date('2026-11-25T00:00:00-06:00'))
    expect(summarizeFromAccount(1_000_000, '2026-11-21T00:00:00-06:00', settled).balanceCrcCents).toBe(1_000_000)
  })
})

describe('TC-02jm AC-1: cuotas de tasa cero', () => {
  it('₡90 000 a 3 meses: 3 cuotas de ₡30 000 los 20 desde el pago de la compra', () => {
    const dues = installmentDues('2026-10-10T12:00:00-06:00', 9_000_000, 3)
    expect(dues.map((d) => d.cents)).toEqual([3_000_000, 3_000_000, 3_000_000])
    expect(dues.map((d) => at(d.dueAt))).toEqual(
      ['2026-11-20', '2026-12-20', '2027-01-20'].map((d) => at(`${d}T00:00:00-06:00`)))
  })
  it('₡100 000 a 3: el resto de centavos va en la primera', () => {
    expect(installmentDues('2026-10-10T12:00:00-06:00', 10_000_000, 3).map((d) => d.cents))
      .toEqual([3_333_334, 3_333_333, 3_333_333])
  })
  it('splitCredit: cuotas vencidas al saldo, el resto en la agenda por fecha', () => {
    const buy = { ...m('2026-10-10T12:00:00-06:00', 9_000_000), installments: 3 }
    const { settled, pending } = splitCredit([buy], new Date('2026-12-01T12:00:00-06:00'))
    expect(settled.map((s) => s.amountCents)).toEqual([3_000_000])
    expect(pending.crcCents).toBe(6_000_000)
    expect(Object.values(pending.scheduleCrc)).toEqual([3_000_000, 3_000_000])
  })
})

describe('TC-02jm: próximo día 20 y lo que vence hasta ahí', () => {
  it('el 28 oct → 20 nov; el 20 todavía cuenta como próximo', () => {
    expect(at(nextPayDay(new Date('2026-10-28T12:00:00-06:00')))).toBe(at('2026-11-20T00:00:00-06:00'))
    expect(at(nextPayDay(new Date('2026-11-20T23:00:00-06:00')))).toBe(at('2026-11-20T00:00:00-06:00'))
  })
  it('dueBy suma solo lo que vence hasta la fecha', () => {
    const schedule = { '2026-11-20T06:00:00.000Z': 100, '2026-12-20T06:00:00.000Z': 50 }
    expect(dueBy(schedule, '2026-11-20T06:00:00.000Z')).toBe(100)
  })
})

describe('TC-04jm-T02: ongoingPurchase (deuda que ya venía pagando)', () => {
  const dues = (now: string, price: number, months: number, remaining: number) => {
    const { installments, occurredAt } = ongoingPurchase(price, months, remaining, new Date(now))
    return installmentDues(occurredAt, remaining, installments).map(d => [at(d.dueAt), d.cents])
  }
  const nov20 = at('2026-11-20T00:00:00-06:00')
  const dec20 = at('2026-12-20T00:00:00-06:00')
  it('AC-1: 29 oct, ₡120 000 a 12 meses, queda ₡60 000 → 6 cuotas de ₡10 000 desde el 20 nov', () => {
    const d = dues('2026-10-29T12:00:00-06:00', 120_000_00, 12, 60_000_00)
    expect(d).toHaveLength(6)
    expect(d[0]).toEqual([nov20, 10_000_00])
    expect(d.every(([, c]) => c === 10_000_00)).toBe(true)
  })
  it('AC-2: 15 nov, mismo caso → primera cuota el 20 nov', () => {
    expect(dues('2026-11-15T12:00:00-06:00', 120_000_00, 12, 60_000_00)[0]).toEqual([nov20, 10_000_00])
  })
  it('AC-3: un solo pago de ₡50 000 el 29 oct vence el 20 nov', () => {
    expect(dues('2026-10-29T12:00:00-06:00', 50_000_00, 1, 50_000_00)).toEqual([[nov20, 50_000_00]])
  })
  it('AC-4: ₡100 000 a 3 meses, queda ₡50 000 → 2 cuotas de ₡25 000', () => {
    expect(dues('2026-10-29T12:00:00-06:00', 100_000_00, 3, 50_000_00).map(([, c]) => c)).toEqual([25_000_00, 25_000_00])
  })
  it('bordes: el 20 aún paga ese 20; el 6 (corte) paga el 20 de ese mes; el 21 pasa al siguiente', () => {
    expect(dues('2026-11-20T23:00:00-06:00', 50_000_00, 1, 50_000_00)[0][0]).toBe(nov20)
    expect(dues('2026-11-06T23:00:00-06:00', 50_000_00, 1, 50_000_00)[0][0]).toBe(nov20)
    expect(dues('2026-11-21T00:00:00-06:00', 50_000_00, 1, 50_000_00)[0][0]).toBe(dec20)
  })
  it('lo que queda nunca da más cuotas que el plazo ni menos de una', () => {
    expect(ongoingPurchase(120_000_00, 12, 120_000_00, new Date()).installments).toBe(12)
    expect(ongoingPurchase(120_000_00, 12, 1, new Date()).installments).toBe(1)
  })
})
