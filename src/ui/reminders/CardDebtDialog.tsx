import { useId, useRef, type ReactNode } from 'react'
import type { Transaction } from '../../data/transactions'
import { pendingPurchases, splitCredit } from '../../domain/credit'
import { outsideRect } from '../dashboard/CreditCard'
import { formatDay, formatMoney } from '../format'

type Props = { transactions: Transaction[]; now: Date; children: ReactNode }

// REC-01jm-T09: toda la deuda de la tarjeta en un <dialog> nativo, como el de cada producto (TC-06jm).
// Mismos datos que el Resumen: splitCredit da el total y el pago de cada 20; pendingPurchases, lo que falta por producto.
export function CardDebtDialog({ transactions, now, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const { pending } = splitCredit(transactions, now)
  const months = Object.entries(pending.scheduleCrc).sort(([a], [b]) => a.localeCompare(b))
  return (
    <>
      <button type="button" className="dashboard-row-button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        {children}
      </button>
      <dialog ref={dialog} aria-labelledby={titleId} className="dashboard-dialog"
        onClick={e => { if (e.target === e.currentTarget && outsideRect(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY)) e.currentTarget.close() }}>
        <h3 id={titleId} style={{ margin: 0 }}>Deuda de la tarjeta</h3>
        <p style={{ margin: 0 }}>Debes {formatMoney(pending.crcCents, 'CRC')}</p>
        {/* CRC y USD nunca se suman. */}
        {pending.usdCents > 0 && <p className="muted" style={{ margin: 0 }}>Y en dólares {formatMoney(pending.usdCents, 'USD')}</p>}
        <table>
          <caption className="muted">Pago por mes</caption>
          <thead><tr><th scope="col">Fecha</th><th scope="col">Pagas</th></tr></thead>
          <tbody>{months.map(([dueAt, cents]) => <tr key={dueAt}><td>{formatDay(dueAt)}</td><td>{formatMoney(cents, 'CRC')}</td></tr>)}</tbody>
        </table>
        <table>
          <caption className="muted">Por producto</caption>
          <thead><tr><th scope="col">Producto</th><th scope="col">Al mes</th><th scope="col">Falta</th></tr></thead>
          <tbody>{pendingPurchases(transactions, now).map((p, i) => (
            // REC-01jm-T11: "Al mes" = su próxima cuota (las siguientes son iguales o un céntimo menos).
            <tr key={i}><td>{p.description}</td><td>{formatMoney(p.nextCents, p.currency)}</td><td>{formatMoney(p.remainingCents, p.currency)}</td></tr>
          ))}</tbody>
        </table>
        <form method="dialog"><button type="submit">Cerrar</button></form>
      </dialog>
    </>
  )
}
