import type { Transaction } from '../../data/transactions'

// STUB — lo implementa el worker B. Contrato fijo de props.
export type BalancePanelProps = {
  salaryCents: number | null
  transactions: Transaction[]
  onSalarySaved: () => void
}

export function BalancePanel(_props: BalancePanelProps) {
  return <section className="card"><h2>Saldo disponible</h2><p className="muted">Pendiente</p></section>
}
