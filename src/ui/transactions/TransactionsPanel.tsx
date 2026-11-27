import { useRef, useState } from 'react'
import { setTransactionCategory, type Transaction } from '../../data/transactions'
import { categorize, type Category } from '../../domain/category'
import { applyFilter, clearedFilter, filterTotals, type MovementFilter } from '../../domain/movementFilter'
import { creditDueAt } from '../../domain/credit'
import { movementsCsv } from '../../domain/csv'
import { costaRicaDateTime } from '../../domain/date'
import { monthlyCharges } from '../../domain/monthStats'
import { formatDate, formatDay, formatMoney } from '../format'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'
import { CategorySelect } from './CategorySelect'
import { FilterTotals } from './FilterTotals'
import { MovementFilters } from './MovementFilters'
import { planLabel, TransactionForm } from './TransactionForm'
import './transactions.css'

export type TransactionsPanelProps = {
  transactions: Transaction[]
  filter: MovementFilter
  onFilterChange: (filter: MovementFilter) => void
  onTransactionSaved: () => void
}

export function TransactionsPanel({ transactions, filter, onFilterChange, onTransactionSaved }: TransactionsPanelProps) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = () => { setOpen(false); trigger.current?.focus() }
  const finish = () => { close(); onTransactionSaved() }
  return (
    <section className="card transactions" aria-labelledby="transactions-title">
      <div className="transactions-heading">
        <h2 id="transactions-title" tabIndex={-1}>Movimientos</h2>
        <button ref={trigger} aria-expanded={open} aria-controls="manual-transaction"
          onClick={() => setOpen(true)}>Registrar movimiento</button>
      </div>
      {open && <TransactionForm onSaved={finish} onCancel={close} />}
      {transactions.length === 0 ? <p className="muted">Aun no hay movimientos</p> : (
        <FilteredList transactions={transactions} filter={filter} onFilterChange={onFilterChange} onSaved={onTransactionSaved} />
      )}
    </section>
  )
}

type FilteredListProps = Pick<TransactionsPanelProps, 'transactions' | 'filter' | 'onFilterChange'> & { onSaved: () => void }

function FilteredList({ transactions, filter, onFilterChange, onSaved }: FilteredListProps) {
  const now = new Date()
  // CAT-01jm-T04: el historial de categorías sale de todo lo cargado, no solo de lo filtrado.
  const categoryOf = categorize(transactions)
  // ponytail: filtra en el navegador lo ya cargado (PostgREST da máx. 1000 filas); filtrar en servidor si crece.
  const shown = applyFilter(transactions, filter)
  return (
    <>
      <MovementFilters filter={filter} now={now} onChange={onFilterChange} />
      {/* GAS-01jm-T02: los totales cuentan lo que se paga en el rango; la lista muestra cada movimiento tal cual. */}
      <FilterTotals totals={filterTotals(applyFilter(monthlyCharges(transactions), filter))} />
      <button type="button" className="secondary" disabled={shown.length === 0}
        onClick={() => downloadCsv(movementsCsv(shown, categoryOf), now)}>Exportar CSV</button>
      {shown.length === 0 ? (
        <div className="filtered-empty">
          <p className="muted">No hay movimientos con estos filtros</p>
          <button type="button" className="secondary" onClick={() => onFilterChange(clearedFilter)}>Limpiar filtros</button>
        </div>
      ) : <ul className="transactions-list">{shown.map(t => <TransactionRow key={t.id} transaction={t} category={categoryOf(t)} onSaved={onSaved} />)}</ul>}
    </>
  )
}

type RowProps = { transaction: Transaction; category: Category | null; onSaved: () => void }

function TransactionRow({ transaction: t, category, onSaved }: RowProps) {
  const incoming = t.direction === 'in'
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  async function change(c: Category) {
    setSaving(true)
    const failed = await saveWithToast(() => setTransactionCategory(t.id, c), toast, 'Categoría guardada')
    setSaving(false)
    if (!failed) onSaved()
  }
  return (
    <li className="transaction-row">
      <div className="transaction-description">
        <span>{t.description}</span>
        <span className="muted"><time dateTime={t.occurredAt}>{formatDate(t.occurredAt)}</time></span>
        <span className="muted">{originLabel(t)}</span>
        {category && <CategorySelect value={category} onChange={(c) => void change(c)} disabled={saving} />}
      </div>
      <div className="transaction-amount">
        <span className="amount">{incoming ? '+' : '−'}{formatMoney(t.amountCents, t.currency)}</span>
        <span className="muted">{incoming ? 'Ingreso' : 'Gasto'}</span>
      </div>
    </li>
  )
}

function originLabel(t: Transaction): string {
  const due = formatDay(creditDueAt(t.occurredAt))
  if (t.paymentMethod === 'credit' && t.installments > 1) return `Tarjeta · ${planLabel(t.installments).toLowerCase()} · primera cuota el ${due}`
  if (t.paymentMethod === 'credit') return `Tarjeta · se paga el ${due}`
  const origin = t.source.startsWith('email_') ? 'Correo BAC' : 'Manual'
  // MOV-02jm-T02: SINPE se paga como efectivo; solo se distingue en la etiqueta.
  if (t.paymentMethod === 'card_payment') return `Pago de tarjeta · ${origin}` // TC-11jm-T03
  return t.paymentMethod === 'sinpe' ? `SINPE · ${origin}` : origin
}

// ANA-02jm-T02: descarga en el navegador, sin servidor; la URL se revoca al terminar para no dejar el Blob vivo.
function downloadCsv(csv: string, now: Date) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `movimientos-${costaRicaDateTime(now).slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
