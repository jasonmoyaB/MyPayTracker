import { describe, expect, it } from 'vitest'
import type { Recommendation } from '../../domain/recommend'
import { formatMoney } from '../format'
import { affordText } from './affordText'

const r = (over: Partial<Recommendation>): Recommendation => ({ verdict: 'si', reason: null, leftCents: 0, months: 3,
  cuotaCents: 3_000_000, firstDueAt: '2026-12-20T06:00:00.000Z', worstMonthCents: 3_000_000, shareOfSalary: 0.2, monthly: [], ...over })

describe('TC-02jm: textos de la recomendación', () => {
  it('cuota, plazo y primer pago', () => {
    expect(affordText(r({})).lines[0]).toBe(`Cuota de ${formatMoney(3_000_000, 'CRC')} al mes por 3 meses; primer pago el 20 dic.`)
  })
  it('no por el próximo pago', () => {
    const t = affordText(r({ verdict: 'no', reason: 'pago', leftCents: -5_000_000 }))
    expect(t.tone).toBe('danger')
    expect(t.lines.at(-1)).toBe(`No te la recomiendo: al pagar el próximo 20 te faltarían ${formatMoney(5_000_000, 'CRC')}.`)
  })
  it('no por el salario', () => {
    expect(affordText(r({ verdict: 'no', reason: 'salario', worstMonthCents: 20_000_000, shareOfSalary: 1.33 })).lines.at(-1))
      .toBe(`No te la recomiendo: un mes pagarías ${formatMoney(20_000_000, 'CRC')} en cuotas, más que tu salario.`)
  })
  it('ajustado con el porcentaje', () => {
    const t = affordText(r({ verdict: 'ajustado', reason: 'salario', shareOfSalary: 0.444 }))
    expect(t.tone).toBe('warning')
    expect(t.lines.at(-1)).toBe('Puedes, pero ajustado: tus cuotas serían el 44 % de tu salario (lo sano es hasta 30 %).')
  })
  it('sí, y sin salario pide registrarlo', () => {
    expect(affordText(r({ leftCents: 1_000_000 })).lines.at(-1)).toBe(`Sí, puedes: hoy te quedan ${formatMoney(1_000_000, 'CRC')} y tus cuotas son el 20 % de tu salario.`)
    expect(affordText(r({ shareOfSalary: null })).lines.at(-1)).toContain('Registra tu salario en Cuenta')
  })
  it('efectivo: sin línea de cuota', () => {
    const t = affordText(r({ months: null, cuotaCents: null, firstDueAt: null, leftCents: 2_000_000 }))
    expect(t.lines).toEqual([`Sí, te quedarían ${formatMoney(2_000_000, 'CRC')}.`])
  })
})
