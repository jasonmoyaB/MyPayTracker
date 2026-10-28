import { useRef, useState, type FormEvent } from 'react'
import { signIn } from '../../data/auth'

export function LoginView() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitting = useRef(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const fields = new FormData(event.currentTarget)
    submitting.current = true
    setPending(true)
    setError(null)
    try {
      await signIn(String(fields.get('email')).trim(), String(fields.get('password')))
    } catch (failure) {
      const invalid = failure instanceof Error && /invalid login credentials/i.test(failure.message)
      const invalidCode = typeof failure === 'object' && failure !== null &&
        'code' in failure && failure.code === 'invalid_credentials'
      setError(invalid || invalidCode ? 'Correo o contraseña incorrectos' :
        'No pudimos iniciar sesión. Revisa tu conexión e intenta de nuevo.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }
  return <LoginForm pending={pending} error={error} onSubmit={submit} />
}

type FormProps = {
  pending: boolean
  error: string | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

function LoginForm({ pending, error, onSubmit }: FormProps) {
  return (
    <main style={{ maxWidth: 464, minHeight: '100dvh', alignContent: 'center' }}>
      <form className="card" onSubmit={onSubmit} aria-labelledby="login-title" aria-busy={pending}>
        <h1 id="login-title">MyPayTracker</h1>
        <p className="muted">Inicia sesión para consultar tu saldo y movimientos.</p>
        <label htmlFor="login-email">Correo electrónico
          <input id="login-email" name="email" type="email" autoComplete="username" required
            style={{ minWidth: 0, width: '100%' }} />
        </label>
        <label htmlFor="login-password">Contraseña
          <input id="login-password" name="password" type="password" autoComplete="current-password" required
            style={{ minWidth: 0, width: '100%' }} />
        </label>
        {error && <p role="alert" className="status-danger">{error}</p>}
        <button type="submit" disabled={pending}>{pending ? 'Iniciando sesión…' : 'Iniciar sesión'}</button>
        {pending && <p role="status" className="muted">Iniciando sesión…</p>}
      </form>
    </main>
  )
}
