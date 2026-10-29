import { nextCutAt } from '../../domain/credit'
import { formatDay, formatMoney } from '../format'
import { DebtForm } from './DebtForm'

type Pending = { crcCents: number; usdCents: number; dueAt: string | null; scheduleCrc: Record<string, number> }
type Props = { pending: Pending; limitCents: number | null; salaryCents: number | null; now: Date; onSaved: () => void }

// TC-01jm-T05: recuerda corte y pago y dice cuánto queda tras pagar la deuda (solo CRC; USD aparte).
export function CreditCard({ pending, limitCents, salaryCents, now, onSaved }: Props) {
  return (
    <section className="card" aria-labelledby="credit-title" style={{ display: 'grid', gap: 8 }}>
      <h2 id="credit-title">Tarjeta de crédito</h2>
      <p className="muted" style={{ margin: 0 }}>
        Próximo corte: {formatDay(nextCutAt(now))}{pending.dueAt && ` · Próximo pago: ${formatDay(pending.dueAt)}`}
      </p>
      <p className="amount" style={{ margin: 0 }}>Deuda pendiente: {formatMoney(pending.crcCents, 'CRC')}</p>
      {pending.usdCents > 0 && <p className="muted amount" style={{ margin: 0 }}>Deuda en dólares: {formatMoney(pending.usdCents, 'USD')}</p>}
      <LimitLine limitCents={limitCents} hasDebt={pending.crcCents > 0} />
      <SalaryLine scheduleCrc={pending.scheduleCrc} salaryCents={salaryCents} />
      <DebtForm onSaved={onSaved} />
    </section>
  )
}

function LimitLine({ limitCents, hasDebt }: { limitCents: number | null; hasDebt: boolean }) {
  if (limitCents === null) return null
  if (limitCents >= 0) return <p className="status-success amount" style={{ margin: 0 }}>Puedes gastar {formatMoney(limitCents, 'CRC')} sin quedar en quiebra</p>
  // Sin deuda el saldo negativo ya lo avisa BalanceCard.
  if (!hasDebt) return null
  return <p className="status-danger amount" style={{ margin: 0 }}>Al pagar la tarjeta te faltarían {formatMoney(-limitCents, 'CRC')}: quedarías en quiebra</p>
}

// TC-02jm-T05: un día de pago futuro que no cabe en el salario de ese mes.
function SalaryLine({ scheduleCrc, salaryCents }: { scheduleCrc: Record<string, number>; salaryCents: number | null }) {
  const [dueAt, cents] = Object.entries(scheduleCrc).reduce((worst, entry) => (entry[1] > worst[1] ? entry : worst), ['', 0])
  if (salaryCents === null || cents <= salaryCents) return null
  return <p className="status-warning amount" style={{ margin: 0 }}>Tu pago del {formatDay(dueAt)} ({formatMoney(cents, 'CRC')}) supera tu salario</p>
}
