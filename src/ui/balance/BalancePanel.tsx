import { saveAccountBalanceCents, saveSalaryCents, type Settings } from '../../data/settings'
import type { Transaction } from '../../data/transactions'
import { BalanceSummary, summaryFor } from '../dashboard/BalanceCard'
import { formatDate } from '../format'
import { AffordCheck } from './AffordCheck'
import { MoneySetting } from './MoneySetting'

export type BalancePanelProps = {
  settings: Settings
  transactions: Transaction[]
  onSettingsSaved: () => void
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
        successMessage="Saldo actualizado"
        onSaved={onSettingsSaved}
      />
      <MoneySetting
        label="Salario"
        emptyHint={account ? 'Opcional: tu salario mensual.' : 'Agrega tu salario para calcular tu saldo.'}
        note={account ? 'no se suma mientras haya saldo de cuenta' : undefined}
        valueCents={settings.salaryCents}
        save={saveSalaryCents}
        successMessage="Salario actualizado"
        onSaved={onSettingsSaved}
      />
      {summary && <AffordCheck balanceCents={summary.balanceCrcCents} />}
    </section>
  )
}
