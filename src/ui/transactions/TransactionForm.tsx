import { useTransactionForm, type TransactionFormState } from './useTransactionForm'

type Props = { onSaved: () => void; onCancel: () => void }

export function TransactionForm({ onSaved, onCancel }: Props) {
  const state = useTransactionForm(onSaved)
  return (
    <form id="manual-transaction" className="transaction-form" onSubmit={state.submit} aria-label="Registrar movimiento">
      <fieldset disabled={state.saving}>
        <legend>Nuevo movimiento</legend>
        <AmountFields state={state} />
        <DetailFields state={state} />
        {state.error && <p role="alert" className="status-danger">{state.error}</p>}
        <div className="transactions-heading">
          <button type="submit">{state.saving ? 'Guardando…' : 'Guardar movimiento'}</button>
          <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>
        </div>
      </fieldset>
      {state.saving && <p role="status" className="muted">Guardando…</p>}
    </form>
  )
}

function AmountFields({ state: s }: { state: TransactionFormState }) {
  return <>
    <label htmlFor="transaction-amount">Monto</label>
    <input id="transaction-amount" type="text" inputMode="decimal" autoFocus required value={s.amount}
      onChange={e => s.setAmount(e.target.value)} aria-invalid={!!s.amountError}
      aria-describedby={s.amountError ? 'transaction-amount-help transaction-amount-error' : 'transaction-amount-help'} />
    <span id="transaction-amount-help" className="muted">Usa punto para los decimales. Ejemplo: 3490.50</span>
    {s.amountError && <span id="transaction-amount-error" role="alert" className="status-danger">{s.amountError}</span>}
    <label htmlFor="transaction-currency">Moneda</label>
    <select id="transaction-currency" value={s.currency} onChange={e => s.setCurrency(e.target.value as typeof s.currency)}>
      <option value="CRC">CRC — Colones</option><option value="USD">USD — Dólares</option>
    </select>
    <label htmlFor="transaction-direction">Tipo</label>
    <select id="transaction-direction" value={s.direction} onChange={e => s.setDirection(e.target.value as typeof s.direction)}>
      <option value="out">Gasto</option><option value="in">Ingreso</option>
    </select>
    <PaymentField state={s} />
  </>
}

function DetailFields({ state: s }: { state: TransactionFormState }) {
  return <>
    <label htmlFor="transaction-description">Descripción</label>
    <input id="transaction-description" required value={s.description} onChange={e => s.setDescription(e.target.value)} />
    <label htmlFor="transaction-date">Fecha y hora (Costa Rica)</label>
    <input id="transaction-date" type="datetime-local" required value={s.date} onChange={e => s.setDate(e.target.value)} />
  </>
}

type PaymentState = Pick<TransactionFormState, 'direction' | 'paymentMethod' | 'setPaymentMethod'>

// TC-01jm-T04: la tarjeta solo difiere gastos; en ingresos ni se ofrece.
export function PaymentField({ state: s }: { state: PaymentState }) {
  if (s.direction !== 'out') return null
  return <>
    <label htmlFor="transaction-payment">Método de pago</label>
    <select id="transaction-payment" value={s.paymentMethod} onChange={e => s.setPaymentMethod(e.target.value as typeof s.paymentMethod)}>
      <option value="cash">Efectivo o débito</option><option value="credit">Tarjeta de crédito</option>
    </select>
  </>
}
