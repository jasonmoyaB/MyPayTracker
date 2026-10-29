import type { TopExpense } from '../../domain/monthStats'
import { formatMoney } from '../format'

export function TopExpenses({ items }: { items: TopExpense[] }) {
  return (
    <section className="card" aria-labelledby="top-title">
      <h2 id="top-title">Más gasto este mes</h2>
      {items.length === 0 ? <p className="muted">Sin gastos este mes.</p> : (
        <ol className="dashboard-list">
          {items.map((t) => (
            <li key={t.description}>
              <span className="dashboard-text">{t.description}</span>
              <span className="amount">−{formatMoney(t.cents, 'CRC')}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
