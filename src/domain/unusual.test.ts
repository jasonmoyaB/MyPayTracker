import { describe, expect, it } from 'vitest'
import { formatAmount } from './notification'
import { unusualExpense, unusualNotification } from './unusual'

const out = (amountCents: number, description = 'AUTO MERCADO', currency: 'CRC' | 'USD' = 'CRC') =>
  ({ direction: 'out' as const, amountCents, currency, description })
const history = [out(30_000_00), out(28_000_00, 'Auto  Mercádo'), out(32_000_00, 'auto mercado ')]

describe('ALR-01jm-T01: unusualExpense', () => {
  it('AC-1: más del doble de la mediana del mismo comercio → aviso con la mediana', () => {
    expect(unusualExpense(out(95_000_00), history)).toEqual({ typicalCents: 30_000_00 })
  })
  it('AC-2: ₡55 000 no pasa del doble → sin aviso', () => {
    expect(unusualExpense(out(55_000_00), history)).toBeNull()
  })
  it('AC-3: solo 2 anteriores → sin aviso', () => {
    expect(unusualExpense(out(95_000_00), history.slice(0, 2))).toBeNull()
  })
  it('AC-4: historial en USD y nuevo en CRC → sin aviso; otros comercios no cuentan', () => {
    expect(unusualExpense(out(95_000_00), history.map((h) => ({ ...h, currency: 'USD' as const })))).toBeNull()
    expect(unusualExpense(out(95_000_00), [...history.slice(0, 2), out(1_00, 'WALMART')])).toBeNull()
  })
  it('mediana con cantidad par; ingresos, ingresos previos y pagos de tarjeta no se evalúan', () => {
    expect(unusualExpense(out(95_000_00), [...history, out(40_000_00)])).toEqual({ typicalCents: 31_000_00 })
    expect(unusualExpense({ ...out(95_000_00), direction: 'in' }, history)).toBeNull()
    expect(unusualExpense(out(95_000_00), history.map((h) => ({ ...h, direction: 'in' as const })))).toBeNull()
    const pago = 'PAGO TARJETA CREDITO'
    expect(unusualExpense(out(95_000_00, pago), history.map((h) => ({ ...h, description: pago })))).toBeNull()
  })
  it('payload "Gasto inusual: AUTO MERCADO ₡95 000 (normal ₡30 000)"', () => {
    expect(unusualNotification(out(95_000_00), 30_000_00)).toEqual({ title: 'Gasto inusual',
      body: `AUTO MERCADO ${formatAmount(95_000_00, 'CRC')} (normal ${formatAmount(30_000_00, 'CRC')})` })
  })
})
