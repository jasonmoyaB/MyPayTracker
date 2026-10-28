import type { MonthStats } from '../../domain/monthStats'
import { formatMoney } from '../format'

const signed = (cents: number) => `${cents < 0 ? '−' : '+'}${formatMoney(Math.abs(cents), 'CRC')}`

// El signo y la etiqueta dicen lo mismo que el color (no depende solo del color).
export function MonthCards({ stats }: { stats: MonthStats }) {
  const empty = stats.incomeCents === 0 && stats.expenseCents === 0
  return (
    <section className="card" aria-labelledby="month-title">
      <h2 id="month-title">Este mes</h2>
      {empty ? <p className="muted">Sin movimientos este mes.</p> : (
        <dl className="dashboard-month">
          <div><dt>Ingresos</dt><dd className="amount income">+{formatMoney(stats.incomeCents, 'CRC')}</dd></div>
          <div><dt>Gastos</dt><dd className="amount expense">−{formatMoney(stats.expenseCents, 'CRC')}</dd></div>
          <div><dt>Neto</dt><dd className={`amount ${stats.netCents < 0 ? 'expense' : 'income'}`}>{signed(stats.netCents)}</dd></div>
        </dl>
      )}
    </section>
  )
}
