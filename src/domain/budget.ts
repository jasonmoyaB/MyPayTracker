// PRES-01jm-T02: con extensión porque la Edge Function (Deno) importa este archivo.
import { categorize, type Category, type CategoryMovement } from './category.ts'
import { costaRicaMonth, monthlyCharges, type SpendMovement } from './monthStats.ts'
import { formatAmount } from './notification.ts'

export type Budget = { category: Category; limitCents: number }
export type BudgetStatus = Budget & { spentCents: number; percent: number }
export type BudgetMovement = SpendMovement & CategoryMovement & { installments?: number }

const WARN_PERCENT = 80

// Gastado este mes CR por categoría con la regla de GAS-01jm (cuota en su mes, sin pagos de tarjeta). Solo CRC.
// El historial de categorías se arma con los movimientos originales (monthlyCharges solo mueve fecha y monto).
export function budgetStatus(budgets: Budget[], movements: BudgetMovement[], now: Date): BudgetStatus[] {
  const categoryOf = categorize(movements)
  const { startMs, endMs } = costaRicaMonth(now)
  const spent = new Map<Category | null, number>()
  for (const m of monthlyCharges(movements)) {
    const at = Date.parse(m.occurredAt)
    if (m.direction !== 'out' || m.currency !== 'CRC' || at < startMs || at >= endMs) continue
    const c = categoryOf(m)
    spent.set(c, (spent.get(c) ?? 0) + m.amountCents)
  }
  return budgets.map((b) => {
    const spentCents = spent.get(b.category) ?? 0
    // Entero hacia abajo: 79,99 % todavía no es el 80 %.
    return { ...b, spentCents, percent: Math.floor((spentCents * 100) / b.limitCents) }
  })
}

// 'warn' al llegar al 80 %; 'exceeded' al pasar el tope. El cron reclama cada uno una vez por mes.
export function budgetAlert(s: BudgetStatus) {
  const kind = s.spentCents > s.limitCents ? 'exceeded' : s.percent >= WARN_PERCENT ? 'warn' : null
  if (!kind) return null
  const body = `${s.category}: llevas ${formatAmount(s.spentCents, 'CRC')} de ${formatAmount(s.limitCents, 'CRC')}`
  return { kind, title: kind === 'warn' ? 'Presupuesto' : 'Presupuesto superado', body, url: '/#/resumen' } as const
}
