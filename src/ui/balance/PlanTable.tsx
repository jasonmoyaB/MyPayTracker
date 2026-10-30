import type { Recommendation } from '../../domain/recommend'
import { formatDay, formatMoney } from '../format'
import { TONE } from './affordText'
import './plan-table.css'

const VERDICT = { si: 'Sí', ajustado: 'Ajustado', no: 'No' } as const
// UX-06jm-T01: corto para que quepa en el móvil; "tasa cero" va en el caption.
const shortPlan = (n: number) => (n === 1 ? 'Un pago' : `${n} meses`)

// TC-03jm-T01: cuota mensual de cada plazo (la primera lleva el resto de centavos) con su recomendación.
export function PlanTable({ rows }: { rows: Recommendation[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="plan-table amount">
        <caption>Cuota por plazo (tasa cero)</caption>
        <thead>
          <tr><th scope="col">Plazo</th><th scope="col">Cuota al mes</th><th scope="col">Primer pago</th><th scope="col">¿Alcanza?</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.months}>
              <td>{shortPlan(r.months ?? 1)}</td>
              <td>{formatMoney(r.cuotaCents ?? 0, 'CRC')}</td>
              <td>{r.firstDueAt && formatDay(r.firstDueAt)}</td>
              <td><span className={`status-${TONE[r.verdict]}`}>{VERDICT[r.verdict]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// SIM-01jm-T02: mes a mes con la compra nueva; sin salario los meses siguientes no tienen libre ("—").
export function MonthTable({ rows, spendCents = 0 }: { rows: Recommendation['monthly']; spendCents?: number }) {
  if (rows.length === 0) return null
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="plan-table amount">
        <caption>
          Lo que te queda libre cada mes
          {spendCents > 0 && <span className="muted"> (ya resta {formatMoney(spendCents, 'CRC')} de gastos promedio)</span>}
        </caption>
        <thead>
          <tr><th scope="col">Mes</th><th scope="col">Cuotas</th><th scope="col">Libre</th></tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.dueAt}>
              <td>{formatDay(m.dueAt)}</td>
              <td>{formatMoney(m.cuotasCents, 'CRC')}</td>
              {m.freeCents === null ? <td>—</td>
                : <td className={m.freeCents < 0 ? 'status-danger' : undefined}>{formatMoney(m.freeCents, 'CRC')}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
