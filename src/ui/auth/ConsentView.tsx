import { useEffect, useState } from 'react'
import { toAppError } from '../../data/errors'
import { approve, deny, getAuthorization } from '../../data/oauth'

// MCP-03jm-T02: el conector también cambia saldo y salario; el texto lo dice antes de aprobar.
// MCP-01jm-T05: Supabase Auth manda aquí (/oauth/consent?authorization_id=…) cuando Claude o ChatGPT piden acceso.
export function ConsentView({ authorizationId }: { authorizationId: string }) {
  const [clientName, setClientName] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAuthorization(authorizationId)
      // Ya consintió antes: Supabase devuelve directo la URL de vuelta.
      .then((a) => ('redirectUrl' in a ? location.assign(a.redirectUrl) : setClientName(a.clientName)))
      .catch((e: unknown) => setError(toAppError(e).message))
  }, [authorizationId])

  async function decide(choose: typeof approve) {
    setPending(true)
    setError(null)
    try {
      location.href = await choose(authorizationId)
    } catch (e) {
      setError(toAppError(e).message)
      setPending(false)
    }
  }
  return <ConsentCard clientName={clientName} pending={pending} error={error}
    onApprove={() => void decide(approve)} onDeny={() => void decide(deny)} />
}

type CardProps = { clientName: string | null; pending: boolean; error: string | null; onApprove: () => void; onDeny: () => void }

export function ConsentCard({ clientName, pending, error, onApprove, onDeny }: CardProps) {
  return (
    <main style={{ maxWidth: 464, minHeight: '100dvh', alignContent: 'center' }}>
      <section className="card" aria-labelledby="consent-title" aria-busy={pending}>
        <h1 id="consent-title">Conectar asistente</h1>
        {!clientName && !error && <p className="muted">Cargando…</p>}
        {clientName && (
          <>
            <p><strong>{clientName}</strong> quiere ver tus movimientos y cambiar tu saldo y salario</p>
            <p className="muted">No podrá crear, editar ni borrar movimientos.</p>
            <button onClick={onApprove} disabled={pending}>Aprobar</button>
            <button className="secondary" onClick={onDeny} disabled={pending}>Rechazar</button>
          </>
        )}
        {error && <p role="alert" className="status-danger">{error}</p>}
      </section>
    </main>
  )
}
