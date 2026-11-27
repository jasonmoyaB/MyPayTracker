import type { MonthComparison } from '../../domain/compare'
import '../balance/plan-table.css'
import { formatMoney, formatSigned } from '../format'

// ANA-01jm-T02: tabla accesible como PlanTable; sin gráfico (spec).
export function CompareCard({ rows }: { rows: MonthComparison[] }) {
  return (
    <section className="card" aria-labelledby="compare-title">
      <h2 id="compare-title">Contra el mes pasado</h2>
      {rows.length === 0 ? <p className="muted">Sin gastos para comparar.</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="plan-table amount">
            <caption>Gastos por categoría al mismo día del mes</caption>
            <thead>
              <tr><th scope="col">Categoría</th><th scope="col">Este mes</th><th scope="col">Mes pasado</th><th scope="col">Diferencia</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.category}>
                  <td>{r.category}</td>
                  <td>{formatMoney(r.thisCents, 'CRC')}</td>
                  <td>{formatMoney(r.lastCents, 'CRC')}</td>
                  <td>{formatSigned(r.diffCents, 'CRC')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
