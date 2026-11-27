import type { BudgetStatus } from '../../domain/budget'
import { formatMoney } from '../format'

// PRES-01jm-T04: la barra es <progress> nativo y el porcentaje va en texto (no solo color).
export function BudgetCard({ status }: { status: BudgetStatus[] }) {
  if (status.length === 0) return null
  return (
    <section className="card" aria-labelledby="budgets-title">
      <h2 id="budgets-title">Presupuestos</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {status.map((s) => (
          <li key={s.category} style={{ display: 'grid', gap: 4 }}>
            <span>{s.category}: <span className="amount">{formatMoney(s.spentCents, 'CRC')} de {formatMoney(s.limitCents, 'CRC')}</span> · {s.percent} %</span>
            <progress max={100} value={Math.min(s.percent, 100)} aria-label={`${s.category}: ${s.percent} % del tope`} style={{ width: '100%' }} />
          </li>
        ))}
      </ul>
    </section>
  )
}
