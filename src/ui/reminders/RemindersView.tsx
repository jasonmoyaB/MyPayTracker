import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteReminder, listReminders, type Reminder } from '../../data/reminders'
import type { Transaction } from '../../data/transactions'
import { dueOn, nextPayDay } from '../../domain/credit'
import { nextDueOn } from '../../domain/reminder'
import { formatDay, formatMoney } from '../format'
import { toUiError } from '../sessionExpiry'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'
import { ReminderForm } from './ReminderForm'
import '../dashboard/dashboard.css'

type Loaded = { reminders: Reminder[] | null; error: string | null }

// REC-01jm-T06: carga sus recordatorios aquí y no con los datos de App; si 0010 falta, solo esta pantalla falla.
// `initial` solo existe para probar los estados sin DOM.
export function RemindersView({ transactions, initial }: { transactions: Transaction[]; initial?: Loaded }) {
  const toast = useToast()
  const [state, setState] = useState<Loaded>(initial ?? { reminders: null, error: null })
  const load = useCallback(async () => {
    try {
      setState({ reminders: await listReminders(), error: null })
    } catch (e) {
      const failure = toUiError(e)
      // Igual que App: sesión vencida va al toast (sobrevive al login); el resto, aquí con "Reintentar".
      if (failure.kind === 'session') toast.error(failure.message)
      else setState((s) => ({ ...s, error: failure.message }))
    }
  }, [toast])
  useEffect(() => { void load() }, [load])
  const reload = () => void load()
  return (
    <section className="card" aria-labelledby="reminders-title" style={{ display: 'grid', gap: 12 }}>
      <h2 id="reminders-title" tabIndex={-1} style={{ margin: 0 }}>Recordatorios</h2>
      {state.error && (
        <p role="alert" className="status-danger" style={{ margin: 0 }}>
          No pudimos cargar tus recordatorios. {state.error} <button className="secondary" onClick={reload}>Reintentar</button>
        </p>
      )}
      {!state.reminders && !state.error && <p className="muted" style={{ margin: 0 }}>Cargando recordatorios…</p>}
      {state.reminders && <RemindersList reminders={state.reminders} transactions={transactions} reload={reload} />}
    </section>
  )
}

type ListProps = { reminders: Reminder[]; transactions: Transaction[]; reload: () => void; now?: Date }

// REC-01jm-T04: pagos mensuales y, arriba, lo que vence el próximo 20 de la tarjeta. No tocan saldo ni deuda.
export function RemindersList({ reminders, transactions, reload, now = new Date() }: ListProps) {
  const toast = useToast()
  const [deleting, setDeleting] = useState(false)
  const pending = useRef(false)
  const payDay = nextPayDay(now)
  const card = dueOn(transactions, payDay)
  // REC-01jm-T06: un doble toque no lanza dos borrados (mismo bloqueo que el formulario).
  async function remove(id: string) {
    if (pending.current) return
    pending.current = true
    setDeleting(true)
    const failed = await saveWithToast(() => deleteReminder(id), toast, 'Recordatorio borrado')
    pending.current = false
    setDeleting(false)
    if (!failed) reload()
  }
  // CRC y USD nunca se suman: el USD va aparte.
  const cardAmount = [card.crcCents > 0 && formatMoney(card.crcCents, 'CRC'), card.usdCents > 0 && formatMoney(card.usdCents, 'USD')]
    .filter(Boolean).join(' y ')
  return (
    <>
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
              <button type="button" className="secondary" disabled={deleting} onClick={() => void remove(r.id)}
                aria-label={`Borrar ${r.description}`}>Borrar</button>
            </li>
          ))}
        </ul>}
      <ReminderForm onSaved={reload} debtCents={card.crcCents} />
    </>
  )
}
