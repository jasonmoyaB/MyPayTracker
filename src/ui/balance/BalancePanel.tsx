import type { Transaction } from '../../data/transactions'
import { summarize, type Summary } from '../../domain/summary'
import { formatMoney } from '../format'
import { AffordCheck } from './AffordCheck'
import { SalarySection } from './SalarySection'

export type BalancePanelProps = {
  salaryCents: number | null
  transactions: Transaction[]
  onSalarySaved: () => void
}

export function BalancePanel({ salaryCents, transactions, onSalarySaved }: BalancePanelProps) {
  const summary = salaryCents === null ? null : summarize(salaryCents, transactions)
  return (
    <section className="card" aria-labelledby="balance-title">
      <h2 id="balance-title">Saldo disponible</h2>
      {summary && <BalanceSummary summary={summary} />}
      <SalarySection salaryCents={salaryCents} onSalarySaved={onSalarySaved} />
      {summary && <AffordCheck balanceCents={summary.balanceCrcCents} />}
    </section>
  )
}

const bigAmount = { margin: 0, fontSize: 'clamp(36px, 11vw, 48px)', fontWeight: 600, lineHeight: 1.1, overflowWrap: 'anywhere' } as const

function BalanceSummary({ summary }: { summary: Summary }) {
  const negative = summary.balanceCrcCents < 0
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <p className="amount" style={{ ...bigAmount, color: negative ? 'var(--color-danger)' : 'var(--color-text)' }}>
        {formatMoney(summary.balanceCrcCents, 'CRC')}
      </p>
      {negative && (
        <p className="status-danger" style={{ margin: 0 }}>
          Tu saldo es negativo: tus gastos superan tu salario más tus ingresos.
        </p>
      )}
      <p className="muted amount" style={{ margin: 0 }}>
        Ingresos: +{formatMoney(summary.incomeCrcCents, 'CRC')} · Gastos: −{formatMoney(summary.expenseCrcCents, 'CRC')}
      </p>
      <UsdLine usd={summary.usd} />
    </div>
  )
}

function UsdLine({ usd }: { usd: Summary['usd'] }) {
  if (usd.incomeCents === 0 && usd.expenseCents === 0) return null
  return (
    <p className="muted amount" style={{ margin: 0 }}>
      Movimientos en dólares (no incluidos en el saldo): +{formatMoney(usd.incomeCents, 'USD')} / −{formatMoney(usd.expenseCents, 'USD')}
    </p>
  )
}
