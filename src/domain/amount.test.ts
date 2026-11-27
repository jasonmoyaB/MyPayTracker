import { describe, expect, it } from 'vitest'
import { parseAmountToCents, parseFeeToCents } from './amount'
import { installmentDues } from './credit'

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

describe('TC-12jm-T01: comisión de la tasa cero', () => {
  it('AC-1: ₡120 000 + comisión ₡6 000 a 12 meses → ₡126 000 y cuota ₡10 500', () => {
    const total = 120_000_00 + parseFeeToCents('6000')!
    expect(total).toBe(126_000_00)
    expect(installmentDues('2026-11-27T15:00:00-06:00', total, 12).map((d) => d.cents)).toEqual(Array(12).fill(10_500_00))
  })
  it('AC-2: vacía (o 0) → sin comisión', () => {
    for (const t of ['', '  ', '0', '0.00']) expect(parseFeeToCents(t)).toBe(0)
  })
  it('AC-3: negativa o texto → inválida', () => {
    for (const t of ['-6000', 'seis mil', '6000.123']) expect(parseFeeToCents(t)).toBeNull()
  })
})
