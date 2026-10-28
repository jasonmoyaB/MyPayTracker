import { CR_OFFSET_MS } from './date'
import type { SummaryMovement } from './summary'

export type MonthMovement = SummaryMovement & { occurredAt: string; description: string; source: string }
export type MonthStats = { incomeCents: number; expenseCents: number; netCents: number }
export type TopExpense = { description: string; cents: number }

// Inicio (incluido) y fin (excluido) del mes en curso en hora de Costa Rica, en ms epoch.
export function costaRicaMonth(now: Date): { startMs: number; endMs: number } {
  const local = new Date(now.getTime() - CR_OFFSET_MS)
  const y = local.getUTCFullYear()
  const mo = local.getUTCMonth()
  return { startMs: Date.UTC(y, mo, 1) + CR_OFFSET_MS, endMs: Date.UTC(y, mo + 1, 1) + CR_OFFSET_MS }
}

function thisMonthCrc<T extends MonthMovement>(movements: T[], now: Date): T[] {
  const { startMs, endMs } = costaRicaMonth(now)
  return movements.filter((m) => {
    const at = Date.parse(m.occurredAt)
    return m.currency === 'CRC' && at >= startMs && at < endMs
  })
}

// Solo colones: USD se muestra aparte sin convertir.
export function monthStats(movements: MonthMovement[], now: Date): MonthStats {
  let incomeCents = 0
  let expenseCents = 0
  for (const m of thisMonthCrc(movements, now)) {
    if (m.direction === 'in') incomeCents += m.amountCents
    else expenseCents += m.amountCents
  }
  return { incomeCents, expenseCents, netCents: incomeCents - expenseCents }
}

// "Comercio" = descripción tal cual (sin agrupar variantes).
export function topExpenses(movements: MonthMovement[], now: Date, n = 3): TopExpense[] {
  const totals = new Map<string, number>()
  for (const m of thisMonthCrc(movements, now)) {
    if (m.direction === 'out') totals.set(m.description, (totals.get(m.description) ?? 0) + m.amountCents)
  }
  return [...totals].map(([description, cents]) => ({ description, cents }))
    .sort((a, b) => b.cents - a.cents).slice(0, n)
}

export function lastEmailMovement(movements: Pick<MonthMovement, 'occurredAt' | 'source'>[]): string | null {
  let latest: string | null = null
  for (const m of movements) {
    if (m.source.startsWith('email_') && (latest === null || Date.parse(m.occurredAt) > Date.parse(latest))) latest = m.occurredAt
  }
  return latest
}
