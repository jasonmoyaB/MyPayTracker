import { useState, type InputHTMLAttributes } from 'react'
import './auth.css'

// AUTH-01jm-T02: campo de contraseña con botón de ojo. El botón queda fuera del <label>
// para no mezclar su nombre con el del input.
type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { id: string; label: string }
type FieldProps = InputProps & { visible: boolean; onToggle: () => void }

export function PasswordInput(props: InputProps) {
  const [visible, setVisible] = useState(false)
  return <PasswordField {...props} visible={visible} onToggle={() => setVisible((v) => !v)} />
}

// Sin estado, para poder probar ambos modos con renderToStaticMarkup.
export function PasswordField({ label, visible, onToggle, ...input }: FieldProps) {
  return (
    <div className="password-field">
      <label htmlFor={input.id}>{label}</label>
      <div className="password-row">
        <input {...input} type={visible ? 'text' : 'password'} />
        <button type="button" className="secondary password-eye" onClick={onToggle}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={visible}>
          <EyeIcon crossed={visible} />
        </button>
      </div>
    </div>
  )
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {crossed && <path d="M3 3l18 18" />}
    </svg>
  )
}
