import { usdToCrcCents } from '../../domain/money'
import type { Summary } from '../../domain/summary'
import { formatMoney } from '../format'

type Rate = { usdRateCents?: number | null }

export function BalanceCard({ summary, usdRateCents }: { summary: Summary | null } & Rate) {
  return (
    <section className="card dashboard-balance" aria-labelledby="balance-title">
      <h2 id="balance-title" tabIndex={-1}>Saldo disponible</h2>
      {summary ? <BalanceSummary summary={summary} usdRateCents={usdRateCents} /> : (
        <p className="muted">Registra tu saldo o salario en <a href="#/cuenta">Cuenta</a> para calcular cuánto tienes.</p>
      )}
    </section>
  )
}

function BalanceSummary({ summary, usdRateCents }: { summary: Summary } & Rate) {
  const negative = summary.balanceCrcCents < 0
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <p className={`amount dashboard-big${negative ? ' negative' : ''}`}>{formatMoney(summary.balanceCrcCents, 'CRC')}</p>
      {negative && (
        <p className="status-danger" style={{ margin: 0 }}>
          Saldo negativo: tus gastos superan tu saldo.
        </p>
      )}
      <UsdLine usd={summary.usd} usdRateCents={usdRateCents} />
    </div>
  )
}

function UsdLine({ usd, usdRateCents }: { usd: Summary['usd'] } & Rate) {
  if (usd.incomeCents === 0 && usd.expenseCents === 0) return null
  // USD-01jm-T03: equivalente solo de pantalla; el saldo sigue siendo solo CRC.
  const crc = (cents: number, rate: number) => formatMoney(usdToCrcCents(cents, rate), 'CRC')
  return (
    <p className="muted amount" style={{ margin: 0 }}>
      Movimientos en dólares (no incluidos en el saldo): +{formatMoney(usd.incomeCents, 'USD')} / −{formatMoney(usd.expenseCents, 'USD')}
      {usdRateCents != null && ` · ≈ +${crc(usd.incomeCents, usdRateCents)} / −${crc(usd.expenseCents, usdRateCents)} al tipo ${formatMoney(usdRateCents, 'CRC')}`}
    </p>
  )
}
