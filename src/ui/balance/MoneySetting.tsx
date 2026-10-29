import { useState, type FormEvent } from 'react'
import { parseAmountToCents } from '../../domain/amount'
import { centsToNumeric } from '../../domain/money'
import { formatMoney } from '../format'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'

// Un monto en colones que el usuario registra y edita (salario, saldo de la cuenta).
export type MoneySettingProps = {
  label: string
  emptyHint: string
  note?: string
  valueCents: number | null
  save: (cents: number) => Promise<void>
  successMessage: string
  onSaved: () => void
}

export function MoneySetting(props: MoneySettingProps) {
  const [editing, setEditing] = useState(false)
  if (props.valueCents !== null && !editing) {
    return (
      <p className="muted amount money-value">
        {props.label}: {formatMoney(props.valueCents, 'CRC')}{props.note && ` · ${props.note}`}
        <button className="secondary" onClick={() => setEditing(true)}>Editar</button>
      </p>
    )
  }
  return (
    <div className="stack">
      {props.valueCents === null && <p>{props.emptyHint}</p>}
      <MoneyForm
        {...props}
        onCancel={props.valueCents === null ? undefined : () => setEditing(false)}
        onSaved={() => { setEditing(false); props.onSaved() }}
      />
    </div>
  )
}

type FormProps = Pick<MoneySettingProps, 'label' | 'valueCents' | 'save' | 'successMessage' | 'onSaved'> & { onCancel?: () => void }

function MoneyForm({ label, valueCents, save, successMessage, onSaved, onCancel }: FormProps) {
  const toast = useToast()
  const [text, setText] = useState(valueCents === null ? '' : centsToNumeric(valueCents))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const cents = parseAmountToCents(text)
    if (cents === null) return setError('Escribe un monto mayor que cero, por ejemplo 140000.')
    setSaving(true)
    setError(null)
    // Si falla, el toast avisa y el monto escrito se conserva.
    const failed = await saveWithToast(() => save(cents), toast, successMessage)
    setSaving(false)
    if (!failed) onSaved()
  }

  return (
    <form className="inline-form" onSubmit={(e) => void onSubmit(e)}>
      <label>
        {label} en colones
        <input inputMode="decimal" autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
      {onCancel && <button type="button" className="secondary" onClick={onCancel} disabled={saving}>Cancelar</button>}
      {error && <p role="alert" className="status-danger">{error}</p>}
    </form>
  )
}
