import type { Settings } from '../../data/settings'
import type { Transaction } from '../../data/transactions'
import { dueBy, nextPayDay, pendingPurchases, splitCredit } from '../../domain/credit'
import { lastEmailMovement, monthStats, topExpenses } from '../../domain/monthStats'
import { AffordCheck } from '../balance/AffordCheck'
import { BalanceCard, summaryFor } from './BalanceCard'
import { CreditCard } from './CreditCard'
import { MonthCards } from './MonthCards'
import { RecentMovements } from './RecentMovements'
import { TopExpenses } from './TopExpenses'
import './dashboard.css'

type Props = { settings: Settings; transactions: Transaction[]; now?: Date; reload?: () => void }

export function DashboardView({ settings, transactions, now = new Date(), reload = () => {} }: Props) {
  const { settled, pending } = splitCredit(transactions, now)
  const summary = summaryFor(settings, settled)
  // TC-02jm-T05: hoy solo resta lo que vence el próximo 20; las cuotas posteriores salen del salario de ese mes.
  const dueNextCents = dueBy(pending.scheduleCrc, nextPayDay(now))
  const limitCents = summary && summary.balanceCrcCents - dueNextCents
  return (
    <div className="dashboard">
      <BalanceCard summary={summary} />
      <CreditCard pending={pending} limitCents={limitCents} salaryCents={settings.salaryCents} now={now} onSaved={reload}
        dueNextCents={dueNextCents} purchases={pendingPurchases(transactions, now)} />
      <MonthCards stats={monthStats(transactions, now)} />
      <TopExpenses items={topExpenses(transactions, now)} />
      <RecentMovements transactions={transactions} lastEmailAt={lastEmailMovement(transactions)} />
      {summary && (
        <section className="card">
          <AffordCheck balanceCents={summary.balanceCrcCents} salaryCents={settings.salaryCents} scheduleCrc={pending.scheduleCrc} now={now} />
        </section>
      )}
    </div>
  )
}
