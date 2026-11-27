// REC-01jm-T02: con extensión; credit.ts (importado por la Edge Function) depende de este archivo.
import type { Currency } from './bankEmail.ts'
import { availableBalance, type Movement } from './balance.ts'
import { paidUntil, splitCredit, type CreditMovement, type PaymentMethod } from './credit.ts'
import { formatAmount } from './notification.ts'

export type SummaryMovement = Movement & { currency: Currency }

export type Summary = {
  balanceCrcCents: number
  incomeCrcCents: number
  expenseCrcCents: number
  usd: { incomeCents: number; expenseCents: number }
}

const total = (ms: SummaryMovement[], currency: Currency, direction: Movement['direction']) =>
  ms.filter((m) => m.currency === currency && m.direction === direction).reduce((sum, m) => sum + m.amountCents, 0)

// El saldo solo suma CRC; USD se muestra aparte sin convertir (fuera de alcance UI-01jm).
export function summarize(salaryCents: number, movements: SummaryMovement[]): Summary {
  return {
    balanceCrcCents: availableBalance(salaryCents, movements.filter((m) => m.currency === 'CRC')),
    incomeCrcCents: total(movements, 'CRC', 'in'),
    expenseCrcCents: total(movements, 'CRC', 'out'),
    usd: { incomeCents: total(movements, 'USD', 'in'), expenseCents: total(movements, 'USD', 'out') },
  }
}


// El saldo de la cuenta ya incluye todo lo anterior a `asOf`: solo se suman movimientos posteriores.
export function summarizeFromAccount(
  accountCents: number,
  asOf: string,
  movements: (SummaryMovement & { occurredAt: string })[],
): Summary {
  const since = Date.parse(asOf)
  return summarize(accountCents, movements.filter((m) => Date.parse(m.occurredAt) > since))
}

// BAL-01jm: con saldo de cuenta parte de ahí (el salario ya está dentro). Sin él: salario + movimientos.
// TC-01jm: recibe `settled` de splitCredit (las compras con tarjeta cuentan desde su día de pago).
// MCP-02jm-T01: vive en domain para que el Resumen y el conector MCP armen el saldo igual.
// TC-11jm-T02: el "Pago de tarjeta" explícito no baja el saldo: es el dinero de las cuotas que ya se restan.
// Los correos BAC de pago de tarjeta siguen restando (supuesto de la spec: no mover saldos ya cuadrados).
export function summaryFor(
  { account, salaryCents }: { account: { cents: number; asOf: string } | null; salaryCents: number | null },
  all: (SummaryMovement & { occurredAt: string; paymentMethod?: PaymentMethod })[],
): Summary | null {
  const movements = all.filter((m) => m.paymentMethod !== 'card_payment')
  if (account) return summarizeFromAccount(account.cents, account.asOf, movements)
  return salaryCents === null ? null : summarize(salaryCents, movements)
}

type SummarySettings = Parameters<typeof summaryFor>[0] & { cardPaidThrough?: string | null }

// BAL-02jm-T01: el saldo disponible de hoy tal como lo muestra el Resumen (cuotas pagadas sí, pendientes no).
export function availableNow(settings: SummarySettings, all: CreditMovement[], now: Date): number | null {
  const { settled } = splitCredit(all, paidUntil(settings.cardPaidThrough, now))
  return summaryFor(settings, settled)?.balanceCrcCents ?? null
}

// BAL-02jm-T01: diferencia entre lo que calculaba la app y el saldo real del BAC, para buscar lo que falta.
export function reconcileText(appCents: number, bacCents: number): string {
  const diff = appCents - bacCents
  if (diff === 0) return 'Cuadra con la app'
  return `La app tenía ${formatAmount(Math.abs(diff), 'CRC')} de ${diff > 0 ? 'más' : 'menos'}`
}
