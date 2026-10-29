import { useRef, useState } from 'react'
import type { Transaction } from '../../data/transactions'
import { applyFilter, clearedFilter, filterTotals, type MovementFilter } from '../../domain/movementFilter'
import { creditDueAt } from '../../domain/credit'
import { formatDate, formatDay, formatMoney } from '../format'
import { FilterTotals } from './FilterTotals'
import { MovementFilters } from './MovementFilters'
import { TransactionForm } from './TransactionForm'
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
        <FilteredList transactions={transactions} filter={filter} onFilterChange={onFilterChange} />
      )}
    </section>
  )
}

type FilteredListProps = Pick<TransactionsPanelProps, 'transactions' | 'filter' | 'onFilterChange'>

function FilteredList({ transactions, filter, onFilterChange }: FilteredListProps) {
  const now = new Date()
  // ponytail: filtra en el navegador lo ya cargado (PostgREST da máx. 1000 filas); filtrar en servidor si crece.
  const shown = applyFilter(transactions, filter)
  return (
    <>
      <MovementFilters filter={filter} now={now} onChange={onFilterChange} />
      <FilterTotals totals={filterTotals(shown)} />
      {shown.length === 0 ? (
        <div className="filtered-empty">
          <p className="muted">No hay movimientos con estos filtros</p>
          <button type="button" className="secondary" onClick={() => onFilterChange(clearedFilter)}>Limpiar filtros</button>
        </div>
      ) : <ul className="transactions-list">{shown.map(t => <TransactionRow key={t.id} transaction={t} />)}</ul>}
    </>
  )
}

function TransactionRow({ transaction: t }: { transaction: Transaction }) {
  const incoming = t.direction === 'in'
  return (
    <li className="transaction-row">
      <div className="transaction-description">
        <span>{t.description}</span>
        <span className="muted"><time dateTime={t.occurredAt}>{formatDate(t.occurredAt)}</time></span>
        <span className="muted">{originLabel(t)}</span>
      </div>
      <div className="transaction-amount">
        <span className="amount">{incoming ? '+' : '−'}{formatMoney(t.amountCents, t.currency)}</span>
        <span className="muted">{incoming ? 'Ingreso' : 'Gasto'}</span>
      </div>
    </li>
  )
}

function originLabel(t: Transaction): string {
  if (t.paymentMethod === 'credit') return `Tarjeta · se paga el ${formatDay(creditDueAt(t.occurredAt))}`
  return t.source.startsWith('email_') ? 'Correo BAC' : 'Manual'
}
