import { describe, expect, it } from 'vitest'
import { centsToNumeric, numericToCents } from './money'

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
