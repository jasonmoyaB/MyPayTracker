import { goalStatus, type SavingsGoal } from '../../domain/savings'
import { formatMoney } from '../format'

// META-01jm-T04: cada meta en su moneda (USD se muestra en USD); barra <progress> con el porcentaje en texto, como BudgetCard.
export function GoalsCard({ goals, now }: { goals: SavingsGoal[]; now: Date }) {
  if (goals.length === 0) return null
  return (
    <section className="card" aria-labelledby="goals-title">
      <h2 id="goals-title">Metas</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {goals.map((g) => {
          const s = goalStatus(g, now)
          const percent = Math.min(100, Math.floor((g.savedCents * 100) / g.targetCents))
          const money = (cents: number) => formatMoney(cents, g.currency)
          return (
            <li key={g.id} style={{ display: 'grid', gap: 4 }}>
              <span>{g.name}: <span className="amount">{money(g.savedCents)} de {money(g.targetCents)}</span> · {percent} %</span>
              <progress max={100} value={percent} aria-label={`${g.name}: ${percent} % ahorrado`} style={{ width: '100%' }} />
              <span className={s.kind === 'overdue' ? 'status-danger' : 'muted'}>
                {s.kind === 'done' ? '¡Meta cumplida!' : s.kind === 'overdue' ? `Venció: te faltan ${money(s.missingCents)}` : `Aparta ${money(s.monthlyCents)} al mes`}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
