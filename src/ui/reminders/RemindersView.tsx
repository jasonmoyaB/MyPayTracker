import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteReminder, listReminders, markReminderPaid, setReminderReserve, type Reminder } from '../../data/reminders'
import type { Transaction } from '../../data/transactions'
import { dueBy, nextPayDay, paidUntil, splitCredit } from '../../domain/credit'
import { isCardPayment, nextDueOn } from '../../domain/reminder'
import { CardPaidButton } from '../dashboard/CreditCard'
import { formatDay, formatMoney } from '../format'
import { toUiError } from '../sessionExpiry'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast } from '../toast/ToastProvider'
import { CardDebtDialog } from './CardDebtDialog'
import { ReminderForm } from './ReminderForm'
import '../dashboard/dashboard.css'

type Loaded = { reminders: Reminder[] | null; error: string | null }

// REC-01jm-T06: carga sus recordatorios aquí y no con los datos de App; si 0010 falta, solo esta pantalla falla.
// `initial` solo existe para probar los estados sin DOM.
// TC-10jm-T05: `cardPaidThrough` y `onCardPaid` (recarga de App) para "Ya pagué" con las cifras del Resumen.
type ViewProps = { transactions: Transaction[]; cardPaidThrough?: string | null; onCardPaid?: () => void; initial?: Loaded }
export function RemindersView({ transactions, cardPaidThrough, onCardPaid = () => {}, initial }: ViewProps) {
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
  // FIJ-01jm-T03: App también recarga, porque el Resumen resta los recordatorios apartados.
  const reload = () => { void load(); onCardPaid() }
  return (
    <section className="card" aria-labelledby="reminders-title" style={{ display: 'grid', gap: 12 }}>
      <h2 id="reminders-title" tabIndex={-1} style={{ margin: 0 }}>Recordatorios</h2>
      {state.error && (
        <p role="alert" className="status-danger" style={{ margin: 0 }}>
          No pudimos cargar tus recordatorios. {state.error} <button className="secondary" onClick={reload}>Reintentar</button>
        </p>
      )}
      {!state.reminders && !state.error && <p className="muted" style={{ margin: 0 }}>Cargando recordatorios…</p>}
      {state.reminders && <RemindersList reminders={state.reminders} transactions={transactions} reload={reload}
        cardPaidThrough={cardPaidThrough} onCardPaid={onCardPaid} />}
    </section>
  )
}

type ListProps = {
  reminders: Reminder[]; transactions: Transaction[]; reload: () => void; now?: Date
  cardPaidThrough?: string | null; onCardPaid?: () => void
}

// REC-01jm-T04: pagos mensuales y, arriba, lo que vence el próximo 20 de la tarjeta. No tocan saldo ni deuda.
export function RemindersList({ reminders, transactions, reload, now = new Date(), cardPaidThrough, onCardPaid = () => {} }: ListProps) {
  const toast = useToast()
  const [deleting, setDeleting] = useState(false)
  const pending = useRef(false)
  const payDay = nextPayDay(now)
  // TC-10jm-T05: mismo cálculo que el Resumen; "Pagas" incluye lo atrasado sin marcar.
  const paidThrough = paidUntil(cardPaidThrough, now)
  const { pending: card } = splitCredit(transactions, paidThrough)
  const dueCrc = dueBy(card.scheduleCrc, payDay)
  // REC-01jm-T06: un doble toque no lanza dos borrados (mismo bloqueo que el formulario).
  // REC-02jm-T03: "Pagado" comparte el bloqueo: una sola escritura a la vez.
  async function run(write: () => Promise<void>, done: string) {
    if (pending.current) return
    pending.current = true
    setDeleting(true)
    const failed = await saveWithToast(write, toast, done)
    pending.current = false
    setDeleting(false)
    if (!failed) reload()
  }
  return (
    <>
      {(card.crcCents > 0 || card.usdCents > 0) && (
        <ul className="dashboard-list" aria-label="Tarjeta de crédito">
          <li className="reminder-row">
            <span className="reminder-main">
              <CardDebtDialog transactions={transactions} paidThrough={paidThrough}>
                {/* CRC y USD nunca se suman: el USD va aparte, como en el Resumen. */}
                <span className="dashboard-text">
                  <strong>Tarjeta de crédito</strong>
                  {card.crcCents > 0 && <span>Pagas <span className="amount">{formatMoney(dueCrc, 'CRC')}</span> el {formatDay(payDay)}</span>}
                  {card.crcCents > 0 && <span className="muted">Deuda total <span className="amount">{formatMoney(card.crcCents, 'CRC')}</span></span>}
                  {card.usdCents > 0 && <span className="muted">En dólares <span className="amount">{formatMoney(card.usdCents, 'USD')}</span></span>}
                </span>
              </CardDebtDialog>
            </span>
            <span className="reminder-actions">
              <CardPaidButton pending={card} now={now} onSaved={onCardPaid} />
            </span>
          </li>
        </ul>
      )}
      {reminders.length === 0
        ? <p className="muted" style={{ margin: 0 }}>Aún no tienes recordatorios.</p>
        : <ul className="dashboard-list" aria-label="Pagos mensuales">
          {reminders.map((r) => (
            <li key={r.id} className="reminder-row">
              {/* REC-01jm-T09: los recordatorios de tarjeta abren el modal con toda la deuda. */}
              <span className="reminder-main">
                {isCardPayment(r.description)
                  ? <CardDebtDialog transactions={transactions} paidThrough={paidThrough}><ReminderText r={r} now={now} /></CardDebtDialog>
                  : <ReminderText r={r} now={now} />}
              </span>
              <span className="reminder-actions">
                {!isCardPayment(r.description) && <input type="checkbox" checked={r.reserve ?? false} disabled={deleting}
                  aria-label={`Apartar ${r.description} del saldo`} title="Apartar del saldo"
                  onChange={() => void run(() => setReminderReserve(r.id, !r.reserve), r.reserve ? 'Ya no se aparta' : 'Apartado del saldo')} />}
                <button type="button" className="secondary" disabled={deleting}
                  onClick={() => void run(() => markReminderPaid(r.id, nextDueOn(r.day, now, r.paidOn)), 'Marcado como pagado')}
                  aria-label={`Marcar ${r.description} como pagado`}>Pagado</button>
                <button type="button" className="secondary" disabled={deleting}
                  onClick={() => void run(() => deleteReminder(r.id), 'Recordatorio borrado')}
                  aria-label={`Borrar ${r.description}`}>Borrar</button>
              </span>
            </li>
          ))}
        </ul>}
      <ReminderForm onSaved={reload} debtCents={dueCrc} />
    </>
  )
}

function ReminderText({ r, now }: { r: Reminder; now: Date }) {
  return <>
    <span className="dashboard-text">
      <span>{r.description}</span>
      {/* nextDueOn da la fecha CR; a las 00:00 CR para que formatDay no la corra un día. */}
      <span className="muted">Próximo pago {formatDay(`${nextDueOn(r.day, now, r.paidOn)}T00:00:00-06:00`)} · día {r.day}</span>
    </span>
    <span className="amount">{formatMoney(r.amountCents, r.currency)}</span>
  </>
}
