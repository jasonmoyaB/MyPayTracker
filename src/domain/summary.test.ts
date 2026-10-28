import { describe, expect, it } from 'vitest'
import { summarize } from './summary'

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
