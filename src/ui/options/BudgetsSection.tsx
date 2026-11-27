import { useState, type FormEvent } from 'react'
import { deleteBudget, saveBudget } from '../../data/budgets'
import { parseAmountToCents } from '../../domain/amount'
import type { Budget } from '../../domain/budget'
import { CATEGORIES, type Category } from '../../domain/category'
import { formatMoney } from '../format'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'

// PRES-01jm-T04: tope mensual en colones por categoría. Guardar una categoría que ya tiene tope lo cambia.
export function BudgetsSection({ budgets, onSaved }: { budgets: Budget[]; onSaved: () => void }) {
  const toast = useToast()
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function run(save: () => Promise<void>, message: string) {
    setSaving(true)
    const failed = await saveWithToast(save, toast, message)
    setSaving(false)
    if (!failed) onSaved()
    return !failed
  }
  async function submit(e: FormEvent) {
    e.preventDefault()
    const cents = parseAmountToCents(amount)
    setError(cents === null ? 'Escribe un monto mayor que cero, por ejemplo 80000.' : '')
    if (cents !== null && await run(() => saveBudget(category, cents), 'Presupuesto guardado')) setAmount('')
  }

  return (
    <section className="card" aria-labelledby="budgets-options-title" style={{ display: 'grid', gap: 12 }}>
      <h2 id="budgets-options-title" style={{ margin: 0 }}>Presupuestos</h2>
      {budgets.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {budgets.map((b) => (
            <li key={b.category} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="amount">{b.category}: {formatMoney(b.limitCents, 'CRC')}</span>
              <button type="button" className="secondary" disabled={saving}
                onClick={() => void run(() => deleteBudget(b.category), 'Presupuesto quitado')}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={(e) => void submit(e)} style={{ display: 'grid', gap: 8 }}>
        <label htmlFor="budget-category">Categoría</label>
        <select id="budget-category" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label htmlFor="budget-amount">Tope mensual en colones</label>
        <input id="budget-amount" inputMode="decimal" autoComplete="off" value={amount} onChange={(e) => setAmount(e.target.value)}
          aria-describedby={error ? 'budget-error' : undefined} />
        {error && <p id="budget-error" role="alert" className="status-danger" style={{ margin: 0 }}>{error}</p>}
        <div><button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar presupuesto'}</button></div>
      </form>
    </section>
  )
}
