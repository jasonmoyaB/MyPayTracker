import { useState, type FormEvent } from 'react'
import { saveSalaryCents } from '../../data/settings'
import { parseAmountToCents } from '../../domain/amount'
import { centsToNumeric } from '../../domain/money'
import { formatMoney } from '../format'

type Props = { salaryCents: number | null; onSalarySaved: () => void }

export function SalarySection({ salaryCents, onSalarySaved }: Props) {
  const [editing, setEditing] = useState(false)
  if (salaryCents !== null && !editing) {
    return (
      <p className="muted amount" style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        Salario: {formatMoney(salaryCents, 'CRC')}
        <button className="secondary" onClick={() => setEditing(true)}>Editar salario</button>
      </p>
    )
  }
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {salaryCents === null && <p style={{ margin: 0 }}>Agrega tu salario para calcular tu saldo.</p>}
      <SalaryForm
        initialCents={salaryCents}
        onCancel={salaryCents === null ? undefined : () => setEditing(false)}
        onSaved={() => { setEditing(false); onSalarySaved() }}
      />
    </div>
  )
}

type FormProps = { initialCents: number | null; onCancel?: () => void; onSaved: () => void }

function SalaryForm({ initialCents, onCancel, onSaved }: FormProps) {
  const [text, setText] = useState(initialCents === null ? '' : centsToNumeric(initialCents))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const cents = parseAmountToCents(text)
    if (cents === null) return setError('Escribe un salario mayor que cero, por ejemplo 850000.')
    setSaving(true)
    setError(null)
    try {
      await saveSalaryCents(cents)
      onSaved()
    } catch (err) {
      setError(`No pudimos guardar tu salario: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
      <label style={{ flex: '1 1 160px' }}>
        Salario mensual en colones
        <input inputMode="decimal" autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar salario'}</button>
      {onCancel && <button type="button" className="secondary" onClick={onCancel} disabled={saving}>Cancelar</button>}
      {error && <p role="alert" className="status-danger" style={{ margin: 0, flexBasis: '100%' }}>{error}</p>}
    </form>
  )
}
