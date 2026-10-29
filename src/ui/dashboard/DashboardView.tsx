import type { Settings } from '../../data/settings'
import type { Transaction } from '../../data/transactions'
import { splitCredit } from '../../domain/credit'
import { lastEmailMovement, monthStats, topExpenses } from '../../domain/monthStats'
import { AffordCheck } from '../balance/AffordCheck'
import { BalanceCard, summaryFor } from './BalanceCard'
import { CreditCard } from './CreditCard'
import { MonthCards } from './MonthCards'
import { RecentMovements } from './RecentMovements'
import { TopExpenses } from './TopExpenses'
import './dashboard.css'

type Props = { settings: Settings; transactions: Transaction[]; now?: Date }

export function DashboardView({ settings, transactions, now = new Date() }: Props) {
  const { settled, pending } = splitCredit(transactions, now)
  const summary = summaryFor(settings, settled)
  // TC-01jm-T05: lo que se puede gastar ya descuenta la deuda de la tarjeta (solo CRC).
  const limitCents = summary && summary.balanceCrcCents - pending.crcCents
  return (
    <div className="dashboard">
      <BalanceCard summary={summary} />
      <CreditCard pending={pending} limitCents={limitCents} now={now} />
      <MonthCards stats={monthStats(transactions, now)} />
      <TopExpenses items={topExpenses(transactions, now)} />
      <RecentMovements transactions={transactions} lastEmailAt={lastEmailMovement(transactions)} />
      {limitCents !== null && <section className="card"><AffordCheck balanceCents={limitCents} /></section>}
    </div>
  )
}
