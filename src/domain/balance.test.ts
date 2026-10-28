import { describe, expect, it } from 'vitest'
import { availableBalance, canAfford } from './balance'

// Montos en centavos enteros para evitar errores de float.
const txs = [
  { amountCents: 50_000, direction: 'in' as const },
  { amountCents: 20_000, direction: 'out' as const },
]

describe('AC-5: canAfford', () => {
  it('saldo = salario + ingresos − gastos', () => {
    expect(availableBalance(100_000, txs)).toBe(130_000)
  })
  it('alcanza cuando el saldo es mayor o igual al precio', () => {
    expect(canAfford(100_000, txs, 130_000)).toBe(true)
  })
  it('no alcanza cuando el precio supera el saldo', () => {
    expect(canAfford(100_000, txs, 130_001)).toBe(false)
  })
})
