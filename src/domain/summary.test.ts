import { describe, expect, it } from 'vitest'
import { summarize, summarizeFromAccount, summaryFor } from './summary'

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

describe('MCP-02jm-T01: summaryFor', () => {
  const txs = [
    { amountCents: 5_000, currency: 'CRC' as const, direction: 'out' as const, occurredAt: '2026-10-01T00:00:00Z' },
    { amountCents: 2_000, currency: 'CRC' as const, direction: 'out' as const, occurredAt: '2026-10-10T00:00:00Z' },
  ]
  it('con saldo de cuenta parte de ahí y solo resta lo posterior', () => {
    const account = { cents: 100_000, asOf: '2026-10-05T00:00:00Z' }
    expect(summaryFor({ account, salaryCents: 1 }, txs)?.balanceCrcCents).toBe(98_000)
  })
  it('sin cuenta usa salario + movimientos; sin ninguno, null', () => {
    expect(summaryFor({ account: null, salaryCents: 100_000 }, txs)?.balanceCrcCents).toBe(93_000)
    expect(summaryFor({ account: null, salaryCents: null }, txs)).toBeNull()
  })
})

describe('MOV-04jm-T01: un gasto SINPE baja el saldo (los SINPE de la app del BAC no mandan correo)', () => {
  const account = { cents: 58_930_00, asOf: '2026-10-30T10:00:00-06:00' }
  const sinpe = (direction: 'in' | 'out', paymentMethod: 'cash' | 'sinpe') =>
    ({ amountCents: 3_500_00, currency: 'CRC' as const, direction, occurredAt: '2026-10-30T10:05:00-06:00', paymentMethod })
  const saldo = (m: ReturnType<typeof sinpe>) => summaryFor({ account, salaryCents: null }, [m])?.balanceCrcCents
  it('AC-1: gasto SINPE → ₡55 430', () => expect(saldo(sinpe('out', 'sinpe'))).toBe(55_430_00))
  it('AC-2: gasto en efectivo → ₡55 430', () => expect(saldo(sinpe('out', 'cash'))).toBe(55_430_00))
  it('AC-3: ingreso SINPE → ₡62 430', () => expect(saldo(sinpe('in', 'sinpe'))).toBe(62_430_00))
})

describe('TC-11jm-T02 AC-2: el "Pago de tarjeta" no baja el saldo (ya restan las cuotas)', () => {
  it('₡50 000 con forma card_payment deja el saldo igual; en efectivo sí lo baja', () => {
    const account = { cents: 100_000_00, asOf: '2026-10-30T10:00:00-06:00' }
    const pago = (paymentMethod: 'cash' | 'card_payment') =>
      ({ amountCents: 50_000_00, currency: 'CRC' as const, direction: 'out' as const, occurredAt: '2026-10-30T11:00:00-06:00', paymentMethod })
    expect(summaryFor({ account, salaryCents: null }, [pago('card_payment')])?.balanceCrcCents).toBe(100_000_00)
    expect(summaryFor({ account, salaryCents: null }, [pago('cash')])?.balanceCrcCents).toBe(50_000_00)
  })
})
