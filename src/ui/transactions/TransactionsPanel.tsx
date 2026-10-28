import type { Transaction } from '../../data/transactions'

// STUB — lo implementa el worker C. Contrato fijo de props.
export type TransactionsPanelProps = {
  transactions: Transaction[]
  onTransactionSaved: () => void
}

export function TransactionsPanel(_props: TransactionsPanelProps) {
  return <section className="card"><h2>Movimientos</h2><p className="muted">Pendiente</p></section>
}
