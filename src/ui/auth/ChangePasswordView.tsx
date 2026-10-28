import { useRef, useState, type FormEvent } from 'react'
import { changePassword } from '../../data/auth'
import { validatePasswordChange, type PasswordChange, type PasswordChangeErrors } from '../../domain/password'
import { toUiError } from '../sessionExpiry'
import { useToast, type ToastApi } from '../toast/ToastProvider'
import { PasswordInput } from './PasswordInput'

// AUTH-01jm-T04: pantalla "Cambiar contraseña". Montaje provisional desde el encabezado; DASH-01jm la mueve a "Cuenta".
const EMPTY: PasswordChange = { current: '', next: '', confirm: '' }
const WRONG_CURRENT = 'La contraseña actual no es correcta.'

type Result = { ok: boolean; errors: PasswordChangeErrors }

// Valida, cambia y avisa. La actual incorrecta se muestra junto a su campo; el resto de fallos, en un toast.
export async function submitPasswordChange(values: PasswordChange, email: string,
  change: typeof changePassword, toast: ToastApi): Promise<Result> {
  const errors = validatePasswordChange(values)
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  try {
    await change(email, values.current, values.next)
  } catch (e) {
    const error = toUiError(e)
    if (error.kind === 'credentials') return { ok: false, errors: { current: WRONG_CURRENT } }
    toast.error(error.message)
    return { ok: false, errors: {} }
  }
  toast.success('Contraseña actualizada')
  return { ok: true, errors: {} }
}

export function ChangePasswordView({ email, onBack }: { email: string; onBack: () => void }) {
  const toast = useToast()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<PasswordChangeErrors>({})
  const [pending, setPending] = useState(false)
  const submitting = useRef(false)

  async function submit() {
    if (submitting.current) return
    submitting.current = true
    setPending(true)
    const result = await submitPasswordChange(values, email, changePassword, toast)
    setErrors(result.errors)
    if (result.ok) setValues(EMPTY)
    submitting.current = false
    setPending(false)
  }

  return (
    <ChangePasswordForm values={values} errors={errors} pending={pending} onBack={onBack}
      onChange={(field, value) => setValues((v) => ({ ...v, [field]: value }))} onSubmit={() => void submit()} />
  )
}

const FIELDS: { field: keyof PasswordChange; label: string; autoComplete: string }[] = [
  { field: 'current', label: 'Contraseña actual', autoComplete: 'current-password' },
  { field: 'next', label: 'Nueva contraseña', autoComplete: 'new-password' },
  { field: 'confirm', label: 'Confirmar nueva contraseña', autoComplete: 'new-password' },
]

type FormProps = {
  values: PasswordChange
  errors: PasswordChangeErrors
  pending: boolean
  onChange: (field: keyof PasswordChange, value: string) => void
  onSubmit: () => void
  onBack: () => void
}

export function ChangePasswordForm({ values, errors, pending, onChange, onSubmit, onBack }: FormProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }
  return (
    <form className="card" onSubmit={submit} aria-labelledby="cp-title" aria-busy={pending}>
      <h2 id="cp-title">Cambiar contraseña</h2>
      <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 12 }}>
      {FIELDS.map(({ field, label, autoComplete }) => {
        const errorId = `cp-${field}-error`
        return (
          <div key={field} style={{ display: 'grid', gap: 4 }}>
            <PasswordInput id={`cp-${field}`} label={label} autoComplete={autoComplete} value={values[field]}
              onChange={(e) => onChange(field, e.target.value)}
              aria-invalid={errors[field] ? true : undefined} aria-describedby={errors[field] ? errorId : undefined} />
            {errors[field] && <p id={errorId} role="alert" className="status-danger">{errors[field]}</p>}
          </div>
        )
      })}
      </fieldset>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" className="secondary" onClick={onBack} disabled={pending}>Volver</button>
      </div>
    </form>
  )
}
