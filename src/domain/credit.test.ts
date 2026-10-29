import { describe, expect, it } from 'vitest'
import { creditDueAt, nextCreditDates, splitCredit, type CreditMovement } from './credit'
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

describe('nextCreditDates', () => {
  it('el 28 oct: corte 6 nov y pago 20 nov', () => {
    const { cutAt, dueAt } = nextCreditDates(new Date('2026-10-28T12:00:00-06:00'))
    expect(at(cutAt)).toBe(at('2026-11-06T00:00:00-06:00'))
    expect(at(dueAt)).toBe(at('2026-11-20T00:00:00-06:00'))
  })
  it('el 6 y el 20 todavía son de este mes', () => {
    const { cutAt, dueAt } = nextCreditDates(new Date('2026-12-06T23:00:00-06:00'))
    expect(at(cutAt)).toBe(at('2026-12-06T00:00:00-06:00'))
    expect(at(dueAt)).toBe(at('2026-12-20T00:00:00-06:00'))
    expect(at(nextCreditDates(new Date('2026-12-21T00:00:00-06:00')).dueAt)).toBe(at('2027-01-20T00:00:00-06:00'))
  })
})

describe('TC-01jm AC-2/AC-3: splitCredit con summarize', () => {
  const salary = m('2026-10-01T08:00:00-06:00', 15_000_000, 'cash', 'in')
  const purchase = m('2026-10-10T12:00:00-06:00', 20_000_000)
  const usd = m('2026-10-11T12:00:00-06:00', 5_000, 'credit', 'out', 'USD')

  it('antes del 20: saldo 150 000 y deuda 200 000 (USD aparte)', () => {
    const { settled, pending } = splitCredit([salary, purchase, usd], new Date('2026-10-28T12:00:00-06:00'))
    expect(summarize(0, settled).balanceCrcCents).toBe(15_000_000)
    expect(pending).toEqual({ crcCents: 20_000_000, usdCents: 5_000 })
  })
  it('desde el 20: ya no es deuda, entra como gasto con fecha de pago', () => {
    const { settled, pending } = splitCredit([salary, purchase], new Date('2026-11-20T00:00:00-06:00'))
    expect(summarize(0, settled).balanceCrcCents).toBe(-5_000_000)
    expect(pending).toEqual({ crcCents: 0, usdCents: 0 })
    expect(at(settled[1].occurredAt)).toBe(at('2026-11-20T00:00:00-06:00'))
  })
})

describe('TC-01jm AC-5: ancla de saldo posterior al pago', () => {
  it('la compra ya está en el saldo del banco: no se resta', () => {
    const { settled } = splitCredit([m('2026-10-10T12:00:00-06:00', 20_000_000)], new Date('2026-11-25T00:00:00-06:00'))
    expect(summarizeFromAccount(1_000_000, '2026-11-21T00:00:00-06:00', settled).balanceCrcCents).toBe(1_000_000)
  })
})
