import { useCallback, useEffect, useState } from 'react'
import { onSessionChange, signOut, type Session } from '../data/auth'
import { getSettings, type Settings } from '../data/settings'
import { listTransactions, type Transaction } from '../data/transactions'
import { initialFilter, type MovementFilter } from '../domain/movementFilter'
import { autoRefresh } from './autoRefresh'
import { toUiError } from './sessionExpiry'
import { useToast } from './toast/ToastProvider'
import { AccountView } from './account/AccountView'
import { AppShell } from './AppShell'
import { LoginView } from './auth/LoginView'
import { OptionsView } from './options/OptionsView'
import { DashboardView } from './dashboard/DashboardView'
import { useRoute, type Route } from './route'
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
  // Vive aquí (no en la pantalla) para sobrevivir al cambiar de sección; solo en memoria.
  const [filter, setFilter] = useState(() => initialFilter(new Date()))
  const route = useRoute()
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

  // NAV-02jm: tema, contraseña y cerrar sesión viven en Opciones.
  const header = <header><h1>MyPayTracker</h1></header>
  return (
    <AppShell route={route} header={header}>
      <DashboardBody route={route} email={session.email} data={data} error={error} reload={() => void load()}
        filter={filter} onFilterChange={setFilter} />
    </AppShell>
  )
}

type BodyProps = {
  route: Route; email: string; data: Data | null; error: string | null; reload: () => void
  filter: MovementFilter; onFilterChange: (filter: MovementFilter) => void
}

// Los datos se cargan una vez en Dashboard y se reparten a la pantalla activa.
// Un error al recargar se muestra sobre los datos que ya había (no los oculta).
export function DashboardBody({ data, error, ...screen }: BodyProps) {
  return (
    <>
      {error && (
        <p role="alert" className="status-danger">
          No pudimos cargar tus datos. {error} <button className="secondary" onClick={screen.reload}>Reintentar</button>
        </p>
      )}
      {!data && !error && <p className="muted">Cargando movimientos…</p>}
      {data && <Screen {...screen} data={data} />}
    </>
  )
}

function Screen({ route, email, data, reload, filter, onFilterChange }: Omit<BodyProps, 'error' | 'data'> & { data: Data }) {
  if (route === 'movimientos') return (
    <TransactionsPanel transactions={data.transactions} filter={filter} onFilterChange={onFilterChange} onTransactionSaved={reload} />
  )
  if (route === 'cuenta') return <AccountView settings={data.settings} onSettingsSaved={reload} />
  if (route === 'opciones') return <OptionsView email={email} onSignOut={() => void signOut()} />
  return <DashboardView settings={data.settings} transactions={data.transactions} reload={reload} />
}
