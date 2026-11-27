import { type BudgetMovement } from './budget'
import { categorize, type Category } from './category'
import { CR_OFFSET_MS } from './date'
import { costaRicaMonth, monthlyCharges } from './monthStats'

export type MonthComparison = { category: Category; thisCents: number; lastCents: number; diffCents: number }

// ANA-01jm-T01: este mes [inicio CR, ahora] contra el pasado hasta el mismo día (o su último día si es más corto),
// para no comparar medio mes contra un mes entero. Misma regla que budgetStatus (GAS-01jm). Solo CRC.
export function compareMonths(movements: BudgetMovement[], now: Date): MonthComparison[] {
  const categoryOf = categorize(movements)
  const { startMs } = costaRicaMonth(now)
  const local = new Date(now.getTime() - CR_OFFSET_MS)
  const y = local.getUTCFullYear()
  const mo = local.getUTCMonth()
  const lastDay = Math.min(local.getUTCDate(), new Date(Date.UTC(y, mo, 0)).getUTCDate())
  const lastStartMs = Date.UTC(y, mo - 1, 1) + CR_OFFSET_MS
  const lastEndMs = Date.UTC(y, mo - 1, lastDay + 1) + CR_OFFSET_MS
  const totals = new Map<Category, { thisCents: number; lastCents: number }>()
  for (const m of monthlyCharges(movements)) {
    const at = Date.parse(m.occurredAt)
    const isThis = at >= startMs && at <= now.getTime()
    if (m.direction !== 'out' || m.currency !== 'CRC' || (!isThis && (at < lastStartMs || at >= lastEndMs))) continue
    const c = categoryOf(m) as Category
    const t = totals.get(c) ?? { thisCents: 0, lastCents: 0 }
    if (isThis) t.thisCents += m.amountCents
    else t.lastCents += m.amountCents
    totals.set(c, t)
  }
  return [...totals].map(([category, t]) => ({ category, ...t, diffCents: t.thisCents - t.lastCents }))
    .sort((a, b) => Math.abs(b.diffCents) - Math.abs(a.diffCents))
}
