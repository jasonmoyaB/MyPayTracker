import type { Currency } from './bankEmail'
import { CR_OFFSET_MS } from './date'
import type { MonthStats } from './monthStats'
import type { SummaryMovement } from './summary'

export type FilterMovement = SummaryMovement & { occurredAt: string }
// Fechas `YYYY-MM-DD` en hora de Costa Rica; null = sin límite de ese lado.
export type MovementFilter = { from: string | null; to: string | null; direction: 'all' | 'in' | 'out' }
export type Preset = 'thisMonth' | 'lastMonth' | 'last7' | 'all'
export type Range = Pick<MovementFilter, 'from' | 'to'>

export const PRESETS: Preset[] = ['thisMonth', 'lastMonth', 'last7', 'all']
const DAY_MS = 86400000

// Medianoche de Costa Rica de ese día, en ms epoch.
const crMidnight = (day: string) => Date.parse(`${day}T00:00:00-06:00`)
const ymd = (utcMs: number) => new Date(utcMs).toISOString().slice(0, 10)

export function validateFilter(f: MovementFilter): string | null {
  return f.from && f.to && f.from > f.to ? 'La fecha "Desde" no puede ser posterior a "Hasta".' : null
}

// "Desde" incluido desde las 00:00 CR; "Hasta" incluido hasta antes de las 00:00 CR del día siguiente.
// Un filtro inválido no filtra: se devuelve la lista completa.
export function applyFilter<T extends FilterMovement>(movements: T[], f: MovementFilter): T[] {
  if (validateFilter(f)) return movements
  const start = f.from ? crMidnight(f.from) : -Infinity
  const end = f.to ? crMidnight(f.to) + DAY_MS : Infinity
  return movements.filter((m) => {
    const at = Date.parse(m.occurredAt)
    return at >= start && at < end && (f.direction === 'all' || m.direction === f.direction)
  })
}

export function filterTotals(movements: FilterMovement[]): Record<Currency, MonthStats> {
  const totals = { CRC: { incomeCents: 0, expenseCents: 0, netCents: 0 }, USD: { incomeCents: 0, expenseCents: 0, netCents: 0 } }
  for (const m of movements) {
    const t = totals[m.currency]
    if (m.direction === 'in') t.incomeCents += m.amountCents
    else t.expenseCents += m.amountCents
    t.netCents = t.incomeCents - t.expenseCents
  }
  return totals
}

export function presetRange(preset: Preset, now: Date): Range {
  const local = new Date(now.getTime() - CR_OFFSET_MS)
  const y = local.getUTCFullYear()
  const mo = local.getUTCMonth()
  const today = Date.UTC(y, mo, local.getUTCDate())
  if (preset === 'thisMonth') return { from: ymd(Date.UTC(y, mo, 1)), to: ymd(Date.UTC(y, mo + 1, 0)) }
  if (preset === 'lastMonth') return { from: ymd(Date.UTC(y, mo - 1, 1)), to: ymd(Date.UTC(y, mo, 0)) }
  if (preset === 'last7') return { from: ymd(today - 6 * DAY_MS), to: ymd(today) }
  return { from: null, to: null }
}

// Limpiar = sin fechas ni tipo (no el filtro inicial: si este mes está vacío, limpiar no haría nada).
export const clearedFilter: MovementFilter = { from: null, to: null, direction: 'all' }

export const initialFilter = (now: Date): MovementFilter => ({ ...presetRange('thisMonth', now), direction: 'all' })

export function activePreset(f: MovementFilter, now: Date): Preset | null {
  return PRESETS.find((p) => {
    const r = presetRange(p, now)
    return r.from === f.from && r.to === f.to
  }) ?? null
}
