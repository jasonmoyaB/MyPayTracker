import { describe, expect, it } from 'vitest'
import { parseAmountToCents } from './amount'

describe('parseAmountToCents: texto del usuario → centavos sin float', () => {
  it('acepta enteros, decimales y comas de miles', () => {
    expect(parseAmountToCents('3490')).toBe(349_000)
    expect(parseAmountToCents('3490.5')).toBe(349_050)
    expect(parseAmountToCents(' 3,490.50 ')).toBe(349_050)
    expect(parseAmountToCents('0.07')).toBe(7)
  })
  it('rechaza vacío, cero, negativos, letras y más de 2 decimales', () => {
    for (const bad of ['', '0', '-5', 'abc', '12.345', '1.2.3', '1,23']) expect(parseAmountToCents(bad)).toBeNull()
  })
})
