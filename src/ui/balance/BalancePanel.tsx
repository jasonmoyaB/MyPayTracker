import { saveAccountBalanceCents, saveSalaryCents, type Settings } from '../../data/settings'
import type { Transaction } from '../../data/transactions'
import { summarize, summarizeFromAccount, type Summary } from '../../domain/summary'
import { formatDate, formatMoney } from '../format'
import { AffordCheck } from './AffordCheck'
import { MoneySetting } from './MoneySetting'

export type BalancePanelProps = {
  settings: Settings
  transactions: Transaction[]
  onSettingsSaved: () => void
}

// Con saldo de cuenta: parte de ahí (el salario ya está dentro). Sin él: salario + movimientos.
function summaryFor({ account, salaryCents }: Settings, transactions: Transaction[]): Summary | null {
  if (account) return summarizeFromAccount(account.cents, account.asOf, transactions)
  return salaryCents === null ? null : summarize(salaryCents, transactions)
}

export function BalancePanel({ settings, transactions, onSettingsSaved }: BalancePanelProps) {
  const summary = summaryFor(settings, transactions)
  const { account } = settings
  return (
    <section className="card" aria-labelledby="balance-title">
      <h2 id="balance-title">Saldo disponible</h2>
      {summary && <BalanceSummary summary={summary} />}
      <MoneySetting
        label="Saldo actual en BAC"
        emptyHint="Registra cuánto tienes hoy en tu cuenta BAC para partir de un saldo real."
        note={account ? `registrado el ${formatDate(account.asOf)}; se suman los movimientos posteriores` : undefined}
        valueCents={account?.cents ?? null}
        save={saveAccountBalanceCents}
        onSaved={onSettingsSaved}
      />
      <MoneySetting
        label="Salario"
        emptyHint={account ? 'Opcional: tu salario mensual.' : 'Agrega tu salario para calcular tu saldo.'}
        note={account ? 'no se suma mientras haya saldo de cuenta' : undefined}
        valueCents={settings.salaryCents}
        save={saveSalaryCents}
        onSaved={onSettingsSaved}
      />
      {summary && <AffordCheck balanceCents={summary.balanceCrcCents} />}
    </section>
  )
}

const bigAmount = { margin: 0, fontSize: 'clamp(36px, 11vw, 48px)', fontWeight: 600, lineHeight: 1.1, overflowWrap: 'anywhere' } as const

function BalanceSummary({ summary }: { summary: Summary }) {
  const negative = summary.balanceCrcCents < 0
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <p className="amount" style={{ ...bigAmount, color: negative ? 'var(--color-danger)' : 'var(--color-text)' }}>
        {formatMoney(summary.balanceCrcCents, 'CRC')}
      </p>
      {negative && (
        <p className="status-danger" style={{ margin: 0 }}>
          Tu saldo es negativo: tus gastos superan tu salario más tus ingresos.
        </p>
      )}
      <p className="muted amount" style={{ margin: 0 }}>
        Ingresos: +{formatMoney(summary.incomeCrcCents, 'CRC')} · Gastos: −{formatMoney(summary.expenseCrcCents, 'CRC')}
      </p>
      <UsdLine usd={summary.usd} />
    </div>
  )
}

function UsdLine({ usd }: { usd: Summary['usd'] }) {
  if (usd.incomeCents === 0 && usd.expenseCents === 0) return null
  return (
    <p className="muted amount" style={{ margin: 0 }}>
      Movimientos en dólares (no incluidos en el saldo): +{formatMoney(usd.incomeCents, 'USD')} / −{formatMoney(usd.expenseCents, 'USD')}
    </p>
  )
}
