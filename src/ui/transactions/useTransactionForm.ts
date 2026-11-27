import { useRef, useState, type FormEvent } from 'react'
import { addManualTransaction, type NewTransaction } from '../../data/transactions'
import { purchaseCents } from '../../domain/amount'
import { costaRicaDateTime, costaRicaIso } from '../../domain/date'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'

type Method = NewTransaction['paymentMethod']

// TC-01jm-T04 / MOV-02jm-T02: solo los gastos van con tarjeta (la BD también lo exige); SINPE vale en ambos.
// Compartida con PaymentField para que el select muestre lo mismo que se guarda.
// TC-11jm-T03: el pago de tarjeta tampoco existe en ingresos (check de 0014).
export const effectivePaymentMethod = (direction: NewTransaction['direction'], method: Method): Method =>
  direction === 'in' && (method === 'credit' || method === 'card_payment') ? 'cash' : method

function useFields() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<NewTransaction['currency']>('CRC')
  const [direction, setDirection] = useState<NewTransaction['direction']>('out')
  const [paymentMethod, setPaymentMethod] = useState<Method>('cash')
  const [installments, setInstallments] = useState(1)
  const [fee, setFee] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => costaRicaDateTime(new Date()))
  return { amount, setAmount, currency, setCurrency, direction, setDirection, paymentMethod, setPaymentMethod, installments, setInstallments, fee, setFee, description, setDescription, date, setDate }
}

export function useTransactionForm(onSaved: () => void) {
  const fields = useFields()
  const toast = useToast()
  const { amount, currency, direction, description, date } = fields
  const paymentMethod = effectivePaymentMethod(direction, fields.paymentMethod)
  // TC-02jm-T04: el plazo solo aplica a tarjeta (la BD también lo exige).
  const installments = paymentMethod === 'credit' ? fields.installments : 1
  const [amountError, setAmountError] = useState('')
  const [feeError, setFeeError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    // TC-12jm-T02: la comisión solo existe a plazo; si el campo está oculto, lo escrito no cuenta.
    const { priceCents, feeCents, totalCents: amountCents } = purchaseCents(amount, fields.fee, installments)
    const occurredAt = costaRicaIso(date)
    setAmountError(priceCents === null ? 'Ingresa un monto mayor que cero con hasta 2 decimales.' : '')
    setFeeError(feeCents === null ? 'Ingresa una comisión de cero o más con hasta 2 decimales, o déjala vacía.' : '')
    setError('')
    if (amountCents === null) return
    if (!description.trim()) { setError('Ingresa una descripción para el movimiento.'); return }
    if (!occurredAt) { setError('Ingresa una fecha y hora válidas de Costa Rica.'); return }
    pending.current = true
    setSaving(true)
    // Si falla, el toast avisa y los campos se conservan.
    const failed = await saveWithToast(() => addManualTransaction({ amountCents, currency, direction, description: description.trim(), occurredAt, paymentMethod, installments }),
      toast, 'Movimiento guardado')
    pending.current = false
    setSaving(false)
    if (!failed) onSaved()
  }
  return { ...fields, amountError, feeError, error, saving, submit }
}

export type TransactionFormState = ReturnType<typeof useTransactionForm>
