import { deleteReminder, type Reminder } from '../../data/reminders'
import type { Transaction } from '../../data/transactions'
import { dueOn, nextPayDay } from '../../domain/credit'
import { nextDueOn } from '../../domain/reminder'
import { formatDay, formatMoney } from '../format'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'
import { ReminderForm } from './ReminderForm'
import '../dashboard/dashboard.css'

type Props = { reminders: Reminder[]; transactions: Transaction[]; reload: () => void; now?: Date }

// REC-01jm-T04: pagos mensuales y, arriba, lo que vence el próximo 20 de la tarjeta. No tocan saldo ni deuda.
export function RemindersView({ reminders, transactions, reload, now = new Date() }: Props) {
  const toast = useToast()
  const payDay = nextPayDay(now)
  const card = dueOn(transactions, payDay)
  async function remove(id: string) {
    if (!(await saveWithToast(() => deleteReminder(id), toast, 'Recordatorio borrado'))) reload()
  }
  // CRC y USD nunca se suman: el USD va aparte.
  const cardAmount = [card.crcCents > 0 && formatMoney(card.crcCents, 'CRC'), card.usdCents > 0 && formatMoney(card.usdCents, 'USD')]
    .filter(Boolean).join(' y ')
  return (
    <section className="card" aria-labelledby="reminders-title" style={{ display: 'grid', gap: 12 }}>
      <h2 id="reminders-title" tabIndex={-1} style={{ margin: 0 }}>Recordatorios</h2>
      {cardAmount && (
        <p style={{ margin: 0 }}><strong>Tarjeta de crédito</strong> · {formatDay(payDay)} · <span className="amount">{cardAmount}</span></p>
      )}
      {reminders.length === 0
        ? <p className="muted" style={{ margin: 0 }}>Aún no tienes recordatorios.</p>
        : <ul className="dashboard-list" aria-label="Pagos mensuales">
          {reminders.map((r) => (
            <li key={r.id}>
              <span className="dashboard-text">
                <span>{r.description}</span>
                {/* nextDueOn da la fecha CR; a las 00:00 CR para que formatDay no la corra un día. */}
                <span className="muted">Próximo pago {formatDay(`${nextDueOn(r.day, now)}T00:00:00-06:00`)} · día {r.day}</span>
              </span>
              <span className="amount">{formatMoney(r.amountCents, r.currency)}</span>
              <button type="button" className="secondary" onClick={() => void remove(r.id)} aria-label={`Borrar ${r.description}`}>Borrar</button>
            </li>
          ))}
        </ul>}
      <ReminderForm onSaved={reload} />
    </section>
  )
}
