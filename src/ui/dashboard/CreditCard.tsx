import { nextCreditDates } from '../../domain/credit'
import { formatDay, formatMoney } from '../format'

type Props = { pending: { crcCents: number; usdCents: number }; limitCents: number | null; now: Date }

// TC-01jm-T05: recuerda corte y pago y dice cuánto queda tras pagar la deuda (solo CRC; USD aparte).
export function CreditCard({ pending, limitCents, now }: Props) {
  const { cutAt, dueAt } = nextCreditDates(now)
  return (
    <section className="card" aria-labelledby="credit-title" style={{ display: 'grid', gap: 8 }}>
      <h2 id="credit-title">Tarjeta de crédito</h2>
      <p className="muted" style={{ margin: 0 }}>Próximo corte: {formatDay(cutAt)} · Próximo pago: {formatDay(dueAt)}</p>
      <p className="amount" style={{ margin: 0 }}>Deuda pendiente: {formatMoney(pending.crcCents, 'CRC')}</p>
      {pending.usdCents > 0 && <p className="muted amount" style={{ margin: 0 }}>Deuda en dólares: {formatMoney(pending.usdCents, 'USD')}</p>}
      <LimitLine limitCents={limitCents} hasDebt={pending.crcCents > 0} />
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
