import { useId, useRef } from 'react'
import { nextCutAt, nextPayDay, type pendingPurchases } from '../../domain/credit'
import { formatDay, formatMoney } from '../format'
import { DebtForm } from './DebtForm'

type Pending = { crcCents: number; usdCents: number; dueAt: string | null; scheduleCrc: Record<string, number> }
type Purchase = ReturnType<typeof pendingPurchases>[number]
type Props = {
  pending: Pending; limitCents: number | null; salaryCents: number | null; now: Date; onSaved: () => void
  dueNextCents: number; purchases: Purchase[]
}

// TC-01jm-T05: recuerda corte y pago y dice cuánto queda tras pagar la deuda (solo CRC; USD aparte).
// UX-05jm-T01: fechas en el encabezado, cifras en recuadros y productos en lista, con las clases de los otros cards.
export function CreditCard({ pending, limitCents, salaryCents, now, onSaved, dueNextCents, purchases }: Props) {
  return (
    <section className="card" aria-labelledby="credit-title" style={{ display: 'grid', gap: 12 }}>
      <div className="dashboard-heading">
        <h2 id="credit-title" style={{ margin: 0 }}>Tarjeta de crédito</h2>
        <p className="muted" style={{ margin: 0 }}>
          Corte {formatDay(nextCutAt(now))}{pending.dueAt && ` · Pago ${formatDay(pending.dueAt)}`}
        </p>
      </div>
      <dl className="dashboard-month">
        <div><dt>Deuda total</dt><dd className="amount">{formatMoney(pending.crcCents, 'CRC')}</dd></div>
        {/* TC-05jm-T03: lo que vence el próximo 20, solo CRC. */}
        {pending.crcCents > 0 && <div><dt>Pagas el {formatDay(nextPayDay(now))}</dt><dd className="amount">{formatMoney(dueNextCents, 'CRC')}</dd></div>}
      </dl>
      {pending.usdCents > 0 && <p className="muted amount" style={{ margin: 0 }}>Deuda en dólares: {formatMoney(pending.usdCents, 'USD')}</p>}
      <LimitLine limitCents={limitCents} hasDebt={pending.crcCents > 0} />
      <SalaryLine scheduleCrc={pending.scheduleCrc} salaryCents={salaryCents} />
      {purchases.length > 0 && <ul className="dashboard-list" aria-label="Productos en deuda">
        {purchases.map((p, i) => <PurchaseRow key={i} purchase={p} />)}
      </ul>}
      <DebtForm onSaved={onSaved} />
    </section>
  )
}

// TC-06jm-T01: <dialog> nativo; Esc, foco atrapado y vuelta del foco al botón los da el navegador.
function PurchaseRow({ purchase: p }: { purchase: Purchase }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const money = (cents: number) => formatMoney(cents, p.currency)
  return (
    <li>
      <button type="button" className="dashboard-row-button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        <span className="dashboard-text">
          <span>{p.description}</span>
          <span className="muted">{p.count} {p.count === 1 ? 'cuota' : 'cuotas'} · próxima {money(p.nextCents)} el {formatDay(p.nextDueAt)}</span>
        </span>
        <span className="amount">{money(p.remainingCents)}</span>
      </button>
      <dialog ref={dialog} aria-labelledby={titleId} className="dashboard-dialog">
        <h3 id={titleId} style={{ margin: 0 }}>{p.description}</h3>
        <p style={{ margin: 0 }}>Falta {money(p.remainingCents)}</p>
        <table>
          <caption className="muted">Cuotas pendientes</caption>
          <thead><tr><th scope="col">Fecha</th><th scope="col">Cuota</th></tr></thead>
          <tbody>{p.dues.map(d => <tr key={d.dueAt}><td>{formatDay(d.dueAt)}</td><td>{money(d.cents)}</td></tr>)}</tbody>
        </table>
        <form method="dialog"><button type="submit">Cerrar</button></form>
      </dialog>
    </li>
  )
}

function LimitLine({ limitCents, hasDebt }: { limitCents: number | null; hasDebt: boolean }) {
  if (limitCents === null) return null
  if (limitCents >= 0) return <p className="status-success amount" style={{ margin: 0 }}>Puedes gastar {formatMoney(limitCents, 'CRC')}</p>
  // Sin deuda el saldo negativo ya lo avisa BalanceCard.
  if (!hasDebt) return null
  return <p className="status-danger amount" style={{ margin: 0 }}>Al pagar te faltarían {formatMoney(-limitCents, 'CRC')}</p>
}

// TC-02jm-T05: un día de pago futuro que no cabe en el salario de ese mes.
function SalaryLine({ scheduleCrc, salaryCents }: { scheduleCrc: Record<string, number>; salaryCents: number | null }) {
  const [dueAt, cents] = Object.entries(scheduleCrc).reduce((worst, entry) => (entry[1] > worst[1] ? entry : worst), ['', 0])
  if (salaryCents === null || cents <= salaryCents) return null
  return <p className="status-warning amount" style={{ margin: 0 }}>El pago del {formatDay(dueAt)} ({formatMoney(cents, 'CRC')}) supera tu salario</p>
}
