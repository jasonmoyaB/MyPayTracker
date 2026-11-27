import type { Settings } from '../../data/settings'
import type { Transaction } from '../../data/transactions'
import { dueBy, nextPayDay, paidUntil, pendingPurchases, splitCredit } from '../../domain/credit'
import { avgMonthlySpend, lastEmailMovement, monthlyCharges, monthStats, topExpenses } from '../../domain/monthStats'
import { summaryFor } from '../../domain/summary'
import { AffordCheck } from '../balance/AffordCheck'
import { BalanceCard } from './BalanceCard'
import { CreditCard } from './CreditCard'
import { MonthCards } from './MonthCards'
import { RecentMovements } from './RecentMovements'
import { TopExpenses } from './TopExpenses'
import './dashboard.css'

type Props = { settings: Settings; transactions: Transaction[]; now?: Date; reload?: () => void }

export function DashboardView({ settings, transactions, now = new Date(), reload = () => {} }: Props) {
  // TC-10jm-T04: la cuota vencida sigue en deuda hasta que el dev marca "Ya pagué".
  const paidThrough = paidUntil(settings.cardPaidThrough, now)
  const { settled, pending } = splitCredit(transactions, paidThrough)
  const summary = summaryFor(settings, settled)
  // TC-02jm-T05: hoy solo resta lo que vence el próximo 20; las cuotas posteriores salen del salario de ese mes.
  const dueNextCents = dueBy(pending.scheduleCrc, nextPayDay(now))
  const limitCents = summary && summary.balanceCrcCents - dueNextCents
  // GAS-01jm-T02: "Este mes" y "Top gastos" cuentan la cuota que vence este mes, no la compra entera.
  const charges = monthlyCharges(transactions)
  return (
    <div className="dashboard">
      <BalanceCard summary={summary} />
      <CreditCard pending={pending} limitCents={limitCents} salaryCents={settings.salaryCents} now={now} onSaved={reload}
        dueNextCents={dueNextCents} purchases={pendingPurchases(transactions, paidThrough)} />
      <MonthCards stats={monthStats(charges, now)} />
      <TopExpenses items={topExpenses(charges, now)} />
      <RecentMovements transactions={transactions} lastEmailAt={lastEmailMovement(transactions)} />
      {summary && (
        <section className="card">
          <AffordCheck balanceCents={summary.balanceCrcCents} salaryCents={settings.salaryCents} scheduleCrc={pending.scheduleCrc} now={now}
            spendCents={avgMonthlySpend(transactions, now)} />
        </section>
      )}
    </div>
  )
}
