import { useRef, useState, type FormEvent } from 'react'
import { addManualTransaction } from '../../data/transactions'
import { parseAmountToCents } from '../../domain/amount'
import { ongoingPurchase } from '../../domain/credit'
import { PLANS } from '../../domain/recommend'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'
import { planLabel } from '../transactions/TransactionForm'

type Fields = { product: string; price: string; remaining: string }

// TC-04jm-T03 (AC-5): "queda" vacío = el precio; nunca puede superar el precio.
export function checkDebt({ product, price, remaining }: Fields): { error: string } | { priceCents: number; remainingCents: number } {
  const priceCents = parseAmountToCents(price)
  const remainingCents = remaining.trim() ? parseAmountToCents(remaining) : priceCents
  if (priceCents === null) return { error: 'Ingresa un precio mayor que cero con hasta 2 decimales.' }
  if (!product.trim()) return { error: 'Ingresa el producto.' }
  if (remainingCents === null) return { error: 'Lo que te queda por pagar debe ser mayor que cero con hasta 2 decimales.' }
  if (remainingCents > priceCents) return { error: 'Lo que te queda por pagar no puede ser mayor que el precio.' }
  return { priceCents, remainingCents }
}

// TC-04jm-T03: la deuda que ya venía pagando se guarda como una compra con tarjeta más (ver ongoingPurchase).
export function DebtForm({ onSaved }: { onSaved: () => void }) {
  const toast = useToast()
  const [fields, setFields] = useState<Fields>({ product: '', price: '', remaining: '' })
  const [months, setMonths] = useState(1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const set = (key: keyof Fields) => (e: { target: { value: string } }) => setFields({ ...fields, [key]: e.target.value })
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    const checked = checkDebt(fields)
    setError('error' in checked ? checked.error : '')
    if ('error' in checked) return
    const { installments, occurredAt } = ongoingPurchase(checked.priceCents, months, checked.remainingCents, new Date())
    pending.current = true
    setSaving(true)
    // Si falla, el toast avisa y los campos se conservan.
    const failed = await saveWithToast(() => addManualTransaction({ amountCents: checked.remainingCents, currency: 'CRC', direction: 'out',
      description: fields.product.trim(), occurredAt, paymentMethod: 'credit', installments }), toast, 'Deuda guardada')
    pending.current = false
    setSaving(false)
    if (failed) return
    setFields({ product: '', price: '', remaining: '' })
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
          <label htmlFor="debt-remaining">Te queda por pagar (₡, opcional: vacío = el precio)</label>
          <input id="debt-remaining" inputMode="decimal" value={fields.remaining} onChange={set('remaining')} />
          {error && <p role="alert" className="status-danger">{error}</p>}
          <button type="submit">{saving ? 'Guardando…' : 'Guardar deuda'}</button>
        </fieldset>
      </form>
    </details>
  )
}
