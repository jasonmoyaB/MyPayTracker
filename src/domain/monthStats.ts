import type { PaymentMethod } from './credit'
import { CR_OFFSET_MS } from './date'
import { isCardPayment } from './reminder'
import type { SummaryMovement } from './summary'

export type MonthMovement = SummaryMovement & { occurredAt: string; description: string; source: string }
export type SpendMovement = MonthMovement & { paymentMethod: PaymentMethod }
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

// SIM-01jm-T03: gasto típico del mes para "¿Puedo comprar esto?". Sin compras con tarjeta (ya restan como cuotas)
// ni pagos de tarjeta (serían esas mismas cuotas otra vez). Divide solo entre meses con movimientos: con menos
// de 3 meses de historial no subestima.
// ponytail: promedio simple de 3 meses; mediana o más meses si un gasto raro lo infla.
export function avgMonthlySpend(movements: SpendMovement[], now: Date): number {
  const { startMs: endMs } = costaRicaMonth(now)
  const local = new Date(now.getTime() - CR_OFFSET_MS)
  const startMs = Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - 3, 1) + CR_OFFSET_MS
  const months = new Set<number>()
  let cents = 0
  for (const m of movements) {
    const at = Date.parse(m.occurredAt)
    if (m.currency !== 'CRC' || at < startMs || at >= endMs) continue
    months.add(new Date(at - CR_OFFSET_MS).getUTCMonth())
    if (m.direction === 'out' && m.paymentMethod !== 'credit' && !isCardPayment(m.description)) cents += m.amountCents
  }
  return months.size ? Math.round(cents / months.size) : 0
}
