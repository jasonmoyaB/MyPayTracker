import { dueBy, installmentDues, nextPayDay } from './credit.ts'

// TC-02jm-T03: plazos de tasa cero de BAC Costa Rica (18–36 meses son de Panamá); 1 = tarjeta en un pago.
export const PLANS = ['cash', 1, 3, 6, 10, 12] as const
export type Plan = (typeof PLANS)[number]

// Regla común de endeudamiento: las cuotas no deberían pasar del 30 % del salario.
const HEALTHY_SHARE = 0.3

export type Recommendation = {
  verdict: 'si' | 'ajustado' | 'no'
  reason: 'pago' | 'salario' | null
  leftCents: number // disponible después del próximo pago (y de la compra si vence ahí)
  months: number | null
  cuotaCents: number | null
  firstDueAt: string | null
  worstMonthCents: number | null // cuotas del mes más cargado después del próximo pago
  shareOfSalary: number | null
  // SIM-01jm-T01: por cada cuota nueva, todo lo que vence ese 20 y lo que queda libre (null sin salario).
  monthly: { dueAt: string; cuotasCents: number; freeCents: number | null }[]
}

export type Input = {
  priceCents: number; plan: Plan; balanceCents: number; extraCents: number
  salaryCents: number | null; scheduleCrc: Record<string, number>; now: Date
  spendCents?: number // SIM-01jm-T03: gasto promedio del mes (sin tarjeta); solo resta en la tabla mes a mes
}

// Lo que vence hasta el próximo 20 sale del saldo de hoy (+ plata extra); lo posterior, del salario de cada mes.
export function recommend({ priceCents, plan, balanceCents, extraCents, salaryCents, scheduleCrc, now, spendCents = 0 }: Input): Recommendation {
  const payDay = nextPayDay(now)
  const available = balanceCents + extraCents - dueBy(scheduleCrc, payDay)
  if (plan === 'cash') {
    const leftCents = available - priceCents
    return { verdict: leftCents >= 0 ? 'si' : 'no', reason: leftCents >= 0 ? null : 'pago', leftCents,
      months: null, cuotaCents: null, firstDueAt: null, worstMonthCents: null, shareOfSalary: null, monthly: [] }
  }
  const dues = installmentDues(now.toISOString(), priceCents, plan)
  const schedule = { ...scheduleCrc }
  for (const d of dues) schedule[d.dueAt] = (schedule[d.dueAt] ?? 0) + d.cents
  const leftCents = available - dues.filter((d) => d.dueAt <= payDay).reduce((sum, d) => sum + d.cents, 0)
  const worstMonthCents = Math.max(0, ...Object.entries(schedule).filter(([at]) => at > payDay).map(([, cents]) => cents))
  const shareOfSalary = salaryCents ? worstMonthCents / salaryCents : null
  // Misma regla que el veredicto: el próximo 20 sale del saldo (leftCents); los siguientes, del salario.
  const monthly = dues.map(({ dueAt }) => ({ dueAt, cuotasCents: schedule[dueAt],
    freeCents: dueAt <= payDay ? leftCents : salaryCents === null ? null : salaryCents - schedule[dueAt] - spendCents }))
  const result = { leftCents, months: plan, cuotaCents: dues[0].cents, firstDueAt: dues[0].dueAt, worstMonthCents, shareOfSalary, monthly }
  if (leftCents < 0) return { ...result, verdict: 'no', reason: 'pago' }
  if (salaryCents !== null && worstMonthCents > salaryCents) return { ...result, verdict: 'no', reason: 'salario' }
  if (shareOfSalary !== null && shareOfSalary > HEALTHY_SHARE) return { ...result, verdict: 'ajustado', reason: 'salario' }
  return { ...result, verdict: 'si', reason: null }
}

// TC-03jm-T01: la misma recomendación para cada plazo con tarjeta, para compararlos de un vistazo.
export const comparePlans = (input: Omit<Input, 'plan'>): Recommendation[] =>
  PLANS.filter((plan) => plan !== 'cash').map((plan) => recommend({ ...input, plan }))
