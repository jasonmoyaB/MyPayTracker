import { describe, expect, it } from 'vitest'
import { summarize, summarizeFromAccount } from './summary'

describe('AC-2: summarize', () => {
  it('saldo CRC = salario + ingresos CRC − gastos CRC; USD aparte', () => {
    const txs = [
      { amountCents: 50_000, currency: 'CRC' as const, direction: 'in' as const },
      { amountCents: 20_000, currency: 'CRC' as const, direction: 'out' as const },
      { amountCents: 1_500, currency: 'USD' as const, direction: 'in' as const },
      { amountCents: 999, currency: 'USD' as const, direction: 'out' as const },
    ]
    expect(summarize(100_000, txs)).toEqual({
      balanceCrcCents: 130_000,
      incomeCrcCents: 50_000,
      expenseCrcCents: 20_000,
      usd: { incomeCents: 1_500, expenseCents: 999 },
    })
  })
  it('puede quedar negativo', () => {
    const txs = [{ amountCents: 300, currency: 'CRC' as const, direction: 'out' as const }]
    expect(summarize(100, txs).balanceCrcCents).toBe(-200)
  })
})

describe('BAL-01jm: summarizeFromAccount', () => {
  const at = (occurredAt: string, amountCents: number, direction: 'in' | 'out') =>
    ({ amountCents, currency: 'CRC' as const, direction, occurredAt })

  it('parte del saldo de la cuenta y solo suma movimientos posteriores a su fecha', () => {
    const txs = [
      at('2026-10-20T10:00:00-06:00', 999_999, 'out'), // ya reflejado en la cuenta
      at('2026-10-28T15:30:00-06:00', 5_000, 'out'),
      at('2026-10-29T08:00:00-06:00', 20_000, 'in'),
    ]
    const s = summarizeFromAccount(14_000_000, '2026-10-28T15:00:00-06:00', txs)
    expect(s).toMatchObject({ balanceCrcCents: 14_015_000, incomeCrcCents: 20_000, expenseCrcCents: 5_000 })
  })
  it('compara instantes, no texto: misma hora en otra zona no cuenta como posterior', () => {
    const txs = [at('2026-10-28T21:00:00Z', 5_000, 'out')] // = 15:00 en Costa Rica
    expect(summarizeFromAccount(100, '2026-10-28T15:00:00-06:00', txs).balanceCrcCents).toBe(100)
  })
})
