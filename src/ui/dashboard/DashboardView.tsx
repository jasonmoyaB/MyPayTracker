import type { Reminder } from '../../data/reminders'
import type { Settings } from '../../data/settings'
import type { Transaction } from '../../data/transactions'
import { budgetStatus, type Budget } from '../../domain/budget'
import { compareMonths } from '../../domain/compare'
import { dueBy, nextPayDay, paidUntil, pendingPurchases, splitCredit } from '../../domain/credit'
import { reservedCents } from '../../domain/reminder'
import { avgMonthlySpend, lastEmailMovement, monthlyCharges, monthStats, spentThisMonth, topExpenses } from '../../domain/monthStats'
import { monthEndProjection } from '../../domain/projection'
import type { SavingsGoal } from '../../domain/savings'
import { summaryFor } from '../../domain/summary'
import { AffordCheck } from '../balance/AffordCheck'
import { BalanceCard } from './BalanceCard'
import { BudgetCard } from './BudgetCard'
import { CompareCard } from './CompareCard'
import { CreditCard } from './CreditCard'
import { GoalsCard } from './GoalsCard'
import { MonthCards } from './MonthCards'
import { ProjectionCard } from './ProjectionCard'
import { RecentMovements } from './RecentMovements'
import { TopExpenses } from './TopExpenses'
import './dashboard.css'

type Props = { settings: Settings; transactions: Transaction[]; budgets?: Budget[]; goals?: SavingsGoal[]; reminders?: Reminder[]; now?: Date; reload?: () => void }

export function DashboardView({ settings, transactions, budgets = [], goals = [], reminders = [], now = new Date(), reload = () => {} }: Props) {
  // TC-10jm-T04: la cuota vencida sigue en deuda hasta que el dev marca "Ya pagué".
  const paidThrough = paidUntil(settings.cardPaidThrough, now)
  const { settled, pending } = splitCredit(transactions, paidThrough)
  const summary = summaryFor(settings, settled)
  // TC-02jm-T05: hoy solo resta lo que vence el próximo 20; las cuotas posteriores salen del salario de ese mes.
  const dueNextCents = dueBy(pending.scheduleCrc, nextPayDay(now))
  // FIJ-01jm-T03: los fijos apartados del mes sin pagar ya están comprometidos; también para ¿Puedo comprar?.
  const reserved = reservedCents(reminders, now)
  const freeCents = summary && summary.balanceCrcCents - reserved
  const limitCents = freeCents === null ? null : freeCents - dueNextCents
  const spendCents = avgMonthlySpend(transactions, now)
  // GAS-01jm-T02: "Este mes" y "Top gastos" cuentan la cuota que vence este mes, no la compra entera.
  const charges = monthlyCharges(transactions)
  return (
    <div className="dashboard">
      <BalanceCard summary={summary} usdRateCents={settings.usdRateCents} />
      <CreditCard pending={pending} limitCents={limitCents} salaryCents={settings.salaryCents} now={now} onSaved={reload}
        dueNextCents={dueNextCents} purchases={pendingPurchases(transactions, paidThrough)} />
      {/* PROY-01jm-T02: sin saldo ni salario no hay de dónde proyectar. */}
      {summary && <ProjectionCard p={monthEndProjection({ availableCents: summary.balanceCrcCents, scheduleCrc: pending.scheduleCrc,
        reservedCents: reserved, typicalCents: spendCents, spentCents: spentThisMonth(transactions, now), now })} />}
      <MonthCards stats={monthStats(charges, now)} />
      <TopExpenses items={topExpenses(charges, now)} />
      <BudgetCard status={budgetStatus(budgets, transactions, now)} />
      <GoalsCard goals={goals} now={now} />
      <RecentMovements transactions={transactions} lastEmailAt={lastEmailMovement(transactions)} />
      <CompareCard rows={compareMonths(transactions, now)} />
      {summary && (
        <section className="card">
          <AffordCheck balanceCents={freeCents ?? 0} salaryCents={settings.salaryCents} scheduleCrc={pending.scheduleCrc} now={now}
            spendCents={spendCents} />
        </section>
      )}
    </div>
  )
}
