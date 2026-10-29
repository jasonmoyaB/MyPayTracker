import { CR_OFFSET_MS } from './date'
import type { SummaryMovement } from './summary'

// TC-01jm: una sola tarjeta (la de la hermana) con corte y pago fijos; sin config (ponytail).
const CUT_DAY = 6
const DUE_DAY = 20

export type PaymentMethod = 'cash' | 'credit'
// TC-02jm: `installments` = plazo de tasa cero (1 = un pago); opcional para no tocar a quien no lo usa.
export type CreditMovement = SummaryMovement & { paymentMethod: PaymentMethod; occurredAt: string; installments?: number }

// Día `day` a las 00:00 CR del mes local de `ref`, o del siguiente si ya pasó `limitDay`. Date.UTC pasa dic → ene.
function crDay(ref: Date, day: number, limitDay: number): string {
  const local = new Date(ref.getTime() - CR_OFFSET_MS)
  const next = local.getUTCDate() > limitDay ? 1 : 0
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + next, day) + CR_OFFSET_MS).toISOString()
}

// TC-01jm-T02: hasta el día de corte (inclusive, hora CR) se paga el 20 de ese mes; después, el del siguiente.
export function creditDueAt(occurredAt: string): string {
  return crDay(new Date(occurredAt), DUE_DAY, CUT_DAY)
}

// TC-02jm-T02: cuota k el 20 del mes k después del primer pago; el resto de centavos va en la primera.
// ponytail: cuotas iguales sin la comisión de BAC por plazo; agregarla si el dev la conoce.
export function installmentDues(occurredAt: string, amountCents: number, n: number): { dueAt: string; cents: number }[] {
  const first = new Date(creditDueAt(occurredAt))
  const base = Math.floor(amountCents / n)
  return Array.from({ length: n }, (_, k) => {
    const due = new Date(first)
    due.setUTCMonth(first.getUTCMonth() + k) // el 20 existe en todos los meses: no hay desborde
    return { dueAt: due.toISOString(), cents: k === 0 ? amountCents - base * (n - 1) : base }
  })
}

// Próximo día de pago (20); el mismo 20 aún cuenta mientras sea ese día en CR.
export function nextPayDay(now: Date): string {
  return crDay(now, DUE_DAY, DUE_DAY)
}

// Lo que vence hasta `at` (incluida). Claves ISO UTC: comparar texto = comparar fechas.
export function dueBy(scheduleCrc: Record<string, number>, at: string): number {
  return Object.entries(scheduleCrc).reduce((sum, [dueAt, cents]) => (dueAt <= at ? sum + cents : sum), 0)
}

// El día de corte aún cuenta como "próximo" mientras sea ese día en CR.
export function nextCutAt(now: Date): string {
  return crDay(now, CUT_DAY, CUT_DAY)
}

// TC-01jm-T02: la compra con tarjeta es un gasto cuya fecha efectiva es su pago. Así el ancla de
// saldo de cuenta (BAL-01jm) no la resta dos veces si es posterior al pago.
export function splitCredit<T extends CreditMovement>(movements: T[], now: Date) {
  const settled: T[] = []
  // TC-01jm-T06: dueAt = pago más temprano de lo pendiente. TC-02jm: scheduleCrc = CRC por fecha de pago.
  const pending = { crcCents: 0, usdCents: 0, dueAt: null as string | null, scheduleCrc: {} as Record<string, number> }
  for (const m of movements) {
    if (m.paymentMethod !== 'credit') { settled.push(m); continue }
    for (const { dueAt, cents } of installmentDues(m.occurredAt, m.amountCents, m.installments ?? 1)) {
      if (Date.parse(dueAt) <= now.getTime()) { settled.push({ ...m, amountCents: cents, occurredAt: dueAt }); continue }
      if (pending.dueAt === null || dueAt < pending.dueAt) pending.dueAt = dueAt
      if (m.currency === 'USD') { pending.usdCents += cents; continue }
      pending.crcCents += cents
      pending.scheduleCrc[dueAt] = (pending.scheduleCrc[dueAt] ?? 0) + cents
    }
  }
  return { settled, pending }
}

// TC-04jm-T02: deuda que ya venía pagando = compra con tarjeta por lo que queda, en tantas cuotas como quepan
// (máximo el plazo). Entre el corte y el 20 la fecha se lleva al corte de este mes: así su primera cuota vence
// este 20 (nextPayDay) y no el del mes siguiente, que inflaría "Puedes gastar".
// TC-05jm-T01: con la cuota que ya paga al mes, las cuotas salen de ella (tope 12, el check de 0009), no del plazo.
export function ongoingPurchase(priceCents: number, months: number, remainingCents: number, now: Date, monthlyCents?: number) {
  const installments = monthlyCents
    ? Math.min(12, Math.ceil(remainingCents / monthlyCents))
    : Math.max(1, Math.min(months, Math.ceil(remainingCents / Math.floor(priceCents / months))))
  const day = new Date(now.getTime() - CR_OFFSET_MS).getUTCDate()
  const occurredAt = day > CUT_DAY && day <= DUE_DAY ? crDay(now, CUT_DAY, 31) : now.toISOString()
  return { installments, occurredAt }
}

// TC-05jm-T01: lo que falta de cada compra con tarjeta; mismo criterio que splitCredit (vencida = pagada).
export function pendingPurchases<T extends CreditMovement & { description: string }>(movements: T[], now: Date) {
  return movements.flatMap((m) => {
    if (m.paymentMethod !== 'credit') return []
    const left = installmentDues(m.occurredAt, m.amountCents, m.installments ?? 1).filter((d) => Date.parse(d.dueAt) > now.getTime())
    if (left.length === 0) return []
    return [{ description: m.description, currency: m.currency, remainingCents: left.reduce((sum, d) => sum + d.cents, 0), count: left.length, nextCents: left[0].cents, nextDueAt: left[0].dueAt, dues: left }]
  })
}
