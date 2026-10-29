import { useRef, useState, type FormEvent } from 'react'
import { addReminder, type NewReminder } from '../../data/reminders'
import type { Currency } from '../../domain/bankEmail'
import { parseAmountToCents } from '../../domain/amount'
import { centsToNumeric } from '../../domain/money'
import { formatMoney } from '../format'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'

type Fields = { description: string; amount: string; currency: Currency; day: string }
const EMPTY: Fields = { description: '', amount: '', currency: 'CRC', day: '' }

// REC-01jm-T04: mismas reglas que la BD (monto > 0, día 1–31) para avisar antes de guardar.
export function checkReminder({ description, amount, currency, day }: Fields): { error: string } | NewReminder {
  if (!description.trim()) return { error: 'Ingresa la descripción.' }
  const amountCents = parseAmountToCents(amount)
  if (amountCents === null) return { error: 'Ingresa un monto mayor que cero con hasta 2 decimales.' }
  const dayNumber = day.trim() ? Number(day) : NaN
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 31) return { error: 'El día del mes va de 1 a 31.' }
  return { description: description.trim(), amountCents, currency, day: dayNumber }
}

// REC-01jm-T07: `debtCents` = lo que vence el próximo 20 de la tarjeta (CRC), para usarlo como monto.
export function ReminderForm({ onSaved, debtCents = 0 }: { onSaved: () => void; debtCents?: number }) {
  const toast = useToast()
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const set = (key: keyof Fields) => (e: { target: { value: string } }) => setFields({ ...fields, [key]: e.target.value })
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    const checked = checkReminder(fields)
    setError('error' in checked ? checked.error : '')
    if ('error' in checked) return
    pending.current = true
    setSaving(true)
    // Si falla, el toast avisa y los campos se conservan.
    const failed = await saveWithToast(() => addReminder(checked), toast, 'Recordatorio guardado')
    pending.current = false
    setSaving(false)
    if (failed) return
    setFields(EMPTY)
    onSaved()
  }
  return (
    <form onSubmit={submit} aria-labelledby="reminder-form-title">
      <fieldset disabled={saving} style={{ display: 'grid', gap: 8 }}>
        <h3 id="reminder-form-title" style={{ margin: 0 }}>Agregar recordatorio</h3>
        <label htmlFor="reminder-description">Descripción</label>
        <input id="reminder-description" maxLength={60} required value={fields.description} onChange={set('description')} />
        <label htmlFor="reminder-amount">Monto</label>
        <input id="reminder-amount" inputMode="decimal" required value={fields.amount} onChange={set('amount')} />
        {/* ponytail: copia el monto de hoy; si la deuda cambia, el recordatorio no se actualiza solo. */}
        {debtCents > 0 && <button type="button" className="secondary" onClick={() => setFields({ ...fields, amount: centsToNumeric(debtCents), currency: 'CRC' })}>
          Usar la deuda actual ({formatMoney(debtCents, 'CRC')})
        </button>}
        <label htmlFor="reminder-currency">Moneda</label>
        <select id="reminder-currency" value={fields.currency} onChange={set('currency')}>
          <option value="CRC">Colones (₡)</option>
          <option value="USD">Dólares ($)</option>
        </select>
        <label htmlFor="reminder-day">Día del mes (29–31 caen en el último día de los meses cortos)</label>
        <input id="reminder-day" type="number" min={1} max={31} step={1} inputMode="numeric" required value={fields.day} onChange={set('day')} />
        {error && <p role="alert" className="status-danger">{error}</p>}
        <button type="submit">{saving ? 'Guardando…' : 'Guardar recordatorio'}</button>
      </fieldset>
    </form>
  )
}
