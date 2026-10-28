import { useState, type FormEvent } from 'react'
import { parseAmountToCents } from '../../domain/amount'
import { centsToNumeric } from '../../domain/money'
import { formatMoney } from '../format'

// Un monto en colones que el usuario registra y edita (salario, saldo de la cuenta).
export type MoneySettingProps = {
  label: string
  emptyHint: string
  note?: string
  valueCents: number | null
  save: (cents: number) => Promise<void>
  onSaved: () => void
}

export function MoneySetting(props: MoneySettingProps) {
  const [editing, setEditing] = useState(false)
  if (props.valueCents !== null && !editing) {
    return (
      <p className="muted amount" style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {props.label}: {formatMoney(props.valueCents, 'CRC')}{props.note && ` · ${props.note}`}
        <button className="secondary" onClick={() => setEditing(true)}>Editar</button>
      </p>
    )
  }
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {props.valueCents === null && <p style={{ margin: 0 }}>{props.emptyHint}</p>}
      <MoneyForm
        {...props}
        onCancel={props.valueCents === null ? undefined : () => setEditing(false)}
        onSaved={() => { setEditing(false); props.onSaved() }}
      />
    </div>
  )
}

type FormProps = Pick<MoneySettingProps, 'label' | 'valueCents' | 'save' | 'onSaved'> & { onCancel?: () => void }

function MoneyForm({ label, valueCents, save, onSaved, onCancel }: FormProps) {
  const [text, setText] = useState(valueCents === null ? '' : centsToNumeric(valueCents))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const cents = parseAmountToCents(text)
    if (cents === null) return setError('Escribe un monto mayor que cero, por ejemplo 140000.')
    setSaving(true)
    setError(null)
    try {
      await save(cents)
      onSaved()
    } catch (err) {
      setError(`No pudimos guardar: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
      <label style={{ flex: '1 1 160px' }}>
        {label} en colones
        <input inputMode="decimal" autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
      {onCancel && <button type="button" className="secondary" onClick={onCancel} disabled={saving}>Cancelar</button>}
      {error && <p role="alert" className="status-danger" style={{ margin: 0, flexBasis: '100%' }}>{error}</p>}
    </form>
  )
}
