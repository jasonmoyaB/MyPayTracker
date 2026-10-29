import { ChangePasswordView } from '../auth/ChangePasswordView'
import { ThemeToggle } from '../theme/ThemeToggle'

type Props = { email: string; onSignOut: () => void }

// NAV-02jm-T01: ajustes de la app y de la sesión; signOut llega por prop (ui no importa Supabase directo).
export function OptionsView({ email, onSignOut }: Props) {
  return (
    <>
      <section className="card" aria-labelledby="theme-title">
        <h2 id="theme-title" tabIndex={-1}>Apariencia</h2>
        <div><ThemeToggle /></div>
      </section>
      <ChangePasswordView email={email} />
      <section className="card" aria-labelledby="session-title">
        <h2 id="session-title">Sesión</h2>
        <p className="muted">Conectado como {email}</p>
        <div><button type="button" className="secondary" onClick={onSignOut}>Cerrar sesión</button></div>
      </section>
    </>
  )
}
