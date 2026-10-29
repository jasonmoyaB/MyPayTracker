import { describe, expect, it } from 'vitest'
import { recommend } from './recommend'

const beforeCut = new Date('2026-10-03T12:00:00-06:00') // compra en tarjeta se paga el 20 oct (próximo pago)
const afterCut = new Date('2026-11-10T12:00:00-06:00') // entre corte y pago: primer pago el 20 dic, no el próximo 20 nov
const base = { priceCents: 20_000_000, balanceCents: 15_000_000, extraCents: 0, salaryCents: 15_000_000, scheduleCrc: {} }

describe('TC-02jm: recommend', () => {
  it('AC-2: ₡200 000 en un pago que vence el próximo 20 con ₡150 000 → No, faltan ₡50 000', () => {
    const r = recommend({ ...base, plan: 1, now: beforeCut })
    expect(r).toMatchObject({ verdict: 'no', reason: 'pago', leftCents: -5_000_000 })
  })
  it('AC-2: el mismo pago en un mes futuro supera el salario → No por salario', () => {
    expect(recommend({ ...base, plan: 1, now: afterCut })).toMatchObject({ verdict: 'no', reason: 'salario' })
  })
  it('AC-3: a 6 meses la cuota es 22 % del salario → Sí', () => {
    const r = recommend({ ...base, plan: 6, now: afterCut })
    expect(r).toMatchObject({ verdict: 'si', cuotaCents: 3_333_335, months: 6 })
    expect(r.shareOfSalary).toBeCloseTo(0.222, 3)
  })
  it('AC-3: a 3 meses la cuota es 44 % → Ajustado', () => {
    expect(recommend({ ...base, plan: 3, now: afterCut })).toMatchObject({ verdict: 'ajustado', cuotaCents: 6_666_668 })
  })
  it('AC-4: con ₡100 000 extra el pago del próximo 20 alcanza → Sí', () => {
    expect(recommend({ ...base, plan: 1, extraCents: 10_000_000, now: beforeCut }))
      .toMatchObject({ verdict: 'si', leftCents: 5_000_000 })
  })
  it('la deuda que vence el próximo 20 resta del disponible; las cuotas ya agendadas suman al mes', () => {
    const scheduleCrc = { '2026-11-20T06:00:00.000Z': 5_000_000, '2026-12-20T06:00:00.000Z': 10_000_000 }
    const r = recommend({ ...base, priceCents: 3_000_000, plan: 3, scheduleCrc, now: afterCut })
    expect(r.leftCents).toBe(10_000_000)
    expect(r.worstMonthCents).toBe(11_000_000) // 20 dic: 100 000 previos + 10 000 de la nueva cuota
    expect(r.verdict).toBe('ajustado')
  })
  it('efectivo: compara contra el disponible', () => {
    expect(recommend({ ...base, priceCents: 1_000_000, plan: 'cash', now: afterCut }))
      .toMatchObject({ verdict: 'si', leftCents: 14_000_000, cuotaCents: null })
  })
  it('sin salario solo evalúa el próximo pago', () => {
    expect(recommend({ ...base, salaryCents: null, plan: 3, now: afterCut }))
      .toMatchObject({ verdict: 'si', shareOfSalary: null })
  })
})
