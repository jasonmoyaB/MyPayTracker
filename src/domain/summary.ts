// REC-01jm-T02: con extensión; credit.ts (importado por la Edge Function) depende de este archivo.
import type { Currency } from './bankEmail.ts'
import { availableBalance, type Movement } from './balance.ts'

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
export function summaryFor(
  { account, salaryCents }: { account: { cents: number; asOf: string } | null; salaryCents: number | null },
  movements: (SummaryMovement & { occurredAt: string })[],
): Summary | null {
  if (account) return summarizeFromAccount(account.cents, account.asOf, movements)
  return salaryCents === null ? null : summarize(salaryCents, movements)
}
