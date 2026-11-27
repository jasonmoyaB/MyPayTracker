import type { monthEndProjection } from '../../domain/projection'
import { formatMoney, formatSigned } from '../format'

// PROY-01jm-T02: cada resta con su monto en texto; el negativo lo dice "Te faltarían" (no solo el color).
export function ProjectionCard({ p }: { p: ReturnType<typeof monthEndProjection> }) {
  const short = p.endCents < 0
  return (
    <section className="card" aria-labelledby="projection-title">
      <h2 id="projection-title">Fin de mes</h2>
      <p className={`amount ${short ? 'status-danger' : 'status-success'}`} style={{ margin: 0 }}>
        {short ? 'Te faltarían' : 'Te quedarían'} {formatSigned(p.endCents, 'CRC')}
      </p>
      <dl className="dashboard-month">
        <div><dt>Cuotas de tarjeta hasta fin de mes</dt><dd className="amount expense">−{formatMoney(p.cardCents, 'CRC')}</dd></div>
        <div><dt>Gastos fijos apartados</dt><dd className="amount expense">−{formatMoney(p.reservedCents, 'CRC')}</dd></div>
        <div><dt>Lo que falta del gasto típico</dt><dd className="amount expense">−{formatMoney(p.remainingTypicalCents, 'CRC')}</dd></div>
      </dl>
    </section>
  )
}
