import { useCallback, useEffect, useState } from 'react'
import { onSessionChange, signOut, type Session } from '../data/auth'
import { getSalaryCents } from '../data/settings'
import { listTransactions, type Transaction } from '../data/transactions'
import { LoginView } from './auth/LoginView'
import { BalancePanel } from './balance/BalancePanel'
import { TransactionsPanel } from './transactions/TransactionsPanel'

type Data = { salaryCents: number | null; transactions: Transaction[] }

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

  const load = useCallback(async () => {
    try {
      const [salaryCents, transactions] = await Promise.all([getSalaryCents(), listTransactions()])
      setData({ salaryCents, transactions })
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return (
    <main>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1>MyPayTracker</h1>
        <span className="muted">
          {session.email} <button className="secondary" onClick={() => void signOut()}>Cerrar sesión</button>
        </span>
      </header>
      {error && (
        <p role="alert" className="status-danger">
          No pudimos cargar tus datos: {error} <button className="secondary" onClick={() => void load()}>Reintentar</button>
        </p>
      )}
      {!data && !error && <p className="muted">Cargando movimientos…</p>}
      {data && (
        <>
          <BalancePanel salaryCents={data.salaryCents} transactions={data.transactions} onSalarySaved={() => void load()} />
          <TransactionsPanel transactions={data.transactions} onTransactionSaved={() => void load()} />
        </>
      )}
    </main>
  )
}
