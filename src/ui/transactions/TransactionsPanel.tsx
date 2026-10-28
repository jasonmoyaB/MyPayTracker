import { useRef, useState } from 'react'
import type { Transaction } from '../../data/transactions'
import { formatDate, formatMoney } from '../format'
import { TransactionForm } from './TransactionForm'
import './transactions.css'

export type TransactionsPanelProps = {
  transactions: Transaction[]
  onTransactionSaved: () => void
}

export function TransactionsPanel({ transactions, onTransactionSaved }: TransactionsPanelProps) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = () => { setOpen(false); trigger.current?.focus() }
  const finish = () => { close(); setSaved(true); onTransactionSaved() }
  return (
    <section className="card transactions" aria-labelledby="transactions-title">
      <div className="transactions-heading">
        <h2 id="transactions-title">Movimientos</h2>
        <button ref={trigger} aria-expanded={open} aria-controls="manual-transaction"
          onClick={() => { setOpen(true); setSaved(false) }}>Registrar movimiento</button>
      </div>
      {saved && <p role="status" className="status-success">Movimiento guardado</p>}
      {open && <TransactionForm onSaved={finish} onCancel={close} />}
      {transactions.length === 0 ? <p className="muted">Aun no hay movimientos</p> : (
        <ul className="transactions-list">{transactions.map(t => <TransactionRow key={t.id} transaction={t} />)}</ul>
      )}
    </section>
  )
}

function TransactionRow({ transaction: t }: { transaction: Transaction }) {
  const incoming = t.direction === 'in'
  return (
    <li className="transaction-row">
      <div className="transaction-description">
        <span>{t.description}</span>
        <span className="muted"><time dateTime={t.occurredAt}>{formatDate(t.occurredAt)}</time></span>
        <span className="muted">{t.source.startsWith('email_') ? 'Correo BAC' : 'Manual'}</span>
      </div>
      <div className="transaction-amount">
        <span className="amount">{incoming ? '+' : '−'}{formatMoney(t.amountCents, t.currency)}</span>
        <span className="muted">{incoming ? 'Ingreso' : 'Gasto'}</span>
      </div>
    </li>
  )
}
