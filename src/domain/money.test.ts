import { describe, expect, it } from 'vitest'
import { centsToNumeric, numericToCents, usdToCrcCents } from './money'

describe('money: numeric de Postgres ↔ centavos sin float', () => {
  it('numericToCents', () => {
    expect(numericToCents('3490.00')).toBe(349_000)
    expect(numericToCents('20.5')).toBe(2_050)
    expect(numericToCents('7')).toBe(700)
    expect(numericToCents(12345.67)).toBe(1_234_567)
  })
  it('centsToNumeric', () => {
    expect(centsToNumeric(349_005)).toBe('3490.05')
    expect(centsToNumeric(7)).toBe('0.07')
  })
})

describe('USD-01jm-T02: equivalente en colones', () => {
  it('AC-1: $100,00 a 505,32 → ₡50 532,00', () => {
    expect(usdToCrcCents(100_00, 505_32)).toBe(50_532_00)
  })
  it('AC-2: $0,01 a 505,32 → ₡5,05 (redondeo al céntimo)', () => {
    expect(usdToCrcCents(1, 505_32)).toBe(5_05)
  })
})
