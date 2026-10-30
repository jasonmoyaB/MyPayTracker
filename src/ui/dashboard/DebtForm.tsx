import { useRef, useState, type FormEvent } from 'react'
import { addManualTransaction } from '../../data/transactions'
import { parseAmountToCents } from '../../domain/amount'
import { installmentDues, ongoingPurchase } from '../../domain/credit'
import { costaRicaDateTime } from '../../domain/date'
import { PLANS } from '../../domain/recommend'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'
import { planLabel } from '../transactions/TransactionForm'

type Fields = { product: string; price: string; remaining: string; monthly: string; date?: string }
const EMPTY = { product: '', price: '', remaining: '', monthly: '', date: '' }

// TC-04jm-T03 (AC-5): "queda" vacío = el precio; nunca puede superar el precio.
type Checked = { priceCents: number; remainingCents: number; monthlyCents?: number; occurredAt?: string }
export function checkDebt({ product, price, remaining, monthly, date }: Fields, months = 1, now = new Date()): { error: string } | Checked {
  const priceCents = parseAmountToCents(price)
  const remainingCents = remaining.trim() ? parseAmountToCents(remaining) : priceCents
  if (priceCents === null) return { error: 'Ingresa un precio mayor que cero con hasta 2 decimales.' }
  if (!product.trim()) return { error: 'Ingresa el producto.' }
  // TC-07jm-T01: con fecha se guarda la compra entera desde ese día; las cuotas vencidas cuentan como pagadas.
  // A las 12:00 CR para no caer en otro día. Comparar texto YYYY-MM-DD = comparar fechas.
  if (date) {
    const occurredAt = `${date}T12:00:00-06:00`
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(occurredAt)) || date > costaRicaDateTime(now).slice(0, 10))
      return { error: 'Ingresa una fecha de compra válida, de hoy o antes.' }
    if (installmentDues(occurredAt, priceCents, months).every(d => Date.parse(d.dueAt) <= now.getTime()))
      return { error: 'Con esa fecha la deuda ya quedó pagada.' }
    return { priceCents, remainingCents: priceCents, occurredAt }
  }
  if (remainingCents === null) return { error: 'Lo que te queda por pagar debe ser mayor que cero con hasta 2 decimales.' }
  if (remainingCents > priceCents) return { error: 'Lo que te queda por pagar no puede ser mayor que el precio.' }
  // TC-05jm-T02: la cuota mensual es opcional; vacía, las cuotas salen del precio y el plazo.
  if (!monthly.trim()) return { priceCents, remainingCents }
  const monthlyCents = parseAmountToCents(monthly)
  if (monthlyCents === null) return { error: 'Lo que pagas por mes debe ser mayor que cero con hasta 2 decimales.' }
  return { priceCents, remainingCents, monthlyCents }
}

// TC-04jm-T03: la deuda que ya venía pagando se guarda como una compra con tarjeta más (ver ongoingPurchase).
export function DebtForm({ onSaved }: { onSaved: () => void }) {
  const toast = useToast()
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [months, setMonths] = useState(1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const set = (key: keyof Fields) => (e: { target: { value: string } }) => setFields({ ...fields, [key]: e.target.value })
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    const checked = checkDebt(fields, months)
    setError('error' in checked ? checked.error : '')
    if ('error' in checked) return
    const { installments, occurredAt } = checked.occurredAt
      ? { installments: months, occurredAt: checked.occurredAt }
      : ongoingPurchase(checked.priceCents, months, checked.remainingCents, new Date(), checked.monthlyCents)
    pending.current = true
    setSaving(true)
    // Si falla, el toast avisa y los campos se conservan.
    const failed = await saveWithToast(() => addManualTransaction({ amountCents: checked.remainingCents, currency: 'CRC', direction: 'out',
      description: fields.product.trim(), occurredAt, paymentMethod: 'credit', installments }), toast, 'Deuda guardada')
    pending.current = false
    setSaving(false)
    if (failed) return
    setFields(EMPTY)
    setMonths(1)
    onSaved()
  }
  return (
    <details>
      <summary>Agregar deuda que ya tenías</summary>
      <form onSubmit={submit} aria-label="Agregar deuda que ya tenías">
        <fieldset disabled={saving} style={{ display: 'grid', gap: 8 }}>
          <label htmlFor="debt-product">Producto</label>
          <input id="debt-product" required value={fields.product} onChange={set('product')} />
          <label htmlFor="debt-price">Precio (₡)</label>
          <input id="debt-price" inputMode="decimal" required value={fields.price} onChange={set('price')} />
          <label htmlFor="debt-plan">Plazo</label>
          <select id="debt-plan" value={months} onChange={e => setMonths(Number(e.target.value))}>
            {PLANS.filter(p => p !== 'cash').map(n => <option key={n} value={n}>{planLabel(n)}</option>)}
          </select>
          <label htmlFor="debt-date">Fecha de compra (opcional: con ella se calcula lo que queda)</label>
          <input id="debt-date" type="date" max={costaRicaDateTime(new Date()).slice(0, 10)} value={fields.date} onChange={set('date')} />
          {!fields.date && <>
            <label htmlFor="debt-remaining">Te queda por pagar (₡, opcional: vacío = el precio)</label>
            <input id="debt-remaining" inputMode="decimal" value={fields.remaining} onChange={set('remaining')} />
            <label htmlFor="debt-monthly">Cuánto pagas por mes (₡, opcional)</label>
            <input id="debt-monthly" inputMode="decimal" value={fields.monthly} onChange={set('monthly')} />
          </>}
          {error && <p role="alert" className="status-danger">{error}</p>}
          <button type="submit">{saving ? 'Guardando…' : 'Guardar deuda'}</button>
        </fieldset>
      </form>
    </details>
  )
}
