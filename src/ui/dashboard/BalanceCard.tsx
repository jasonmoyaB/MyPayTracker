import type { Settings } from '../../data/settings'
import type { Transaction } from '../../data/transactions'
import { summarize, summarizeFromAccount, type Summary } from '../../domain/summary'
import { formatMoney } from '../format'

// BAL-01jm: con saldo de cuenta parte de ahí (el salario ya está dentro). Sin él: salario + movimientos.
// TC-01jm: recibe `settled` de splitCredit (las compras con tarjeta cuentan desde su día de pago).
export function summaryFor({ account, salaryCents }: Settings, transactions: Transaction[]): Summary | null {
  if (account) return summarizeFromAccount(account.cents, account.asOf, transactions)
  return salaryCents === null ? null : summarize(salaryCents, transactions)
}

export function BalanceCard({ summary }: { summary: Summary | null }) {
  return (
    <section className="card dashboard-balance" aria-labelledby="balance-title">
      <h2 id="balance-title" tabIndex={-1}>Saldo disponible</h2>
      {summary ? <BalanceSummary summary={summary} /> : (
        <p className="muted">Registra tu saldo o salario en <a href="#/cuenta">Cuenta</a> para calcular cuánto tienes.</p>
      )}
    </section>
  )
}

function BalanceSummary({ summary }: { summary: Summary }) {
  const negative = summary.balanceCrcCents < 0
  return (
    <>
      <p className={`amount dashboard-big${negative ? ' negative' : ''}`}>{formatMoney(summary.balanceCrcCents, 'CRC')}</p>
      {negative && (
        <p className="status-danger">
          Saldo negativo: tus gastos superan tu saldo.
        </p>
      )}
      <UsdLine usd={summary.usd} />
    </>
  )
}

function UsdLine({ usd }: { usd: Summary['usd'] }) {
  if (usd.incomeCents === 0 && usd.expenseCents === 0) return null
  return (
    <p className="muted amount">
      Movimientos en dólares (no incluidos en el saldo): +{formatMoney(usd.incomeCents, 'USD')} / −{formatMoney(usd.expenseCents, 'USD')}
    </p>
  )
}
