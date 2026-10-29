import { useRef, useState, type FormEvent } from 'react'
import { addManualTransaction, type NewTransaction } from '../../data/transactions'
import { parseAmountToCents } from '../../domain/amount'
import { costaRicaDateTime, costaRicaIso } from '../../domain/date'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'

function useFields() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<NewTransaction['currency']>('CRC')
  const [direction, setDirection] = useState<NewTransaction['direction']>('out')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => costaRicaDateTime(new Date()))
  return { amount, setAmount, currency, setCurrency, direction, setDirection, description, setDescription, date, setDate }
}

export function useTransactionForm(onSaved: () => void) {
  const fields = useFields()
  const toast = useToast()
  const { amount, currency, direction, description, date } = fields
  const [amountError, setAmountError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    const amountCents = parseAmountToCents(amount)
    const occurredAt = costaRicaIso(date)
    setAmountError(amountCents === null ? 'Ingresa un monto mayor que cero con hasta 2 decimales.' : '')
    setError('')
    if (amountCents === null) return
    if (!description.trim()) { setError('Ingresa una descripción para el movimiento.'); return }
    if (!occurredAt) { setError('Ingresa una fecha y hora válidas de Costa Rica.'); return }
    pending.current = true
    setSaving(true)
    // Si falla, el toast avisa y los campos se conservan.
    const failed = await saveWithToast(() => addManualTransaction({ amountCents, currency, direction, description: description.trim(), occurredAt, paymentMethod: 'cash' }),
      toast, 'Movimiento guardado')
    pending.current = false
    setSaving(false)
    if (!failed) onSaved()
  }
  return { ...fields, amountError, error, saving, submit }
}

export type TransactionFormState = ReturnType<typeof useTransactionForm>
