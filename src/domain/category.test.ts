import { describe, expect, it } from 'vitest'
import { categorize, type CategoryMovement } from './category'

const out = (description: string, extra: Partial<CategoryMovement> = {}): CategoryMovement =>
  ({ description, direction: 'out', occurredAt: '2026-11-10T12:00:00-06:00', ...extra })

describe('CAT-01jm-T02: categoría efectiva de un gasto', () => {
  it('AC-1: por palabras del comercio', () => {
    const m = out('AUTO MERCADO ESCAZU')
    expect(categorize([m])(m)).toBe('Súper')
  })
  it('AC-2: la última que puse a mano a la misma descripción (sin mayúsculas, tildes ni espacios extra)', () => {
    const old = out('soda la esquina', { category: 'Salud', occurredAt: '2026-10-01T12:00:00-06:00' })
    const manual = out('SODA  LA ESQUINA ', { category: 'Comida', occurredAt: '2026-11-01T12:00:00-06:00' })
    const nuevo = out('Sodá la Esquina')
    expect(categorize([nuevo, old, manual])(nuevo)).toBe('Comida')
  })
  it('AC-3: la guardada gana a las palabras', () => {
    const m = out('AUTO MERCADO ESCAZU', { category: 'Salud' })
    expect(categorize([m])(m)).toBe('Salud')
  })
  it('AC-4: sin categoría, historial ni palabras → Otros', () => {
    const m = out('COMERCIO DESCONOCIDO')
    expect(categorize([m])(m)).toBe('Otros')
  })
  it('palabras completas: "servicentro" es Transporte, no Servicios por "ice"; ingresos sin categoría', () => {
    const m = out('SERVICENTRO LA GALERA')
    const income = out('AUTO MERCADO', { direction: 'in' })
    const f = categorize([m, income])
    expect(f(m)).toBe('Transporte')
    expect(f(income)).toBeNull()
    expect(f(out("MCDONALD'S CURRIDABAT"))).toBe('Comida')
  })
})
