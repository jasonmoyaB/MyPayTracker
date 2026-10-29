import { nextCutAt } from '../../domain/credit'
import { formatDay, formatMoney } from '../format'

type Pending = { crcCents: number; usdCents: number; dueAt: string | null; scheduleCrc: Record<string, number> }
type Props = { pending: Pending; limitCents: number | null; salaryCents: number | null; now: Date }

// TC-01jm-T05: recuerda corte y pago y dice cuánto queda tras pagar la deuda (solo CRC; USD aparte).
export function CreditCard({ pending, limitCents, salaryCents, now }: Props) {
  return (
    <section className="card dashboard-credit" aria-labelledby="credit-title">
      <h2 id="credit-title">Tarjeta de crédito</h2>
      <p className="muted">
        Próximo corte: {formatDay(nextCutAt(now))}{pending.dueAt && ` · Próximo pago: ${formatDay(pending.dueAt)}`}
      </p>
      <p className="amount">Deuda pendiente: {formatMoney(pending.crcCents, 'CRC')}</p>
      {pending.usdCents > 0 && <p className="muted amount">Deuda en dólares: {formatMoney(pending.usdCents, 'USD')}</p>}
      <LimitLine limitCents={limitCents} hasDebt={pending.crcCents > 0} />
      <SalaryLine scheduleCrc={pending.scheduleCrc} salaryCents={salaryCents} />
    </section>
  )
}

function LimitLine({ limitCents, hasDebt }: { limitCents: number | null; hasDebt: boolean }) {
  if (limitCents === null) return null
  if (limitCents >= 0) return <p className="status-success amount">Puedes gastar {formatMoney(limitCents, 'CRC')} sin quedar en quiebra</p>
  // Sin deuda el saldo negativo ya lo avisa BalanceCard.
  if (!hasDebt) return null
  return <p className="status-danger amount">Al pagar la tarjeta te faltarían {formatMoney(-limitCents, 'CRC')}: quedarías en quiebra</p>
}

// TC-02jm-T05: un día de pago futuro que no cabe en el salario de ese mes.
function SalaryLine({ scheduleCrc, salaryCents }: { scheduleCrc: Record<string, number>; salaryCents: number | null }) {
  const [dueAt, cents] = Object.entries(scheduleCrc).reduce((worst, entry) => (entry[1] > worst[1] ? entry : worst), ['', 0])
  if (salaryCents === null || cents <= salaryCents) return null
  return <p className="status-warning amount">Tu pago del {formatDay(dueAt)} ({formatMoney(cents, 'CRC')}) supera tu salario</p>
}
