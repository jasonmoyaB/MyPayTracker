import type { Currency } from './bankEmail'
import { availableBalance, type Movement } from './balance'

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

