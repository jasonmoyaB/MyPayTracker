import type { Currency } from './bankEmail'
import { CR_OFFSET_MS } from './date'

// `deadline` = mes límite 'AAAA-MM'. Montos en centavos de la moneda de la meta.
export type SavingsGoal = { id: string; name: string; targetCents: number; currency: Currency; deadline: string; savedCents: number }
export type GoalStatus = { kind: 'done' } | { kind: 'overdue'; missingCents: number } | { kind: 'saving'; monthlyCents: number; months: number }

// META-01jm-T02: los meses cuentan el mes CR en curso y el de la fecha límite; el aporte se redondea hacia arriba
// al céntimo para no quedar corto el último mes.
export function goalStatus(goal: SavingsGoal, now: Date): GoalStatus {
  const missingCents = goal.targetCents - goal.savedCents
  if (missingCents <= 0) return { kind: 'done' }
  const local = new Date(now.getTime() - CR_OFFSET_MS)
  const [y, m] = goal.deadline.split('-').map(Number)
  const months = y * 12 + m - (local.getUTCFullYear() * 12 + local.getUTCMonth() + 1) + 1
  if (months <= 0) return { kind: 'overdue', missingCents }
  return { kind: 'saving', monthlyCents: Math.ceil(missingCents / months), months }
}
