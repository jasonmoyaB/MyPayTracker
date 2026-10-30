import { useId, useRef, useState, type FormEvent } from 'react'
import { addManualTransaction, updateTransaction } from '../../data/transactions'
import { parseAmountToCents } from '../../domain/amount'
import { installmentDues, ongoingPurchase } from '../../domain/credit'
import { costaRicaDateTime } from '../../domain/date'
import { centsToNumeric } from '../../domain/money'
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
// TC-08jm-T02: con `edit` corrige esa compra (mismas reglas) en vez de crear otra.
type Edit = { id: string; amountCents: number; installments: number; occurredAt: string; description: string }
export function DebtForm({ onSaved, edit }: { onSaved: () => void; edit?: Edit }) {
  const toast = useToast()
  const [fields, setFields] = useState<Fields>(edit
    ? { ...EMPTY, product: edit.description, price: centsToNumeric(edit.amountCents), date: costaRicaDateTime(new Date(edit.occurredAt)).slice(0, 10) }
    : EMPTY)
  const [months, setMonths] = useState(edit?.installments ?? 1)
  const ids = useId() // puede haber dos formularios en la página (agregar y editar)
  const title = edit ? 'Editar deuda' : 'Agregar deuda que ya tenías'
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
    const debt = { amountCents: checked.remainingCents, description: fields.product.trim(), occurredAt, installments }
    const failed = await saveWithToast(() => edit ? updateTransaction(edit.id, debt)
      : addManualTransaction({ ...debt, currency: 'CRC', direction: 'out', paymentMethod: 'credit' }), toast, 'Deuda guardada')
    pending.current = false
    setSaving(false)
    if (failed) return
    if (!edit) { setFields(EMPTY); setMonths(1) }
    onSaved()
  }
  return (
    <details open={!!edit}>
      <summary>{title}</summary>
      <form onSubmit={submit} aria-label={title}>
        <fieldset disabled={saving} style={{ display: 'grid', gap: 8 }}>
          <label htmlFor={`${ids}-product`}>Producto</label>
          <input id={`${ids}-product`} required value={fields.product} onChange={set('product')} />
          <label htmlFor={`${ids}-price`}>Precio (₡)</label>
          <input id={`${ids}-price`} inputMode="decimal" required value={fields.price} onChange={set('price')} />
          <label htmlFor={`${ids}-plan`}>Plazo</label>
          <select id={`${ids}-plan`} value={months} onChange={e => setMonths(Number(e.target.value))}>
            {[...new Set([...PLANS.filter(p => p !== 'cash'), edit?.installments ?? 1])].sort((a, b) => a - b).map(n => <option key={n} value={n}>{planLabel(n)}</option>)}
          </select>
          <label htmlFor={`${ids}-date`}>Fecha de compra (opcional: con ella se calcula lo que queda)</label>
          <input id={`${ids}-date`} type="date" max={costaRicaDateTime(new Date()).slice(0, 10)} value={fields.date} onChange={set('date')} />
          {!fields.date && <>
            <label htmlFor={`${ids}-remaining`}>Te queda por pagar (₡, opcional: vacío = el precio)</label>
            <input id={`${ids}-remaining`} inputMode="decimal" value={fields.remaining} onChange={set('remaining')} />
            <label htmlFor={`${ids}-monthly`}>Cuánto pagas por mes (₡, opcional)</label>
            <input id={`${ids}-monthly`} inputMode="decimal" value={fields.monthly} onChange={set('monthly')} />
          </>}
          {error && <p role="alert" className="status-danger">{error}</p>}
          <button type="submit">{saving ? 'Guardando…' : 'Guardar deuda'}</button>
        </fieldset>
      </form>
    </details>
  )
}
