import { useCallback, useEffect, useState } from 'react'
import { onSessionChange, signOut, type Session } from '../data/auth'
import { getSettings, type Settings } from '../data/settings'
import { listTransactions, type Transaction } from '../data/transactions'
import { autoRefresh } from './autoRefresh'
import { toUiError } from './sessionExpiry'
import { useToast } from './toast/ToastProvider'
import { ChangePasswordView } from './auth/ChangePasswordView'
import { LoginView } from './auth/LoginView'
import { BalancePanel } from './balance/BalancePanel'
import { ThemeToggle } from './theme/ThemeToggle'
import { TransactionsPanel } from './transactions/TransactionsPanel'

type Data = { settings: Settings; transactions: Transaction[] }

export function App() {
  // undefined = todavía no sabemos si hay sesión (evita parpadear el login).
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => onSessionChange(setSession), [])

  if (session === undefined) return <main><p className="muted">Cargando…</p></main>
  if (!session) return <LoginView />
  return <Dashboard session={session} />
}

function Dashboard({ session }: { session: Session }) {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  // AUTH-01jm-T04: montaje provisional; DASH-01jm lo mueve a "Cuenta".
  const [changingPassword, setChangingPassword] = useState(false)
  const toast = useToast()

  const load = useCallback(async () => {
    try {
      const [settings, transactions] = await Promise.all([getSettings(), listTransactions()])
      setData({ settings, transactions })
      setError(null)
    } catch (e) {
      const failure = toUiError(e)
      // Sesión vencida: el toast sobrevive al cambio a login; el resto se muestra aquí con "Reintentar".
      if (failure.kind === 'session') toast.error(failure.message)
      else setError(failure.message)
    }
  }, [toast])

  useEffect(() => { void load() }, [load])
  useEffect(() => autoRefresh(() => void load()), [load])

  return (
    <main>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1>MyPayTracker</h1>
        <span className="muted">
          {session.email} <ThemeToggle />{' '}
          <button className="secondary" onClick={() => setChangingPassword(true)}>Cambiar contraseña</button>{' '}
          <button className="secondary" onClick={() => void signOut()}>Cerrar sesión</button>
        </span>
      </header>
      {changingPassword
        ? <ChangePasswordView email={session.email} onBack={() => setChangingPassword(false)} />
        : <DashboardBody data={data} error={error} reload={() => void load()} />}
    </main>
  )
}

// Un error al recargar se muestra sobre los datos que ya había (no los oculta).
function DashboardBody({ data, error, reload }: { data: Data | null; error: string | null; reload: () => void }) {
  return (
    <>
      {error && (
        <p role="alert" className="status-danger">
          No pudimos cargar tus datos. {error} <button className="secondary" onClick={reload}>Reintentar</button>
        </p>
      )}
      {!data && !error && <p className="muted">Cargando movimientos…</p>}
      {data && (
        <>
          <BalancePanel settings={data.settings} transactions={data.transactions} onSettingsSaved={reload} />
          <TransactionsPanel transactions={data.transactions} onTransactionSaved={reload} />
        </>
      )}
    </>
  )
}
