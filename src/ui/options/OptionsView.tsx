import { PushToggle } from '../account/PushToggle'
import { ChangePasswordView } from '../auth/ChangePasswordView'
import type { Budget } from '../../domain/budget'
import type { SavingsGoal } from '../../domain/savings'
import { ThemeToggle } from '../theme/ThemeToggle'
import { BudgetsSection } from './BudgetsSection'
import { GoalsSection } from './GoalsSection'

type Props = { email: string; onSignOut: () => void; budgets?: Budget[]; goals?: SavingsGoal[]; onSaved?: () => void }

// NAV-02jm-T01: ajustes de la app y de la sesión; signOut llega por prop (ui no importa Supabase directo).
export function OptionsView({ email, onSignOut, budgets = [], goals = [], onSaved = () => {} }: Props) {
  return (
    <>
      <section className="card" aria-labelledby="theme-title">
        <h2 id="theme-title" tabIndex={-1}>Apariencia</h2>
        <div><ThemeToggle /></div>
      </section>
      {/* UX-03jm-T01: aquí busca el dev los ajustes; antes estaba en Cuenta. */}
      <PushToggle />
      <BudgetsSection budgets={budgets} onSaved={onSaved} />
      <GoalsSection goals={goals} onSaved={onSaved} />
      <ChangePasswordView email={email} />
      <section className="card" aria-labelledby="session-title">
        <h2 id="session-title">Sesión</h2>
        <p className="muted">Conectado como {email}</p>
        <div><button type="button" className="secondary" onClick={onSignOut}>Cerrar sesión</button></div>
      </section>
    </>
  )
}
