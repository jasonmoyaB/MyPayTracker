import { useState, type FormEvent } from 'react'
import { addGoal, deleteGoal, updateGoalSaved } from '../../data/savings'
import { parseAmountToCents, parseFeeToCents } from '../../domain/amount'
import type { Currency } from '../../domain/bankEmail'
import { parseMonth } from '../../domain/monthStats'
import type { SavingsGoal } from '../../domain/savings'
import { formatMoney } from '../format'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'

type Run = (save: () => Promise<void>, message: string) => Promise<boolean>

// META-01jm-T04: crear, actualizar lo ahorrado y borrar metas. Mismo patrón que BudgetsSection.
export function GoalsSection({ goals, onSaved }: { goals: SavingsGoal[]; onSaved: () => void }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const run: Run = async (save, message) => {
    setSaving(true)
    const failed = await saveWithToast(save, toast, message)
    setSaving(false)
    if (!failed) onSaved()
    return !failed
  }
  return (
    <section className="card" aria-labelledby="goals-options-title" style={{ display: 'grid', gap: 12 }}>
      <h2 id="goals-options-title" style={{ margin: 0 }}>Metas de ahorro</h2>
      {goals.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {goals.map((g) => <GoalRow key={g.id} goal={g} run={run} saving={saving} />)}
        </ul>
      )}
      <GoalForm run={run} saving={saving} />
    </section>
  )
}

function GoalRow({ goal: g, run, saving }: { goal: SavingsGoal; run: Run; saving: boolean }) {
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')
  const id = `goal-saved-${g.id}`
  async function update(e: FormEvent) {
    e.preventDefault()
    // "Ahorrado" puede ser 0: mismo criterio que la comisión opcional.
    const cents = parseFeeToCents(saved)
    setError(cents === null || !saved.trim() ? 'Escribe lo ahorrado, por ejemplo 150000.' : '')
    if (cents !== null && saved.trim() && await run(() => updateGoalSaved(g.id, cents), 'Ahorrado actualizado')) setSaved('')
  }
  function remove() {
    // Como TC-07jm-T02: confirm() nativo antes de borrar.
    if (confirm(`¿Borrar la meta "${g.name}"? No se puede deshacer.`)) void run(() => deleteGoal(g.id), 'Meta borrada')
  }
  return (
    <li style={{ display: 'grid', gap: 4 }}>
      <span className="amount">{g.name}: {formatMoney(g.savedCents, g.currency)} de {formatMoney(g.targetCents, g.currency)}</span>
      <form onSubmit={(e) => void update(e)} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor={id}>Ahorrado ({g.currency})</label>
        <input id={id} inputMode="decimal" autoComplete="off" value={saved} onChange={(e) => setSaved(e.target.value)}
          aria-describedby={error ? `${id}-error` : undefined} />
        <button type="submit" disabled={saving}>Actualizar ahorrado</button>
        <button type="button" className="secondary" disabled={saving} onClick={remove}>Borrar</button>
      </form>
      {error && <p id={`${id}-error`} role="alert" className="status-danger" style={{ margin: 0 }}>{error}</p>}
    </li>
  )
}

function GoalForm({ run, saving }: { run: Run; saving: boolean }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [currency, setCurrency] = useState<Currency>('CRC')
  const [deadline, setDeadline] = useState('')
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    const targetCents = parseAmountToCents(target)
    const savedCents = parseFeeToCents(saved)
    // ponytail: un solo mensaje para todo el formulario, como BudgetsSection; uno por campo si confunde.
    const invalid = !name.trim() || name.trim().length > 80 || targetCents === null || savedCents === null || !parseMonth(deadline)
    setError(invalid ? 'Revisa los datos: nombre, monto mayor que cero, mes límite (AAAA-MM) y ahorrado.' : '')
    if (invalid) return
    const ok = await run(() => addGoal({ name: name.trim(), targetCents, currency, deadline, savedCents }), 'Meta creada')
    if (ok) { setName(''); setTarget(''); setDeadline(''); setSaved('') }
  }
  return (
    <form onSubmit={(e) => void submit(e)} style={{ display: 'grid', gap: 8 }}>
      <label htmlFor="goal-name">Nombre</label>
      <input id="goal-name" maxLength={80} autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
      <label htmlFor="goal-target">Monto objetivo</label>
      <input id="goal-target" inputMode="decimal" autoComplete="off" value={target} onChange={(e) => setTarget(e.target.value)} />
      <label htmlFor="goal-currency">Moneda</label>
      <select id="goal-currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
        <option value="CRC">Colones</option><option value="USD">Dólares</option>
      </select>
      {/* Safari viejo cae a texto: se valida AAAA-MM igual (parseMonth). */}
      <label htmlFor="goal-deadline">Mes límite</label>
      <input id="goal-deadline" type="month" placeholder="AAAA-MM" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      <label htmlFor="goal-saved">Ahorrado hasta hoy</label>
      <input id="goal-saved" inputMode="decimal" autoComplete="off" placeholder="0" value={saved} onChange={(e) => setSaved(e.target.value)}
        aria-describedby={error ? 'goal-error' : undefined} />
      {error && <p id="goal-error" role="alert" className="status-danger" style={{ margin: 0 }}>{error}</p>}
      <div><button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Crear meta'}</button></div>
    </form>
  )
}
