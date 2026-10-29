import type { Transaction } from '../../data/transactions'
import { formatDate, formatMoney } from '../format'

type Props = { transactions: Transaction[]; lastEmailAt: string | null }

// La lista llega ordenada de más reciente a más antigua (listTransactions).
export function RecentMovements({ transactions, lastEmailAt }: Props) {
  const recent = transactions.slice(0, 5)
  return (
    <section className="card dashboard-recent" aria-labelledby="recent-title">
      <div className="dashboard-heading">
        <h2 id="recent-title">Últimos movimientos</h2>
        <a href="#/movimientos">Ver todos</a>
      </div>
      {recent.length === 0 ? <p className="muted">Aún no hay movimientos.</p> : (
        <ul className="dashboard-list">{recent.map((t) => <Row key={t.id} t={t} />)}</ul>
      )}
      <p className="muted">
        {lastEmailAt ? `Último correo leído: ${formatDate(lastEmailAt)}` : 'Aún no se ha leído ningún correo.'}
      </p>
    </section>
  )
}

function Row({ t }: { t: Transaction }) {
  const incoming = t.direction === 'in'
  return (
    <li>
      <span className="dashboard-text">
        {t.description}
        <span className="muted"><time dateTime={t.occurredAt}>{formatDate(t.occurredAt)}</time></span>
      </span>
      <span className="amount">
        {incoming ? '+' : '−'}{formatMoney(t.amountCents, t.currency)}
        <span className="muted">{incoming ? 'Ingreso' : 'Gasto'}</span>
      </span>
    </li>
  )
}
