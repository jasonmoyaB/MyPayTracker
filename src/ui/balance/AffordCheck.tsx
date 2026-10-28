import { useState, type FormEvent } from 'react'
import { parseAmountToCents } from '../../domain/amount'
import { formatMoney } from '../format'

type Result = { kind: 'ok' | 'short'; cents: number } | { kind: 'invalid' }

export function AffordCheck({ balanceCents }: { balanceCents: number }) {
  const [price, setPrice] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const priceCents = parseAmountToCents(price)
    if (priceCents === null) return setResult({ kind: 'invalid' })
    const left = balanceCents - priceCents
    setResult(left >= 0 ? { kind: 'ok', cents: left } : { kind: 'short', cents: -left })
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>¿Puedo comprar esto?</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
        <label style={{ flex: '1 1 160px' }}>
          Precio en colones
          <input inputMode="decimal" autoComplete="off" placeholder="3490.50" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <button type="submit">Calcular</button>
      </div>
      <div role="status">{result && <ResultMessage result={result} />}</div>
    </form>
  )
}

function ResultMessage({ result }: { result: Result }) {
  if (result.kind === 'invalid') return <p className="status-danger" style={{ margin: 0 }}>Escribe un precio mayor que cero, por ejemplo 3490.50.</p>
  if (result.kind === 'ok') return <p className="status-success amount" style={{ margin: 0 }}>Sí, te quedarían {formatMoney(result.cents, 'CRC')}</p>
  return <p className="status-warning amount" style={{ margin: 0 }}>Te faltan {formatMoney(result.cents, 'CRC')}</p>
}
