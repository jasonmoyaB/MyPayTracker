// ALR-01jm-T01: cobro muy por encima de lo normal en un comercio (error o fraude). Imports .ts: lo usa el cron (Deno).
import { normalize } from './category.ts'
import { formatAmount, type MovementInput } from './notification.ts'
import { isCardPayment } from './reminder.ts'

const MIN_HISTORY = 3

// Mediana (no promedio) de los gastos previos del mismo comercio y moneda: un cobro raro viejo no la infla.
export function unusualExpense(m: MovementInput, history: MovementInput[]): { typicalCents: number } | null {
  if (m.direction !== 'out' || isCardPayment(m.description)) return null
  const key = normalize(m.description)
  const prev = history.filter((h) => h.direction === 'out' && h.currency === m.currency && normalize(h.description) === key)
    .map((h) => h.amountCents).sort((a, b) => a - b)
  if (prev.length < MIN_HISTORY) return null
  const mid = prev.length >> 1
  const typicalCents = prev.length % 2 ? prev[mid] : Math.round((prev[mid - 1] + prev[mid]) / 2)
  return m.amountCents > 2 * typicalCents ? { typicalCents } : null
}

export function unusualNotification(m: MovementInput, typicalCents: number) {
  return { title: 'Gasto inusual', body: `${m.description.trim()} ${formatAmount(m.amountCents, m.currency)} (normal ${formatAmount(typicalCents, m.currency)})` }
}
