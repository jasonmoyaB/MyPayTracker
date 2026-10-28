import type { Currency } from '../../domain/bankEmail'
import type { MonthStats } from '../../domain/monthStats'
import { formatSigned } from '../format'

const LABELS: Record<Currency, string> = { CRC: 'Colones', USD: 'Dólares' }

// El signo y la etiqueta dicen lo mismo que el color. USD solo si hay movimientos en dólares.
export function FilterTotals({ totals }: { totals: Record<Currency, MonthStats> }) {
  const hasUsd = totals.USD.incomeCents > 0 || totals.USD.expenseCents > 0
  return (
    <div className="filter-totals" aria-live="polite">
      <TotalsLine currency="CRC" stats={totals.CRC} />
      {hasUsd && <TotalsLine currency="USD" stats={totals.USD} />}
    </div>
  )
}

function TotalsLine({ currency, stats }: { currency: Currency; stats: MonthStats }) {
  return (
    <dl aria-label={LABELS[currency]}>
      <div><dt>Ingresos</dt><dd className="amount income">{formatSigned(stats.incomeCents, currency)}</dd></div>
      <div><dt>Gastos</dt><dd className="amount expense">{formatSigned(-stats.expenseCents, currency)}</dd></div>
      <div><dt>Neto</dt><dd className={`amount ${stats.netCents < 0 ? 'expense' : 'income'}`}>{formatSigned(stats.netCents, currency)}</dd></div>
    </dl>
  )
}
