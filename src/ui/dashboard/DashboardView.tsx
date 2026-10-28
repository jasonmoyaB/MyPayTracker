import type { Settings } from '../../data/settings'
import type { Transaction } from '../../data/transactions'
import { lastEmailMovement, monthStats, topExpenses } from '../../domain/monthStats'
import { AffordCheck } from '../balance/AffordCheck'
import { BalanceCard, summaryFor } from './BalanceCard'
import { MonthCards } from './MonthCards'
import { RecentMovements } from './RecentMovements'
import { TopExpenses } from './TopExpenses'
import './dashboard.css'

type Props = { settings: Settings; transactions: Transaction[]; now?: Date }

export function DashboardView({ settings, transactions, now = new Date() }: Props) {
  const summary = summaryFor(settings, transactions)
  return (
    <div className="dashboard">
      <BalanceCard summary={summary} />
      <MonthCards stats={monthStats(transactions, now)} />
      <TopExpenses items={topExpenses(transactions, now)} />
      <RecentMovements transactions={transactions} lastEmailAt={lastEmailMovement(transactions)} />
      {summary && <section className="card"><AffordCheck balanceCents={summary.balanceCrcCents} /></section>}
    </div>
  )
}
