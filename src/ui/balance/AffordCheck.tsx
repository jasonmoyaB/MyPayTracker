import { useState, type FormEvent } from 'react'
import { parseAmountToCents } from '../../domain/amount'
import { comparePlans, PLANS, recommend, type Plan, type Recommendation } from '../../domain/recommend'
import { planLabel } from '../transactions/TransactionForm'
import { affordText } from './affordText'
import { MonthTable, PlanTable } from './PlanTable'

type Props = { balanceCents: number; salaryCents: number | null; scheduleCrc: Record<string, number>; now: Date; spendCents?: number }

const optionLabel = (p: Plan) => (p === 'cash' ? 'Efectivo o débito' : p === 1 ? 'Tarjeta, un solo pago' : planLabel(p))

// TC-02jm-T05: recomienda según la forma de pago: el próximo 20 sale del saldo (+ extra); las cuotas, del salario.
export function AffordCheck({ balanceCents, salaryCents, scheduleCrc, now, spendCents = 0 }: Props) {
  const [price, setPrice] = useState('')
  const [plan, setPlan] = useState<Plan>('cash')
  const [extra, setExtra] = useState('')
  const [result, setResult] = useState<Recommendation | 'invalid' | null>(null)
  const [rows, setRows] = useState<Recommendation[]>([])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const priceCents = parseAmountToCents(price)
    const extraCents = extra.trim() === '' ? 0 : parseAmountToCents(extra)
    if (priceCents === null || extraCents === null) { setRows([]); return setResult('invalid') }
    const input = { priceCents, balanceCents, extraCents, salaryCents, scheduleCrc, now, spendCents }
    setResult(recommend({ ...input, plan }))
    setRows(comparePlans(input))
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>¿Puedo comprar esto?</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
        <label style={{ flex: '1 1 160px' }}>
          Precio en colones
          <input inputMode="decimal" autoComplete="off" placeholder="3490.50" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <label style={{ flex: '1 1 160px' }}>
          Forma de pago
          <select value={plan} onChange={(e) => setPlan(e.target.value === 'cash' ? 'cash' : (Number(e.target.value) as Plan))}>
            {PLANS.map((p) => <option key={p} value={p}>{optionLabel(p)}</option>)}
          </select>
        </label>
        <label style={{ flex: '1 1 160px' }}>
          Plata extra que te entra (opcional)
          <input inputMode="decimal" autoComplete="off" placeholder="0" value={extra} onChange={(e) => setExtra(e.target.value)} />
        </label>
        <button type="submit">Calcular</button>
      </div>
      <div role="status">{result && <ResultMessage result={result} />}</div>
      {result && result !== 'invalid' && <MonthTable rows={result.monthly} spendCents={spendCents} />}
      {rows.length > 0 && <PlanTable rows={rows} />}
    </form>
  )
}

function ResultMessage({ result }: { result: Recommendation | 'invalid' }) {
  if (result === 'invalid') return <p className="status-danger" style={{ margin: 0 }}>Escribe montos mayores que cero, por ejemplo 3490.50.</p>
  const { tone, lines } = affordText(result)
  return <>{lines.map((line, i) => (
    <p key={i} className={i === lines.length - 1 ? `status-${tone} amount` : 'muted amount'} style={{ margin: 0 }}>{line}</p>
  ))}</>
}
