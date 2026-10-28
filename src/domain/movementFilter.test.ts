import { describe, expect, it } from 'vitest'
import {
  activePreset, applyFilter, clearedFilter, filterTotals, initialFilter, presetRange, validateFilter,
  type FilterMovement, type MovementFilter,
} from './movementFilter'

// 1 nov 2026 00:30 en Costa Rica = 06:30 UTC.
const now = new Date('2026-11-01T06:30:00Z')

const m = (occurredAt: string, amountCents: number, direction: 'in' | 'out', currency: 'CRC' | 'USD' = 'CRC'): FilterMovement =>
  ({ occurredAt, amountCents, direction, currency })
const f = (from: string | null, to: string | null, direction: MovementFilter['direction'] = 'all'): MovementFilter =>
  ({ from, to, direction })

describe('AC-1: rango de fechas en hora de Costa Rica', () => {
  const movements = [
    m('2026-10-09T23:59:59-06:00', 1, 'out'), // día anterior a "Desde"
    m('2026-10-10T00:00:00-06:00', 2, 'out'), // inicio de "Desde": entra
    m('2026-10-12T23:59:00-06:00', 3, 'out'), // 23:59 CR del último día: entra
    m('2026-10-13T00:00:00-06:00', 4, 'out'), // 00:00 CR del día siguiente: no entra
  ]
  it('incluye completos el día "Desde" y el día "Hasta"', () => {
    expect(applyFilter(movements, f('2026-10-10', '2026-10-12')).map((x) => x.amountCents)).toEqual([2, 3])
  })
  it('sin fechas no recorta; un solo extremo recorta solo ese lado', () => {
    expect(applyFilter(movements, f(null, null))).toHaveLength(4)
    expect(applyFilter(movements, f('2026-10-10', null)).map((x) => x.amountCents)).toEqual([2, 3, 4])
    expect(applyFilter(movements, f(null, '2026-10-12')).map((x) => x.amountCents)).toEqual([1, 2, 3])
  })
})

describe('AC-2: tipo', () => {
  const movements = [m('2026-10-10T10:00:00-06:00', 1, 'in'), m('2026-10-10T10:00:00-06:00', 2, 'out')]
  it('Ingresos, Gastos o Todos', () => {
    expect(applyFilter(movements, f(null, null, 'in')).map((x) => x.amountCents)).toEqual([1])
    expect(applyFilter(movements, f(null, null, 'out')).map((x) => x.amountCents)).toEqual([2])
    expect(applyFilter(movements, f(null, null, 'all'))).toHaveLength(2)
  })
})

describe('AC-3: accesos rápidos', () => {
  it('Este mes, Mes pasado, Últimos 7 días (incluye hoy) y Todo, según el día en CR', () => {
    expect(presetRange('thisMonth', now)).toEqual({ from: '2026-11-01', to: '2026-11-30' })
    expect(presetRange('lastMonth', now)).toEqual({ from: '2026-10-01', to: '2026-10-31' })
    expect(presetRange('last7', now)).toEqual({ from: '2026-10-26', to: '2026-11-01' })
    expect(presetRange('all', now)).toEqual({ from: null, to: null })
  })
  it('usa el día de Costa Rica, no el de UTC (21:00 CR del 30 oct = 31 oct UTC)', () => {
    const night = new Date('2026-10-31T03:00:00Z')
    expect(presetRange('thisMonth', night)).toEqual({ from: '2026-10-01', to: '2026-10-31' })
    expect(presetRange('last7', night)).toEqual({ from: '2026-10-24', to: '2026-10-30' })
    expect(presetRange('thisMonth', new Date('2026-11-01T05:59:59Z'))).toEqual({ from: '2026-10-01', to: '2026-10-31' })
  })
  it('limpiar deja todos los movimientos aunque el mes actual esté vacío', () => {
    const old = [m('2026-09-10T10:00:00-06:00', 1, 'out'), m('2026-10-10T10:00:00-06:00', 2, 'in')]
    expect(applyFilter(old, initialFilter(now))).toHaveLength(0)
    expect(applyFilter(old, clearedFilter)).toHaveLength(2)
  })
  it('mes pasado en enero cae en diciembre del año anterior', () => {
    expect(presetRange('lastMonth', new Date('2027-01-15T12:00:00Z'))).toEqual({ from: '2026-12-01', to: '2026-12-31' })
  })
  it('filtro inicial: Este mes, Todos; el acceso activo se reconoce por sus fechas', () => {
    expect(initialFilter(now)).toEqual(f('2026-11-01', '2026-11-30'))
    expect(activePreset(initialFilter(now), now)).toBe('thisMonth')
    expect(activePreset(f(null, null, 'out'), now)).toBe('all')
    expect(activePreset(f('2026-11-02', '2026-11-30'), now)).toBeNull()
  })
})

describe('AC-4: totales por moneda', () => {
  it('ingresos, gastos y neto en centavos; USD aparte', () => {
    const totals = filterTotals([
      m('2026-10-10T10:00:00-06:00', 100_000, 'in'), m('2026-10-10T10:00:00-06:00', 130_000, 'out'),
      m('2026-10-10T10:00:00-06:00', 500, 'out', 'USD'),
    ])
    expect(totals.CRC).toEqual({ incomeCents: 100_000, expenseCents: 130_000, netCents: -30_000 })
    expect(totals.USD).toEqual({ incomeCents: 0, expenseCents: 500, netCents: -500 })
  })
})

describe('AC-5: "Desde" posterior a "Hasta"', () => {
  it('es un error y el filtro no se aplica (lista completa)', () => {
    const movements = [m('2026-10-10T10:00:00-06:00', 1, 'in'), m('2026-10-20T10:00:00-06:00', 2, 'out')]
    expect(validateFilter(f('2026-10-20', '2026-10-10'))).toMatch(/Desde/)
    expect(validateFilter(f('2026-10-10', '2026-10-10'))).toBeNull()
    expect(validateFilter(f('2026-10-10', null))).toBeNull()
    expect(applyFilter(movements, f('2026-10-20', '2026-10-10', 'in'))).toEqual(movements)
  })
})
